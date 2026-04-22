import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCircleCheck,
  FaHeart,
  FaLocationDot,
  FaMinus,
  FaPlus,
  FaRegHeart,
  FaShieldHalved,
  FaStar,
  FaTruckFast,
} from "react-icons/fa6";
import { useLanguage } from "../context/LanguageContext";

const formatRupees = (value) => {
  try {
    return new Intl.NumberFormat("en-IN").format(value ?? 0);
  } catch {
    return String(value ?? 0);
  }
};

const buildDescription = (item) => {
  if (!item) {
    return "";
  }

  if (item.description) {
    return item.description;
  }

  if (item.kind === "puja") {
    return `Book ${item.title || item.name} with guided temple coordination, sankalp support, and a smooth booking experience for your family.`;
  }

  return `${item.name} is a carefully selected ${item.category?.toLowerCase() || "temple item"} suited for daily devotion, gifting, and sacred home rituals.`;
};

const renderDescription = (description) => {
  if (!description) {
    return null;
  }

  const lines = String(description)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const content = [];
  let bullets = [];

  const flushBullets = () => {
    if (!bullets.length) {
      return;
    }

    content.push(
      <ul key={`bullets-${content.length}`} className="item-detail-bullet-list">
        {bullets.map((line, index) => (
          <li key={`${line}-${index}`}>{line.replace(/^(â€¢|Ã¢â‚¬Â¢)\s*/, "")}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("â€¢") || line.startsWith("Ã¢â‚¬Â¢")) {
      bullets.push(line);
      return;
    }

    flushBullets();
    content.push(
      <p key={`${line}-${content.length}`} className="item-detail-description">
        {line}
      </p>
    );
  });

  flushBullets();
  return content;
};

const renderSpecList = (specifications) => {
  if (!Array.isArray(specifications) || !specifications.length) {
    return null;
  }

  return (
    <div className="item-detail-spec-list">
      {specifications.map((spec, index) => (
        <div key={`${spec.label}-${index}`} className="item-detail-spec-row">
          <span>{spec.label}</span>
          <strong>{spec.value}</strong>
        </div>
      ))}
    </div>
  );
};

const PriceBox = ({ price, oldPrice, discountLabel, taxInfo }) => {
  const computedDiscount =
    oldPrice && oldPrice > price ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF` : "";

  return (
    <div className="item-price-box">
      <div className="item-price-box-row">
        <strong>Rs. {formatRupees(price)}</strong>
        {oldPrice ? <span>Rs. {formatRupees(oldPrice)}</span> : null}
        {discountLabel || computedDiscount ? (
          <b className="item-discount-badge">{discountLabel || computedDiscount}</b>
        ) : null}
      </div>
      <p>{taxInfo}</p>
    </div>
  );
};

const OfferBox = ({ text }) => {
  if (!text) {
    return null;
  }

  return (
    <div className="item-offer-box">
      <FaCircleCheck />
      <span>{text}</span>
    </div>
  );
};

const QuantitySelector = ({ value, onDecrease, onIncrease }) => {
  const { t } = useLanguage();

  return (
    <div className="item-quantity-card">
      <span className="item-detail-label">{t("details.quantity", "Quantity")}</span>
      <div className="item-quantity-controls">
        <button type="button" className="item-qty-btn" onClick={onDecrease} aria-label="Decrease quantity">
          <FaMinus />
        </button>
        <strong>{value}</strong>
        <button type="button" className="item-qty-btn" onClick={onIncrease} aria-label="Increase quantity">
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

const DeliveryChecker = ({ value, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="item-delivery-card">
      <div className="item-delivery-head">
        <FaLocationDot />
        <span>{t("details.checkDelivery", "Check delivery availability")}</span>
      </div>
      <div className="item-delivery-form">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t("details.pincodePlaceholder", "Enter pincode")}
          value={value}
          onChange={onChange}
          aria-label={t("details.pincodePlaceholder", "Enter pincode")}
        />
        <button type="button">{t("details.check", "CHECK")}</button>
      </div>
    </div>
  );
};

const MarketplaceAvailability = ({ marketplaces }) => {
  const { t } = useLanguage();

  return (
    <div className="item-marketplace-card">
      <span className="item-detail-label">{t("details.alsoAvailableOn", "Also Available on:")}</span>
      <div className="item-marketplace-row">
        {marketplaces.map((marketplace) => (
          <span
            key={marketplace}
            className={`item-marketplace-badge ${
              marketplace.toLowerCase().includes("amazon") ? "item-marketplace-amazon" : "item-marketplace-flipkart"
            }`}
          >
            {marketplace}
          </span>
        ))}
      </div>
    </div>
  );
};

const AccordionItem = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="item-accordion-card">
    <button
      type="button"
      className="item-accordion-header"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span className="item-accordion-title">
        <Icon />
        {title}
      </span>
      <span className="item-accordion-toggle">{isOpen ? <FaMinus /> : <FaPlus />}</span>
    </button>
    <div className={`item-accordion-content ${isOpen ? "item-accordion-content-open" : ""}`}>
      <div className="item-accordion-content-inner">{children}</div>
    </div>
  </div>
);

const ProductDetailsAccordion = ({ descriptionContent, expandedSections, onToggleSection }) => {
  const { t } = useLanguage();

  return (
    <div className="item-accordion-stack">
      <AccordionItem
        title={t("details.productDescription", "Product Description")}
        icon={FaBoxOpen}
        isOpen={expandedSections.description}
        onToggle={() => onToggleSection("description")}
      >
        {descriptionContent ? <div className="item-accordion-extra-copy item-accordion-extra-copy-compact">{descriptionContent}</div> : null}
      </AccordionItem>

      <AccordionItem
        title={t("details.shipping", "Shipping")}
        icon={FaTruckFast}
        isOpen={expandedSections.shipping}
        onToggle={() => onToggleSection("shipping")}
      >
        <div className="item-shipping-list">
          <div className="item-shipping-row">
            <strong>{t("details.freeShipping", "Free Shipping")}</strong>
            <p>{t("details.freeShippingText", "Across India.")}</p>
          </div>
          <div className="item-shipping-row">
            <strong>{t("details.dispatch", "1-2 Days Dispatch")}</strong>
            <p>{t("details.dispatchText", "Orders ship quickly.")}</p>
          </div>
          <div className="item-shipping-row">
            <strong>{t("details.delivery", "2-5 Days Delivery")}</strong>
            <p>{t("details.deliveryText", "Metros: 2-3 days | Rest of India: 3-5 days.")}</p>
          </div>
        </div>
      </AccordionItem>

      <div className="item-secure-banner">
        <div className="item-secure-banner-icon">
          <FaShieldHalved />
        </div>
        <div>
          <strong>{t("details.securePayments", "100% Secure Payments")}</strong>
          <p>{t("details.securePaymentsText", "Your details are protected and safe with us")}</p>
        </div>
      </div>
    </div>
  );
};

const ProductCommercePanel = ({
  detail,
  onAddToCart,
  quantity,
  pincode,
  onQuantityDecrease,
  onQuantityIncrease,
  onPincodeChange,
  wished,
  onToggleWish,
  assuranceText,
}) => {
  const { t, translateCategory } = useLanguage();

  return (
    <>
    <div className="item-detail-title-block">
      <p className="auth-card-kicker">{translateCategory(detail.category)}</p>
      <h2>{detail.title}</h2>
      <div className="item-rating-row">
        <span className="item-rating-pill">
          <FaStar />
          {detail.rating}
        </span>
        <span className="item-rating-count">{detail.ratingsCount} {t("details.ratings", "Ratings")}</span>
      </div>
    </div>

    <PriceBox
      price={detail.price}
      oldPrice={detail.oldPrice}
      discountLabel={detail.badge}
      taxInfo={detail.taxInfo}
    />

    {detail.priceRangeLabel ? <p className="item-detail-price-range">{detail.priceRangeLabel}</p> : null}

    <OfferBox text={detail.offerText} />

    <MarketplaceAvailability marketplaces={detail.marketplaces} />

    <div className="item-return-card">
      <FaTruckFast />
      <span>{detail.returnPolicy}</span>
    </div>

    <DeliveryChecker value={pincode} onChange={onPincodeChange} />

    <div className="item-detail-action-grid">
      <QuantitySelector value={quantity} onDecrease={onQuantityDecrease} onIncrease={onQuantityIncrease} />
      <div className="item-highlight-card">
        <span className="item-detail-label">{t("details.keyHighlights", "Key Highlights")}</span>
        <strong>
          {detail.highlightLabel}: {detail.highlightValue}
        </strong>
      </div>
    </div>

    {detail.specifications.length ? (
      <div className="item-detail-sidebar-card">
        <h3>{t("details.productSpecifications", "Product Specifications")}</h3>
        {renderSpecList(detail.specifications)}
      </div>
    ) : null}

    <div className="item-detail-assurance">
      <div className="item-detail-assurance-card">
        <FaCircleCheck />
        <span>{assuranceText || "Temple support team will verify your order and dispatch details after booking."}</span>
      </div>
    </div>

    <div className="item-detail-cta-row">
      <button
        type="button"
        className="auth-submit-btn item-detail-cta item-detail-cta-premium"
        onClick={() => onAddToCart?.(quantity)}
      >
        {t("details.addToCart", "Add to Cart")}
        <FaArrowRight />
      </button>
      <button
        type="button"
        className={`item-wishlist-btn ${wished ? "item-wishlist-btn-active" : ""}`}
        onClick={onToggleWish}
        aria-label={wished ? t("details.removeFromWishlist", "Remove from wishlist") : t("details.addToWishlist", "Add to wishlist")}
      >
        {wished ? <FaHeart /> : <FaRegHeart />}
      </button>
    </div>
  </>
  );
};

const SimpleDetailPanel = ({ detail, onAddToCart, assuranceText }) => {
  const { t, translateCategory } = useLanguage();

  return (
  <>
    <p className="auth-card-kicker">{translateCategory(detail.category)}</p>
    <h2>{detail.title}</h2>
    <div className="item-detail-meta">
      <span>{detail.secondaryMeta}</span>
      {detail.rating ? <span>{detail.rating} {t("details.rated", "Rated")}</span> : null}
    </div>

    <div className="item-detail-price-row">
      <strong>Rs. {formatRupees(detail.price)}</strong>
      {detail.oldPrice ? <span>Rs. {formatRupees(detail.oldPrice)}</span> : null}
    </div>

    <div className="item-detail-description-wrap">{renderDescription(detail.description)}</div>

    <div className="item-detail-assurance">
      <div className="item-detail-assurance-card">
        <FaCircleCheck />
        <span>{assuranceText || "Temple support team will verify your booking and order details."}</span>
      </div>
    </div>

    <button type="button" className="auth-submit-btn item-detail-cta" onClick={() => onAddToCart?.(1)}>
      {detail.ctaLabel}
      <FaArrowRight />
    </button>
  </>
  );
};

const ItemDetailsContent = ({ item, onAddToCart, ctaLabel, assuranceText }) => {
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [wished, setWished] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    shipping: true,
  });

  const detail = useMemo(() => {
    if (!item) {
      return null;
    }

    const isPuja = item.kind === "puja";
    const specifications = Array.isArray(item.specifications) ? item.specifications : [];
    const heightSpec = specifications.find((spec) => String(spec.label || "").toLowerCase() === "height");
    const hasExtraProductDetails = !isPuja && (!!item.description || specifications.length > 0);

    return {
      title: isPuja ? item.title || item.name : item.name,
      category: item.category || (isPuja ? "Puja Booking" : "Temple Product"),
      image: item.image,
      images:
        Array.isArray(item.images) && item.images.length
          ? item.images.filter(Boolean)
          : [item.image].filter(Boolean),
      price: item.price,
      oldPrice: item.oldPrice,
      rating: item.rating || 4.5,
      ratingsCount: item.ratingsCount || 32,
      badge: item.badge || item.discount,
      secondaryMeta: isPuja ? item.date : t("details.premiumCollection", "Premium Temple Collection"),
      description: buildDescription(item),
      priceRangeLabel: item.priceRangeLabel || "",
      specifications,
      reviewsLabel: item.reviewsLabel || "Reviews (0)",
      hasExtraProductDetails,
      taxInfo: item.taxInfo || t("details.taxInfo", "Inclusive of all Taxes. GST included. FREE delivery over Rs. 499"),
      offerText: item.offerText || "",
      marketplaces: Array.isArray(item.marketplaces) && item.marketplaces.length ? item.marketplaces : ["Flipkart", "Amazon"],
      returnPolicy: item.returnPolicy || t("details.returnPolicy", "Easy 10 Day Return & Replacement Available"),
      highlightLabel: item.highlightLabel || t("details.height", "Height"),
      highlightValue: item.highlightValue || heightSpec?.value || "30 cm",
      ctaLabel: ctaLabel || (isPuja ? t("details.bookAndPlaceOrder", "Book & Place Order") : t("details.addToCart", "Add to Cart")),
      isPuja,
    };
  }, [ctaLabel, item, t]);

  useEffect(() => {
    setActiveImage(detail?.images?.[0] || detail?.image || "");
  }, [detail]);

  useEffect(() => {
    setQuantity(1);
    setPincode("");
    setWished(false);
    setExpandedSections({
      description: false,
      shipping: true,
    });
  }, [detail?.title]);

  if (!detail) {
    return null;
  }

  const handleAddToCart = (selectedQuantity) => {
    if (typeof onAddToCart !== "function") {
      return;
    }

    Array.from({ length: Math.max(1, selectedQuantity) }).forEach(() => {
      onAddToCart(item);
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  return (
    <>
      <div className="item-detail-media">
        <div className="item-detail-image-frame">
          <img src={activeImage || detail.image} alt={detail.title} className="item-detail-image" />
        </div>
        {detail.badge ? <span className="item-detail-badge">{detail.badge}</span> : null}
        {detail.images.length > 1 ? (
          <div className="item-detail-thumb-row">
            {detail.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`item-detail-thumb ${image === activeImage ? "item-detail-thumb-active" : ""}`}
                onClick={() => setActiveImage(image)}
                aria-label={`View image ${index + 1} of ${detail.title}`}
              >
                <img src={image} alt={`${detail.title} view ${index + 1}`} className="item-detail-thumb-image" />
              </button>
            ))}
          </div>
        ) : null}

        {!detail.isPuja && detail.hasExtraProductDetails ? (
          <div className="item-detail-inline-description">
            <ProductDetailsAccordion
              descriptionContent={renderDescription(detail.description)}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          </div>
        ) : null}
      </div>

      <div className="item-detail-copy">
        {detail.isPuja ? (
          <SimpleDetailPanel
            detail={detail}
            onAddToCart={handleAddToCart}
            assuranceText={assuranceText}
          />
        ) : (
          <ProductCommercePanel
            detail={detail}
            onAddToCart={handleAddToCart}
            quantity={quantity}
            pincode={pincode}
            onQuantityDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
            onQuantityIncrease={() => setQuantity((current) => current + 1)}
            onPincodeChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
            wished={wished}
            onToggleWish={() => setWished((current) => !current)}
            assuranceText={assuranceText}
          />
        )}
      </div>

      {detail.isPuja && detail.hasExtraProductDetails ? (
        <div className="item-detail-bottom-panel">
          <ProductDetailsAccordion
            descriptionContent={renderDescription(detail.description)}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
          />
        </div>
      ) : null}
    </>
  );
};

export default ItemDetailsContent;
