import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCircleCheck,
  FaHeart,
  FaMinus,
  FaPlus,
  FaRegHeart,
  FaShieldHalved,
  FaStar,
  FaTruckFast,
} from "react-icons/fa6";
import SafeCheckout from "./SafeCheckout";
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

  const bulletPrefixes = ["-"];
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
        {bullets.map((line, index) => {
          const cleanedLine = bulletPrefixes.reduce((value, prefix) => {
            return value.startsWith(prefix) ? value.slice(prefix.length).trim() : value;
          }, line);

          return <li key={`${line}-${index}`}>{cleanedLine}</li>;
        })}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line) => {
    if (bulletPrefixes.some((prefix) => line.startsWith(prefix))) {
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

const renderBenefitsList = (benefits) => {
  if (!Array.isArray(benefits) || !benefits.length) {
    return null;
  }

  return (
    <ul className="item-detail-benefits-list">
      {benefits.map((benefit, index) => (
        <li key={`${benefit}-${index}`}>
          <FaCircleCheck />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
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

const PriceOptionSelector = ({ options, selectedOption, onSelect }) => {
  const { t } = useLanguage();

  if (!Array.isArray(options) || !options.length) {
    return null;
  }

  return (
    <div className="item-price-options-card">
      <span className="item-detail-label">{t("details.selectWeight", "Select Weight")}</span>
      <div className="item-price-options-row">
        {options.map((option) => {
          const isActive = selectedOption?.label === option.label;

          return (
            <button
              key={option.label}
              type="button"
              className={`item-price-option-btn ${isActive ? "item-price-option-btn-active" : ""}`}
              onClick={() => onSelect?.(option)}
            >
              <strong>{option.label}</strong>
              <span>Rs. {formatRupees(option.price)}</span>
            </button>
          );
        })}
      </div>
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
  selectedPrice,
  selectedPriceOption,
  onSelectPriceOption,
  onAddToCart,
  quantity,
  onQuantityDecrease,
  onQuantityIncrease,
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
      price={selectedPrice}
      oldPrice={detail.oldPrice}
      discountLabel={detail.badge}
      taxInfo={detail.taxInfo}
    />

    <PriceOptionSelector
      options={detail.priceOptions}
      selectedOption={selectedPriceOption}
      onSelect={onSelectPriceOption}
    />

    {detail.priceRangeLabel ? <p className="item-detail-price-range">{detail.priceRangeLabel}</p> : null}

    <OfferBox text={detail.offerText} />

    <div className="item-return-card">
      <FaTruckFast />
      <span>{detail.returnPolicy}</span>
    </div>

    <div className="item-detail-action-grid">
      <QuantitySelector value={quantity} onDecrease={onQuantityDecrease} onIncrease={onQuantityIncrease} />
      {detail.highlightValue ? (
        <div className="item-highlight-card">
          <span className="item-detail-label">{t("details.keyHighlights", "Key Highlights")}</span>
          <strong>
            {detail.highlightLabel}: {detail.highlightValue}
          </strong>
        </div>
      ) : null}
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

    <div className="item-detail-purchase-row">
      <SafeCheckout />
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
    </div>
  </>
  );
};

const SimpleDetailPanel = ({
  detail,
  onAddToCart,
  assuranceText,
  pujaDate,
  pujaTime,
  pujaMode,
  onPujaDateChange,
  onPujaTimeChange,
  onPujaModeChange,
  pujaScheduleMessage,
  minPujaDate,
}) => {
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

    {detail.benefits.length ? (
      <div className="item-detail-sidebar-card">
        <h3>{t("details.pujaBenefits", "Puja Benefits")}</h3>
        {renderBenefitsList(detail.benefits)}
      </div>
    ) : null}

    <div className="item-detail-description-wrap">{renderDescription(detail.description)}</div>

    <div className="puja-schedule-card">
      <h3>{t("details.choosePujaSchedule", "Choose Puja Date & Time")}</h3>
      <div className="puja-schedule-grid">
        <label className="auth-field">
          <span>{t("details.pujaDate", "Puja Date")}</span>
          <input type="date" value={pujaDate} min={minPujaDate} onChange={onPujaDateChange} />
        </label>
        <label className="auth-field">
          <span>{t("details.pujaTime", "Puja Time")}</span>
          <input type="time" value={pujaTime} onChange={onPujaTimeChange} />
        </label>
      </div>
      <div className="puja-mode-group" role="radiogroup" aria-label={t("details.pujaMode", "Puja Mode")}>
        <span className="item-detail-label">{t("details.pujaMode", "Puja Mode")}</span>
        <div className="puja-mode-options">
          {["Online", "Offline"].map((mode) => (
            <label key={mode} className={`puja-mode-option ${pujaMode === mode ? "puja-mode-option-active" : ""}`}>
              <input
                type="radio"
                name="puja-mode"
                value={mode}
                checked={pujaMode === mode}
                onChange={onPujaModeChange}
              />
              <span>{t(`details.pujaMode${mode}`, mode)}</span>
            </label>
          ))}
        </div>
      </div>
      {pujaScheduleMessage ? <div className="auth-message auth-message-error">{pujaScheduleMessage}</div> : null}
    </div>

    <div className="item-detail-assurance">
      <div className="item-detail-assurance-card">
        <FaCircleCheck />
        <span>{assuranceText || "Temple support team will verify your booking and order details."}</span>
      </div>
    </div>

    <button type="button" className="auth-submit-btn item-detail-cta" onClick={onAddToCart}>
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
  const [wished, setWished] = useState(false);
  const [selectedPriceOption, setSelectedPriceOption] = useState(null);
  const [pujaDate, setPujaDate] = useState("");
  const [pujaTime, setPujaTime] = useState("");
  const [pujaMode, setPujaMode] = useState("Online");
  const [pujaScheduleMessage, setPujaScheduleMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    shipping: false,
  });

  const minPujaDate = useMemo(() => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
  }, []);

  const detail = useMemo(() => {
    if (!item) {
      return null;
    }

    const isPuja = item.kind === "puja";
    const specifications = Array.isArray(item.specifications) ? item.specifications : [];
    const heightSpec = specifications.find((spec) => String(spec.label || "").toLowerCase() === "height");
    const hasExtraProductDetails = !isPuja && (!!item.description || specifications.length > 0);
    const isRudraksha =
      String(item.category || "").toLowerCase().includes("rudraksha") ||
      String(item.name || item.title || "").toLowerCase().includes("rudraksha");

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
      benefits: Array.isArray(item.benefits) ? item.benefits : [],
      priceOptions: Array.isArray(item.priceOptions) ? item.priceOptions : [],
      reviewsLabel: item.reviewsLabel || "Reviews (0)",
      hasExtraProductDetails,
      taxInfo: item.taxInfo || t("details.taxInfo", "Inclusive of all Taxes. GST included. FREE delivery over Rs. 499"),
      offerText: item.offerText || "",
      returnPolicy: item.returnPolicy || t("details.returnPolicy", "Easy 10 Day Return & Replacement Available"),
      highlightLabel: item.highlightLabel || t("details.height", "Height"),
      highlightValue: item.highlightValue || heightSpec?.value || "",
      ctaLabel: ctaLabel || (isPuja ? t("details.bookAndPlaceOrder", "Book & Place Order") : t("details.addToCart", "Add to Cart")),
      isPuja,
      isRudraksha,
    };
  }, [ctaLabel, item, t]);

  useEffect(() => {
    setActiveImage(detail?.images?.[0] || detail?.image || "");
  }, [detail]);

  useEffect(() => {
    setQuantity(1);
    setWished(false);
    setSelectedPriceOption(detail?.priceOptions?.[0] || null);
    setPujaDate("");
    setPujaTime("");
    setPujaMode("Online");
    setPujaScheduleMessage("");
    setExpandedSections({
      description: false,
      shipping: false,
    });
  }, [detail?.priceOptions, detail?.title]);

  if (!detail) {
    return null;
  }

  const selectedPrice = selectedPriceOption?.price || detail.price;

  const handleAddToCart = (selectedQuantityOrBooking) => {
    if (typeof onAddToCart !== "function") {
      return;
    }

    const selectedQuantity = typeof selectedQuantityOrBooking === "number" ? selectedQuantityOrBooking : 1;
    const bookingDetails =
      selectedQuantityOrBooking && typeof selectedQuantityOrBooking === "object" ? selectedQuantityOrBooking : null;

    const cartItem = selectedPriceOption
      ? {
          ...item,
          price: selectedPriceOption.price,
          selectedWeight: selectedPriceOption.label,
          name: `${item.name} (${selectedPriceOption.label})`,
        }
      : {
          ...item,
          ...(bookingDetails || {}),
        };

    Array.from({ length: Math.max(1, selectedQuantity) }).forEach(() => {
      onAddToCart(cartItem);
    });
  };

  const handlePujaScheduleChange = (setter) => (event) => {
    setter(event.target.value);
    if (pujaScheduleMessage) {
      setPujaScheduleMessage("");
    }
  };

  const handleBookPuja = () => {
    if (!pujaDate || !pujaTime) {
      setPujaScheduleMessage(t("details.pujaScheduleRequired", "Please choose puja date and time before booking."));
      return;
    }

    handleAddToCart({
      pujaDate,
      pujaTime,
      pujaMode,
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
        <div className={`item-detail-media ${detail.isPuja ? "item-detail-media-puja" : ""}`}>
        <div className={`product-image-container ${detail.isPuja ? "product-image-container-puja" : ""} ${detail.isRudraksha ? "product-image-container-rudraksha" : ""}`}>
          <img
            src={activeImage || detail.image}
            alt={detail.title}
            className={`product-image ${detail.isPuja ? "product-image-puja" : ""} ${detail.isRudraksha ? "product-image-rudraksha" : ""}`}
          />
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
            onAddToCart={handleBookPuja}
            assuranceText={assuranceText}
            pujaDate={pujaDate}
            pujaTime={pujaTime}
            pujaMode={pujaMode}
            onPujaDateChange={handlePujaScheduleChange(setPujaDate)}
            onPujaTimeChange={handlePujaScheduleChange(setPujaTime)}
            onPujaModeChange={handlePujaScheduleChange(setPujaMode)}
            pujaScheduleMessage={pujaScheduleMessage}
            minPujaDate={minPujaDate}
          />
        ) : (
          <ProductCommercePanel
            detail={detail}
            selectedPrice={selectedPrice}
            selectedPriceOption={selectedPriceOption}
            onSelectPriceOption={setSelectedPriceOption}
            onAddToCart={handleAddToCart}
            quantity={quantity}
            onQuantityDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
            onQuantityIncrease={() => setQuantity((current) => current + 1)}
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
