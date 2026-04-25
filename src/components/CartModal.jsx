import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaCircleCheck, FaMoneyBillWave, FaXmark } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { buildApiUrl } from "../lib/api";
import { appendAdminOrder } from "../lib/adminOrders";
import { appendOrderHistory } from "../lib/orderHistory";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;
const pincodePattern = /^\d{6}$/;
const adminWhatsAppNumber = (import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || "919911921125").replace(/\D/g, "");

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const groupCartItems = (cartItems) =>
  cartItems.reduce((items, item) => {
    const existingItem = items.find((entry) => entry.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      return items;
    }

    items.push({ ...item, quantity: 1 });
    return items;
  }, []);

const formatCustomerAddress = (customer) =>
  [
    customer.street?.trim(),
    customer.apartment?.trim(),
    [customer.city?.trim(), customer.state?.trim(), customer.pincode?.trim()].filter(Boolean).join(", "),
    customer.country?.trim(),
  ]
    .filter(Boolean)
    .join("\n");

const buildHistoryEntry = ({ cartItems, customer, summary, total, groupedItems, user }) => ({
  id: summary.orderId,
  orderId: summary.orderId,
  paymentId: summary.paymentId || "",
  method: summary.method,
  total,
  createdAt: new Date().toISOString(),
  status: "Confirmed",
  customer: {
    name: customer.name.trim(),
    email: customer.email.trim(),
    phone: customer.phone.trim(),
    address: formatCustomerAddress(customer),
  },
  items: groupedItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    price: item.price,
    image: item.image,
    date: item.date || "",
    pujaDate: item.pujaDate || "",
    pujaTime: item.pujaTime || "",
    pujaMode: item.pujaMode || "",
    kind: item.kind === "puja" ? "puja" : "product",
  })),
  itemCount: cartItems.length,
  userId: user?.uid || user?.email || "",
});

const notifyOrderParties = async (order) => {
  if (!order) {
    return;
  }

  try {
    await fetch(buildApiUrl("/api/notifications/order"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    });
  } catch (error) {
    console.error("Order notification failed", error);
  }
};

const buildWhatsAppOrderMessage = (order) => {
  if (!order) {
    return "";
  }

  const itemLines = (order.items || [])
    .map((item) => {
      const schedule =
        item.kind === "puja" && (item.pujaDate || item.pujaTime)
          ? ` | Puja Schedule: ${item.pujaDate || "-"} ${item.pujaTime || ""}`
          : "";
      const pujaMode = item.kind === "puja" && item.pujaMode ? ` | Puja Mode: ${item.pujaMode}` : "";

      return `- ${item.name} | Qty: ${item.quantity} | Rs. ${Number(item.price || 0) * Number(item.quantity || 0)}${schedule}${pujaMode}`;
    })
    .join("\n");

  return [
    "Order Confirmation - Shani Dham Mandir",
    "",
    `Order ID: ${order.orderId || "-"}`,
    `Payment ID: ${order.paymentId || "-"}`,
    `Payment Method: ${order.method || "-"}`,
    `Status: ${order.status || "Confirmed"}`,
    `Total: Rs. ${Number(order.total || 0).toLocaleString("en-IN")}`,
    "",
    "Customer Details",
    `Name: ${order.customer?.name || "-"}`,
    `Email: ${order.customer?.email || "-"}`,
    `Phone: ${order.customer?.phone || "-"}`,
    `Address: ${order.customer?.address || "-"}`,
    "",
    "Ordered Items",
    itemLines || "-",
  ].join("\n");
};

const openWhatsAppLink = (url) => {
  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

const CartModal = ({
  isOpen,
  cartItems,
  addToCart,
  removeFromCart,
  clearCart,
  onClose,
  onBrowseTempleProducts,
  onRequireAuth,
  defaultCheckoutOpen = false,
}) => {
  const { user } = useAuth();
  const { t, translateCategory } = useLanguage();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [placedOrder, setPlacedOrder] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    street: "",
    apartment: "",
    city: "",
    state: "Delhi",
    pincode: "",
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setCheckoutOpen(defaultCheckoutOpen && cartItems.length > 0);
    setPaymentMethod("cod");
    setSubmitting(false);
    setMessage({ type: "", text: "" });
    setPlacedOrder(null);
    setCustomer({
      name: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      country: "India",
      street: "",
      apartment: "",
      city: "",
      state: "Delhi",
      pincode: "",
    });

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [cartItems.length, defaultCheckoutOpen, isOpen, onClose, user]);

  const groupedItems = useMemo(() => groupCartItems(cartItems), [cartItems]);
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + (item?.price || 0), 0), [cartItems]);
  const formattedAddress = useMemo(() => formatCustomerAddress(customer), [customer]);
  const placedOrderWhatsAppMessage = useMemo(() => buildWhatsAppOrderMessage(placedOrder), [placedOrder]);

  if (!isOpen) {
    return null;
  }

  const validateCustomer = () => {
    if (!customer.name.trim()) {
      return t("cart.errors.fullNameRequired");
    }
    if (!emailPattern.test(customer.email.trim())) {
      return t("cart.errors.invalidEmail");
    }
    if (!phonePattern.test(customer.phone.trim())) {
      return t("cart.errors.invalidPhone");
    }
    if (!customer.country.trim()) {
      return t("cart.errors.countryRequired");
    }
    if (!customer.street.trim()) {
      return t("cart.errors.streetRequired");
    }
    if (!customer.city.trim()) {
      return t("cart.errors.cityRequired");
    }
    if (!customer.state.trim()) {
      return t("cart.errors.stateRequired");
    }
    if (!pincodePattern.test(customer.pincode.trim())) {
      return t("cart.errors.invalidPincode");
    }
    if (!formatCustomerAddress(customer)) {
      return t("cart.errors.addressRequired");
    }
    return "";
  };

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const requireSignedInUser = () => {
    if (user) {
      return true;
    }

    onClose?.();
    onRequireAuth?.();
    return false;
  };

  const finishOrder = (summary) => {
    const historyUserId = user?.uid || user?.email;
    const historyEntry = buildHistoryEntry({
      cartItems,
      customer,
      summary,
      total,
      groupedItems,
      user,
    });

    if (historyUserId) {
      appendOrderHistory(historyUserId, historyEntry);
    }
    appendAdminOrder(historyEntry);
    notifyOrderParties(historyEntry);

    setPlacedOrder(historyEntry);
    setCheckoutOpen(false);
    setMessage({ type: "success", text: t("cart.successPlaced") });
    clearCart?.();
    window.setTimeout(() => {
      window.alert(t("cart.orderPlacedPopup", "Item has been ordered. Kindly track it in My Account."));
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!requireSignedInUser()) {
      return;
    }

    const validationMessage = validateCustomer();
    if (validationMessage) {
      setMessage({ type: "error", text: validationMessage });
      return;
    }

    if (paymentMethod === "cod") {
      setSubmitting(true);
      window.setTimeout(() => {
        finishOrder({
          method: "Cash on Delivery",
          orderId: `COD-${Date.now()}`,
        });
        setSubmitting(false);
      }, 350);
      return;
    }

    setSubmitting(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setSubmitting(false);
      setMessage({ type: "error", text: t("cart.errors.loadRazorpay") });
      return;
    }

    try {
      const orderResponse = await fetch(buildApiUrl("/api/payments/razorpay/order"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          donationType: "Temple product order",
          receiptPrefix: "shop",
          donor: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim(),
          },
          notes: {
            orderType: "Temple Product Order",
            address: formattedAddress,
            itemCount: String(cartItems.length),
          },
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || t("cart.errors.createOrder"));
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Shani Dham Mandir",
        description: "Temple Product Order",
        order_id: orderData.order.id,
        handler: async (response) => {
          const verifyResponse = await fetch(buildApiUrl("/api/payments/razorpay/verify"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });

          const verification = await verifyResponse.json();
          if (!verifyResponse.ok || !verification.verified) {
            throw new Error(verification.message || t("cart.errors.verifyPayment"));
          }

          finishOrder({
            method: "Razorpay Online",
            orderId: verification.orderId,
            paymentId: verification.paymentId,
          });
          setSubmitting(false);
        },
        prefill: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          contact: customer.phone.trim(),
        },
        notes: {
          address: formattedAddress,
          orderType: "Temple Product Order",
        },
        theme: {
          color: "#8f1d14",
          backdrop_color: "#1f1309",
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.on("payment.failed", () => {
        setSubmitting(false);
        setMessage({ type: "error", text: t("cart.errors.paymentIncomplete") });
      });

      razorpay.open();
    } catch (error) {
      setSubmitting(false);
      setMessage({ type: "error", text: error.message || t("cart.errors.placeOrder") });
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div className="cart-modal-shell" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("cart.dialogLabel")}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label={t("cart.closeModal")}>
          <FaXmark />
        </button>

        <div className="cart-modal-head">
          <p className="auth-card-kicker">{t("cart.kicker")}</p>
          <h2>{t("cart.title")}</h2>
        </div>

        {placedOrder ? (
          <div className="cart-success-card">
            <FaCircleCheck />
            <div>
              <strong>{t("cart.successTitle", "Order Confirmed")}</strong>
              <span>{t("cart.successAccountHint", "Your order has been confirmed. Check My Account for status updates.")}</span>
              <span>{t("cart.paymentMethod")}: {placedOrder.method}</span>
              <span>{t("cart.orderId")}: {placedOrder.orderId}</span>
              {placedOrder.paymentId ? <span>{t("cart.paymentId")}: {placedOrder.paymentId}</span> : null}
              <div className="cart-success-actions">
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() =>
                    openWhatsAppLink(
                      `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(placedOrderWhatsAppMessage)}`
                    )
                  }
                >
                  {t("cart.whatsappAdmin", "Send on WhatsApp")}
                </button>
                <button
                  type="button"
                  className="auth-submit-btn cart-success-secondary-btn"
                  onClick={() =>
                    openWhatsAppLink(`https://wa.me/?text=${encodeURIComponent(placedOrderWhatsAppMessage)}`)
                  }
                >
                  {t("cart.whatsappShare", "Share Order on WhatsApp")}
                </button>
              </div>
            </div>
          </div>
        ) : groupedItems.length === 0 ? (
          <div className="cart-empty-card">
            <FaBoxOpen />
            <strong>{t("cart.emptyTitle")}</strong>
            <span>{t("cart.emptyText")}</span>
            <button
              type="button"
              className="auth-submit-btn cart-empty-btn"
              onClick={() => {
                onClose?.();
                onBrowseTempleProducts?.();
              }}
            >
              {t("cart.browse")}
            </button>
          </div>
        ) : (
          <>
            <div className="cart-modal-content">
              <div className="cart-modal-items">
                {groupedItems.map((item) => (
                  <div key={item.id} className="cart-modal-item">
                    <img src={item.image} alt={item.name} className="shop-cart-image" />
                    <div className="cart-modal-item-copy">
                      <strong>{item.name}</strong>
                      <span>{translateCategory(item.category)}</span>
                      {item.kind === "puja" && (item.pujaDate || item.pujaTime) ? (
                        <span>{t("details.pujaSchedule", "Puja Schedule")}: {item.pujaDate || "-"} {item.pujaTime || ""}</span>
                      ) : null}
                      {item.kind === "puja" && item.pujaMode ? (
                        <span>{t("details.pujaMode", "Puja Mode")}: {item.pujaMode}</span>
                      ) : null}
                      <b>{t("cart.qty")} {item.quantity} | Rs. {item.price * item.quantity}</b>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-qty-control" aria-label={t("cart.quantityControls", "Quantity controls", { name: item.name })}>
                        <button type="button" className="cart-qty-btn" onClick={() => removeFromCart?.(item.id)}>
                          -
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button type="button" className="cart-qty-btn" onClick={() => addToCart?.(item)}>
                          +
                        </button>
                      </div>
                      <button type="button" className="shop-cart-remove" onClick={() => removeFromCart?.(item.id)}>
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="cart-modal-summary">
                <div className="shop-cart-total-row">
                  <span>{t("cart.items")}</span>
                  <strong>{cartItems.length}</strong>
                </div>
                <div className="shop-cart-total-row shop-cart-total-row-final">
                  <span>{t("cart.total")}</span>
                  <strong>Rs. {total}</strong>
                </div>

                {!checkoutOpen ? (
                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={() => {
                      if (!requireSignedInUser()) {
                        return;
                      }

                      setCheckoutOpen(true);
                    }}
                  >
                    {t("cart.placeOrder")}
                  </button>
                ) : (
                  <div className="cart-checkout-form">
                    <label className="auth-field">
                      <span>{t("cart.name")}</span>
                      <input type="text" name="name" value={customer.name} onChange={handleCustomerChange} placeholder={t("cart.fullNamePlaceholder")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.email")}</span>
                      <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} placeholder={t("cart.emailPlaceholder")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.phone")}</span>
                      <input type="tel" name="phone" value={customer.phone} onChange={handleCustomerChange} placeholder={t("cart.phonePlaceholder")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.country", "Country / Region *")}</span>
                      <input type="text" name="country" value={customer.country} onChange={handleCustomerChange} placeholder={t("cart.countryPlaceholder", "India")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.street", "Street address *")}</span>
                      <input type="text" name="street" value={customer.street} onChange={handleCustomerChange} placeholder={t("cart.streetPlaceholder", "House number and street name")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.apartment", "Apartment, suite, unit, etc. (optional)")}</span>
                      <input
                        type="text"
                        name="apartment"
                        value={customer.apartment}
                        onChange={handleCustomerChange}
                        placeholder={t("cart.apartmentPlaceholder", "Apartment, suite, unit, etc. (optional)")}
                      />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.city", "Town / City *")}</span>
                      <input type="text" name="city" value={customer.city} onChange={handleCustomerChange} placeholder={t("cart.cityPlaceholder", "Town / City")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.state", "State *")}</span>
                      <input type="text" name="state" value={customer.state} onChange={handleCustomerChange} placeholder={t("cart.statePlaceholder", "Delhi")} />
                    </label>
                    <label className="auth-field">
                      <span>{t("cart.pincode", "PIN Code *")}</span>
                      <input type="text" inputMode="numeric" maxLength="6" name="pincode" value={customer.pincode} onChange={handleCustomerChange} placeholder={t("cart.pincodePlaceholder", "PIN Code")} />
                    </label>

                    <div className="cart-payment-toggle">
                      <button
                        type="button"
                        className={paymentMethod === "cod" ? "cart-payment-btn cart-payment-btn-active" : "cart-payment-btn"}
                        onClick={() => setPaymentMethod("cod")}
                      >
                        <FaMoneyBillWave />
                        {t("cart.cod")}
                      </button>
                      <button
                        type="button"
                        className={paymentMethod === "online" ? "cart-payment-btn cart-payment-btn-active" : "cart-payment-btn"}
                        onClick={() => setPaymentMethod("online")}
                      >
                        {t("cart.razorpay")}
                      </button>
                    </div>

                    {message.text ? (
                      <div className={`auth-message auth-message-${message.type || "info"}`}>{message.text}</div>
                    ) : null}

                    <button type="button" className="auth-submit-btn" onClick={handlePlaceOrder} disabled={submitting}>
                      {submitting ? t("cart.processing") : paymentMethod === "cod" ? t("cart.confirmCod") : t("cart.payRazorpay")}
                    </button>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;
