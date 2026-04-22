import React, { useEffect, useMemo, useState } from "react";
import { FaCircleCheck, FaXmark } from "react-icons/fa6";
import donations from "../data/donations";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { buildApiUrl } from "../lib/api";
import { appendDonationHistory } from "../lib/orderHistory";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  amount: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

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

const getDonationCopy = (donation, t) => ({
  title: t(`donation.options.${donation.id}Title`, donation.title),
  description: t(`donation.options.${donation.id}Description`, donation.description),
});

const buildDonationHistoryEntry = ({ amountInRupees, formData, selectedDonation, verification, user }) => ({
  id: verification.orderId,
  orderId: verification.orderId,
  paymentId: verification.paymentId || "",
  amount: amountInRupees,
  title: selectedDonation.title,
  category: selectedDonation.id,
  createdAt: new Date().toISOString(),
  status: "Verified",
  donor: {
    name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
  },
  userId: user?.uid || user?.email || "",
});

const DonationModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedDonation, setSelectedDonation] = useState(donations[0]);
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [paymentState, setPaymentState] = useState("idle");
  const [verifiedPayment, setVerifiedPayment] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setSelectedDonation(donations[0]);
    setFormData({
      name: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      amount: String(donations[0].amount),
    });
    setMessage({ type: "", text: "" });
    setPaymentState("idle");
    setVerifiedPayment(null);

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
  }, [isOpen, onClose, user]);

  const amountInRupees = useMemo(() => Number(formData.amount || 0), [formData.amount]);

  if (!isOpen) {
    return null;
  }

  const validate = () => {
    if (!formData.name.trim()) {
      return t("donation.errors.fullNameRequired");
    }
    if (!emailPattern.test(formData.email.trim())) {
      return t("donation.errors.invalidEmail");
    }
    if (!phonePattern.test(formData.phone.trim())) {
      return t("donation.errors.invalidPhone");
    }
    if (!amountInRupees || amountInRupees < 1) {
      return t("donation.errors.invalidAmount");
    }
    return "";
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleDonationSelect = (donation) => {
    setSelectedDonation(donation);
    setFormData((current) => ({ ...current, amount: String(donation.amount) }));
    setMessage({ type: "", text: "" });
  };

  const handlePayment = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setMessage({ type: "error", text: validationMessage });
      return;
    }

    setPaymentState("creating-order");
    setMessage({ type: "", text: "" });

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaymentState("idle");
      setMessage({ type: "error", text: t("donation.errors.loadRazorpay") });
      return;
    }

    try {
      const orderResponse = await fetch(buildApiUrl("/api/payments/razorpay/order"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInRupees,
          donationType: selectedDonation.title,
          donor: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
          },
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || t("donation.errors.createOrder"));
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Shani Dham Mandir",
        description: selectedDonation.title,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            setPaymentState("verifying");

            const verifyResponse = await fetch(buildApiUrl("/api/payments/razorpay/verify"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                donationType: selectedDonation.title,
                amount: amountInRupees,
                donor: {
                  name: formData.name.trim(),
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                },
                ...response,
              }),
            });

            const verification = await verifyResponse.json();
            if (!verifyResponse.ok || !verification.verified) {
              throw new Error(verification.message || t("donation.errors.verifyPayment"));
            }

            const historyUserId = user?.uid || user?.email;
            if (historyUserId) {
              appendDonationHistory(
                historyUserId,
                buildDonationHistoryEntry({
                  amountInRupees,
                  formData,
                  selectedDonation,
                  verification,
                  user,
                })
              );
            }

            setVerifiedPayment(verification);
            setPaymentState("verified");
            setMessage({ type: "success", text: t("donation.successVerified") });
          } catch (error) {
            setPaymentState("idle");
            setMessage({ type: "error", text: error.message || t("donation.errors.verificationFailed") });
          }
        },
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        notes: {
          donationType: selectedDonation.title,
        },
        theme: {
          color: "#c2410c",
          backdrop_color: "#1f1309",
        },
        modal: {
          ondismiss: () => {
            setPaymentState("idle");
          },
        },
      });

      razorpay.on("payment.failed", () => {
        setPaymentState("idle");
        setMessage({ type: "error", text: t("donation.errors.paymentIncomplete") });
      });

      razorpay.open();
    } catch (error) {
      setPaymentState("idle");
      setMessage({
        type: "error",
        text: error.message || t("donation.errors.startPayment"),
      });
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div className="donation-modal-shell" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("donation.dialogLabel")}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label={t("donation.closeModal")}>
          <FaXmark />
        </button>

        <div className="donation-modal-head">
          <p className="auth-card-kicker">{t("donation.kicker")}</p>
          <h2>{t("donation.title")}</h2>
          <span>{t("donation.subtitle")}</span>
        </div>

        <div className="donation-option-grid">
          {donations.map((donation) => (
            <button
              key={donation.id}
              type="button"
              className={selectedDonation.id === donation.id ? "donation-option donation-option-active" : "donation-option"}
              onClick={() => handleDonationSelect(donation)}
            >
              <img src={donation.image} alt={getDonationCopy(donation, t).title} className="donation-option-image" />
              <div className="donation-option-copy">
                <strong>{getDonationCopy(donation, t).title}</strong>
                <span>{getDonationCopy(donation, t).description}</span>
                <b>{t("donation.suggested")}: Rs. {donation.amount}</b>
              </div>
            </button>
          ))}
        </div>

        <div className="donation-form-card">
          <div className="donation-form-grid">
            <label className="auth-field">
              <span>{t("donation.name")}</span>
              <input type="text" name="name" value={formData.name} onChange={handleFieldChange} placeholder={t("donation.fullNamePlaceholder")} />
            </label>
            <label className="auth-field">
              <span>{t("donation.email")}</span>
              <input type="email" name="email" value={formData.email} onChange={handleFieldChange} placeholder={t("donation.emailPlaceholder")} />
            </label>
            <label className="auth-field">
              <span>{t("donation.phone")}</span>
              <input type="tel" name="phone" value={formData.phone} onChange={handleFieldChange} placeholder={t("donation.phonePlaceholder")} />
            </label>
            <label className="auth-field">
              <span>{t("donation.amount")}</span>
              <input type="number" min="1" name="amount" value={formData.amount} onChange={handleFieldChange} placeholder={t("donation.amountPlaceholder")} />
            </label>
          </div>

          {message.text ? (
            <div className={`auth-message auth-message-${message.type || "info"}`}>{message.text}</div>
          ) : null}

          {verifiedPayment ? (
            <div className="donation-verified-card">
              <FaCircleCheck />
              <div>
                <strong>{t("donation.verifiedTitle")}</strong>
                <span>{t("donation.paymentId")}: {verifiedPayment.paymentId}</span>
                <span>{t("donation.orderId")}: {verifiedPayment.orderId}</span>
              </div>
            </div>
          ) : null}

          <button type="button" className="auth-submit-btn donation-pay-btn" onClick={handlePayment} disabled={paymentState === "creating-order" || paymentState === "verifying"}>
            {paymentState === "creating-order"
              ? t("donation.preparing")
              : paymentState === "verifying"
                ? t("donation.verifying")
                : t("donation.donateNow")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
