import React, { useEffect } from "react";
import { FaXmark } from "react-icons/fa6";
import logo from "../images/navd.png";
import { useLanguage } from "../context/LanguageContext";
import AuthForm from "./AuthForm";

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div className="auth-modal-shell" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("auth.dialogLabel")}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label={t("auth.closeModal")}>
          <FaXmark />
        </button>

        <div className="auth-modal-brand">
          <img src={logo} alt="Shani Dham Mandir" className="auth-brand-logo" />
          <span>Shani Dham Mandir</span>
        </div>

        <AuthForm compact onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default AuthModal;
