import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const whatsappNumber = (import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || "919911921125").replace(/\D/g, "");

const GlobalWhatsAppButton = () => {
  const { t } = useLanguage();
  const message = encodeURIComponent(t("landing.waConsult"));

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="global-whatsapp-btn"
      aria-label={t("contact.whatsapp", "Chat on WhatsApp")}
    >
      <FaWhatsapp size={28} />
      <span>{t("contact.whatsapp", "Chat on WhatsApp")}</span>
    </a>
  );
};

export default GlobalWhatsAppButton;
