import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck, FaEnvelope, FaShieldAlt, FaUserCircle } from "react-icons/fa";
import {
  FaCircleCheck,
  FaMagnifyingGlass,
  FaRightFromBracket,
  FaTruckFast,
} from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import logo from "../images/navd.png";
import { getAdminOrders, updateAdminOrderStatus } from "../lib/adminOrders";
import { getDonationHistory, getOrderHistory, subscribeToOrderHistory, updateOrderHistoryEntry } from "../lib/orderHistory";

const AccountPage = () => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [trackingQuery, setTrackingQuery] = useState("");
  const [orderHistory, setOrderHistory] = useState(() => getOrderHistory(user?.uid || user?.email));

  const displayName = useMemo(() => {
    return user?.displayName?.trim() || user?.email?.split("@")[0] || t("account.devotee");
  }, [t, user]);

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [displayName]);

  const joinedDate = useMemo(() => {
    if (!user?.metadata?.creationTime) {
      return t("account.recentlyJoined");
    }

    return new Date(user.metadata.creationTime).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [language, t, user]);

  const lastLogin = useMemo(() => {
    if (!user?.metadata?.lastSignInTime) {
      return t("account.justNow");
    }

    return new Date(user.metadata.lastSignInTime).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [language, t, user]);

  const donationHistory = useMemo(() => getDonationHistory(user?.uid || user?.email), [user]);

  useEffect(() => {
    const historyUserId = user?.uid || user?.email;

    setOrderHistory(getOrderHistory(historyUserId));

    if (!historyUserId) {
      return undefined;
    }

    return subscribeToOrderHistory(() => {
      setOrderHistory(getOrderHistory(historyUserId));
    });
  }, [user]);

  useEffect(() => {
    if (!trackingQuery.trim() && orderHistory.length > 0) {
      setTrackingQuery(orderHistory[0].orderId || "");
    }
  }, [orderHistory, trackingQuery]);

  const productOrders = useMemo(
    () => orderHistory.filter((entry) => entry.items?.some((item) => item.kind !== "puja")),
    [orderHistory]
  );

  const pujaBookings = useMemo(
    () => orderHistory.filter((entry) => entry.items?.some((item) => item.kind === "puja")),
    [orderHistory]
  );

  const formatDateTime = (value) => {
    if (!value) {
      return t("account.justNow");
    }

    return new Date(value).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const trackedOrder = useMemo(() => {
    const query = trackingQuery.trim().toLowerCase();

    if (!query) {
      return null;
    }

    return (
      orderHistory.find((entry) => {
        const orderId = String(entry.orderId || "").toLowerCase();
        const paymentId = String(entry.paymentId || "").toLowerCase();
        return orderId === query || paymentId === query;
      }) || null
    );
  }, [orderHistory, trackingQuery]);

  const getTrackingStage = (entry) => {
    const status = String(entry?.status || "").toLowerCase();

    if (status.includes("cancel")) {
      return 0;
    }

    if (status.includes("deliver") || status.includes("complete")) {
      return 3;
    }

    if (status.includes("dispatch") || status.includes("ship") || status.includes("schedule")) {
      return 2;
    }

    if (status.includes("process") || status.includes("verified") || status.includes("prepare")) {
      return 1;
    }

    return 0;
  };

  const buildTrackingSteps = (entry) => {
    const containsPuja = entry?.items?.some((item) => item.kind === "puja");
    const stage = getTrackingStage(entry);
    const labels = containsPuja
      ? [
          t("account.trackStepBooked", "Booking Confirmed"),
          t("account.trackStepVerified", "Sankalp Verified"),
          t("account.trackStepScheduled", "Puja Scheduled"),
          t("account.trackStepCompleted", "Completed"),
        ]
      : [
          t("account.trackStepOrderPlaced", "Order Confirmed"),
          t("account.trackStepProcessing", "Preparing Order"),
          t("account.trackStepDispatched", "Dispatched"),
          t("account.trackStepDelivered", "Delivered"),
        ];

    return labels.map((label, index) => ({
      label,
      state: index < stage ? "completed" : index === stage ? "active" : "pending",
    }));
  };

  const isCancelledOrder = (entry) => String(entry?.status || "").toLowerCase().includes("cancel");

  const canCancelOrder = (entry) => {
    if (!entry || entry.items?.some((item) => item.kind === "puja")) {
      return false;
    }

    const status = String(entry.status || "").toLowerCase();
    return !status.includes("cancel") && !status.includes("deliver") && !status.includes("complete") && !status.includes("dispatch") && !status.includes("ship");
  };

  const getStatusClassName = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus.includes("cancel")) {
      return "account-history-status account-history-status-cancelled";
    }

    if (normalizedStatus.includes("deliver") || normalizedStatus.includes("complete")) {
      return "account-history-status account-history-status-completed";
    }

    return "account-history-status account-history-status-open";
  };

  const handleCancelOrder = (entry) => {
    const historyUserId = user?.uid || user?.email;

    if (!historyUserId || !entry?.orderId || !canCancelOrder(entry)) {
      return;
    }

    const shouldCancel = window.confirm(
      t("account.cancelOrderConfirm", "Do you want to cancel this order?")
    );

    if (!shouldCancel) {
      return;
    }

    const updates = {
      status: "Cancelled",
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateOrderHistoryEntry(historyUserId, entry.orderId, updates);

    const matchingAdminOrder = getAdminOrders().find((order) => order.orderId === entry.orderId);
    if (matchingAdminOrder) {
      updateAdminOrderStatus(entry.orderId, "Cancelled");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderTrackingSection = () => {
    const hasOrders = orderHistory.length > 0;

    return (
      <section id="track-order" className="account-card account-card-tracker">
        <div className="account-card-head">
          <h2>{t("account.trackOrderTitle", "Track Order")}</h2>
          <p>{t("account.trackOrderText", "Enter your order ID or payment ID to trace the latest order progress.")}</p>
        </div>

        {hasOrders ? (
          <>
            <form
              className="account-track-form"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div className="account-track-input-wrap">
                <FaMagnifyingGlass />
                <input
                  type="text"
                  value={trackingQuery}
                  onChange={(event) => setTrackingQuery(event.target.value)}
                  placeholder={t("account.trackOrderPlaceholder", "Enter order ID")}
                  aria-label={t("account.trackOrderPlaceholder", "Enter order ID")}
                />
              </div>
              <button type="submit" className="account-track-submit">
                {t("account.trackOrderButton", "Track")}
              </button>
            </form>

            {trackedOrder ? (
              <div className="account-track-result">
                <div className="account-track-summary">
                  <div>
                    <strong>{trackedOrder.orderId}</strong>
                    <span>{formatDateTime(trackedOrder.createdAt)}</span>
                  </div>
                  <span className={getStatusClassName(trackedOrder.status)}>{trackedOrder.status || t("account.confirmed", "Confirmed")}</span>
                </div>

                <div className="account-track-meta">
                  <span>{t("cart.paymentMethod", "Payment Method")}: {trackedOrder.method}</span>
                  <span>{t("cart.total", "Total")}: Rs. {trackedOrder.total}</span>
                  {trackedOrder.paymentId ? <span>{t("cart.paymentId", "Payment ID")}: {trackedOrder.paymentId}</span> : null}
                </div>

                {isCancelledOrder(trackedOrder) ? (
                  <div className="account-history-empty account-history-empty-cancelled">
                    {t("account.cancelledOrderMessage", "This order has been cancelled and will no longer be processed.")}
                  </div>
                ) : (
                  <div className="account-track-timeline">
                    {buildTrackingSteps(trackedOrder).map((step) => (
                      <div key={step.label} className={`account-track-step account-track-step-${step.state}`}>
                        <div className="account-track-step-icon">
                          {step.state === "pending" ? <FaTruckFast /> : <FaCircleCheck />}
                        </div>
                        <div className="account-track-step-copy">
                          <strong>{step.label}</strong>
                          <span>
                            {step.state === "completed"
                              ? t("account.stepCompleted", "Completed")
                              : step.state === "active"
                                ? t("account.stepInProgress", "In progress")
                                : t("account.stepPending", "Pending")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canCancelOrder(trackedOrder) ? (
                  <div className="account-order-actions">
                    <button type="button" className="account-cancel-order-btn" onClick={() => handleCancelOrder(trackedOrder)}>
                      {t("account.cancelOrder", "Cancel Order")}
                    </button>
                  </div>
                ) : null}

                <div className="account-history-items">
                  {trackedOrder.items.map((item) => (
                    <div key={`${trackedOrder.id}-${item.id}`} className="account-history-item">
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {item.category}
                          {item.date ? ` - ${item.date}` : ""}
                          {item.kind === "puja" && (item.pujaDate || item.pujaTime)
                            ? ` - Puja Schedule: ${item.pujaDate || "-"} ${item.pujaTime || ""}`
                            : ""}
                          {item.kind === "puja" && item.pujaMode ? ` - Puja Mode: ${item.pujaMode}` : ""}
                        </span>
                      </div>
                      <b>
                        {t("cart.qty", "Qty")} {item.quantity} - Rs. {item.price * item.quantity}
                      </b>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="account-history-empty">
                {t("account.trackOrderNoMatch", "No order was found for that order ID. Please check and try again.")}
              </div>
            )}
          </>
        ) : (
          <div className="account-history-empty">
            {t("account.trackOrderEmpty", "No orders are available to track yet. Your confirmed orders will appear here.")}
          </div>
        )}
      </section>
    );
  };

  const renderHistorySection = (entries, type, sectionId) => {
    const isPuja = type === "puja";

    return (
      <section id={sectionId} className="account-card">
        <div className="account-card-head">
          <h2>{isPuja ? t("account.pujaHistoryTitle", "Puja Booking History") : t("account.orderHistoryTitle", "Order History")}</h2>
          <p>
            {isPuja
              ? t("account.pujaHistoryText", "Track past puja bookings, booking dates, and payment details.")
              : t("account.orderHistoryText", "Track your past temple product orders and payment details.")}
          </p>
        </div>

        {entries.length > 0 ? (
          <div className="account-history-list">
            {entries.map((entry) => {
              const visibleItems = entry.items.filter((item) => (isPuja ? item.kind === "puja" : item.kind !== "puja"));

              return (
                <article key={`${type}-${entry.id}`} className="account-history-card">
                  <div className="account-history-head">
                    <div>
                      <strong>{entry.orderId}</strong>
                      <span>{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <span className={getStatusClassName(entry.status)}>{entry.status || t("account.confirmed", "Confirmed")}</span>
                  </div>

                  <div className="account-history-meta">
                    <span>{t("cart.paymentMethod", "Payment Method")}: {entry.method}</span>
                    <span>{t("cart.total", "Total")}: Rs. {entry.total}</span>
                  </div>

                  <div className="account-history-items">
                    {visibleItems.map((item) => (
                      <div key={`${entry.id}-${item.id}`} className="account-history-item">
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            {item.category}
                            {item.date ? ` • ${item.date}` : ""}
                            {item.kind === "puja" && (item.pujaDate || item.pujaTime)
                              ? ` • Puja Schedule: ${item.pujaDate || "-"} ${item.pujaTime || ""}`
                              : ""}
                          </span>
                        </div>
                        <b>
                          {t("cart.qty", "Qty")} {item.quantity} • Rs. {item.price * item.quantity}
                        </b>
                      </div>
                    ))}
                  </div>

                  {!isPuja && canCancelOrder(entry) ? (
                    <div className="account-order-actions">
                      <button type="button" className="account-cancel-order-btn" onClick={() => handleCancelOrder(entry)}>
                        {t("account.cancelOrder", "Cancel Order")}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="account-history-empty">
            {isPuja
              ? t("account.noPujaHistory", "No puja bookings yet. Your booked pujas will appear here.")
              : t("account.noOrderHistory", "No product orders yet. Your placed orders will appear here.")}
          </div>
        )}
      </section>
    );
  };

  const renderDonationSection = () => (
    <section id="temple-donation-history" className="account-card">
      <div className="account-card-head">
        <h2>{t("account.donationHistoryTitle", "Temple Donation History")}</h2>
        <p>{t("account.donationHistoryText", "View your past temple donations, payment references, and contributed amounts.")}</p>
      </div>

      {donationHistory.length > 0 ? (
        <div className="account-history-list">
          {donationHistory.map((entry) => (
            <article key={`donation-${entry.id}`} className="account-history-card">
              <div className="account-history-head">
                <div>
                  <strong>{entry.title}</strong>
                  <span>{formatDateTime(entry.createdAt)}</span>
                </div>
                <span className="account-history-status">{entry.status || t("donation.verifiedTitle", "Verified")}</span>
              </div>

              <div className="account-history-meta">
                <span>{t("donation.amount", "Amount")}: Rs. {entry.amount}</span>
                <span>{t("donation.paymentId", "Payment ID")}: {entry.paymentId || "-"}</span>
                <span>{t("donation.orderId", "Order ID")}: {entry.orderId}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="account-history-empty">
          {t("account.noDonationHistory", "No temple donations yet. Your successful donations will appear here.")}
        </div>
      )}
    </section>
  );

  return (
    <main className="account-page">
      <div className="account-page-glow account-page-glow-left" />
      <div className="account-page-glow account-page-glow-right" />

      <section className="account-shell">
        <div className="account-topbar">
          <div className="account-brand">
            <img src={logo} alt="Shani Dham Mandir" />
            <div>
              <span>Shani Dham Mandir</span>
              <small>{t("account.memberDashboard")}</small>
            </div>
          </div>

          <Link to="/" className="account-back-link">
            <FaArrowLeft />
            {t("account.backHome")}
          </Link>
        </div>

        <div className="account-hero-card">
          <div className="account-avatar">{initials || "U"}</div>
          <div className="account-hero-copy">
            <p className="account-kicker">{t("account.memberSpace")}</p>
            <h1>{displayName}</h1>
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="account-grid">
          <section className="account-card account-card-primary">
            <div className="account-card-head">
              <h2>{t("account.overviewTitle")}</h2>
              <p>{t("account.overviewText")}</p>
            </div>

            <div className="account-info-list">
              <div className="account-info-item">
                <FaUserCircle />
                <div>
                  <strong>{t("account.name")}</strong>
                  <span>{displayName}</span>
                </div>
              </div>
              <div className="account-info-item">
                <FaEnvelope />
                <div>
                  <strong>{t("account.email")}</strong>
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className="account-info-item">
                <FaCalendarCheck />
                <div>
                  <strong>{t("account.joined")}</strong>
                  <span>{joinedDate}</span>
                </div>
              </div>
              <div className="account-info-item">
                <FaShieldAlt />
                <div>
                  <strong>{t("account.lastLogin")}</strong>
                  <span>{lastLogin}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="account-card">
            <div className="account-card-head">
              <h2>{t("account.quickActions")}</h2>
              <p>{t("account.quickActionsText")}</p>
            </div>

            <div className="account-action-list">
              <a href="#track-order" className="account-action-tile">
                <strong>{t("account.trackOrderTitle", "Track Order")}</strong>
                <span>{t("account.trackOrderActionText", "Open the order tracker and trace your order by order ID.")}</span>
              </a>
              <Link to="/#puja" className="account-action-tile">
                <strong>{t("account.pujaTitle")}</strong>
                <span>{t("account.pujaText")}</span>
              </Link>
              <Link to="/#history" className="account-action-tile">
                <strong>{t("account.storeTitle")}</strong>
                <span>{t("account.storeText")}</span>
              </Link>
              <Link to="/#contact" className="account-action-tile">
                <strong>{t("account.contactTitle")}</strong>
                <span>{t("account.contactText")}</span>
              </Link>
            </div>

            <button type="button" className="account-logout-btn" onClick={handleLogout}>
              <FaRightFromBracket />
              {t("account.logout")}
            </button>
          </section>
        </div>

        <div className="account-history-grid">
          {renderTrackingSection()}
          {renderHistorySection(productOrders, "product", "order-history")}
          {renderHistorySection(pujaBookings, "puja", "puja-history")}
          {renderDonationSection()}
        </div>
      </section>
    </main>
  );
};

export default AccountPage;
