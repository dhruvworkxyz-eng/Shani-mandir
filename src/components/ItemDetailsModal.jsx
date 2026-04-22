import React, { useEffect } from "react";
import { FaXmark } from "react-icons/fa6";
import ItemDetailsContent from "./ItemDetailsContent";

const ItemDetailsModal = ({ isOpen, item, onClose, onAddToCart }) => {
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

  if (!isOpen || !item) {
    return null;
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="item-detail-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={item.title || item.name}
      >
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close item details">
          <FaXmark />
        </button>
        <ItemDetailsContent item={item} onAddToCart={onAddToCart} />
      </div>
    </div>
  );
};

export default ItemDetailsModal;
