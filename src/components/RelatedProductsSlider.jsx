import React, { useMemo, useRef } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa6";
import { useLanguage } from "../context/LanguageContext";

const formatRupees = (value) => {
  try {
    return new Intl.NumberFormat("en-IN").format(value ?? 0);
  } catch {
    return String(value ?? 0);
  }
};

const buildRelatedItems = (currentItem, allItems) => {
  if (!currentItem || !Array.isArray(allItems)) {
    return [];
  }

  const remainingItems = allItems.filter((item) => item?.id !== currentItem.id);
  const sameCategory = remainingItems.filter((item) => item?.category === currentItem.category);
  const fallbackItems = remainingItems.filter((item) => item?.category !== currentItem.category);

  return [...sameCategory, ...fallbackItems].slice(0, 12);
};

const ArrowButton = ({ className, onClick, direction, ariaLabel }) => (
  <button
    type="button"
    className={`related-products-arrow ${className || ""}`}
    onClick={onClick}
    aria-label={ariaLabel}
  >
    {direction === "next" ? <FaArrowRight /> : <FaArrowLeft />}
  </button>
);

const RelatedProductsSlider = ({
  currentProduct,
  allProducts = [],
  itemType = "product",
  heading,
  kicker,
  sideLabel,
  sectionLabel,
  nextLabel,
  prevLabel,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    moved: false,
  });

  const relatedProducts = useMemo(
    () => buildRelatedItems(currentProduct, allProducts),
    [allProducts, currentProduct]
  );

  const isPuja = itemType === "puja";
  const routeBase = isPuja ? "/pujas" : "/products";
  const resolvedHeading = heading || (isPuja ? t("shop.relatedPujas", "Suggested Pujas") : t("shop.templeOfferings", "Temple Offerings"));
  const resolvedKicker = kicker || t("shop.youMayAlsoLike", "You may also like");
  const resolvedSideLabel = sideLabel || resolvedHeading;
  const resolvedSectionLabel = sectionLabel || (isPuja ? t("shop.relatedPujasAria", "Related pujas") : t("shop.relatedProductsAria", "Related products"));
  const resolvedNextLabel = nextLabel || (isPuja ? t("shop.nextRelatedPujas", "Next related pujas") : t("shop.nextRelated", "Next related products"));
  const resolvedPrevLabel = prevLabel || (isPuja ? t("shop.prevRelatedPujas", "Previous related pujas") : t("shop.prevRelated", "Previous related products"));

  const startPointerTracking = (point) => {
    dragStateRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      moved: false,
    };
  };

  const updatePointerTracking = (point) => {
    const deltaX = Math.abs(point.clientX - dragStateRef.current.startX);
    const deltaY = Math.abs(point.clientY - dragStateRef.current.startY);

    if (deltaX > 8 || deltaY > 8) {
      dragStateRef.current.moved = true;
    }
  };

  const handleCardClick = (event, productId) => {
    if (dragStateRef.current.moved) {
      event.preventDefault();
      return;
    }

    navigate(`${routeBase}/${productId}`);
  };

  const sliderSettings = useMemo(
    () => ({
      arrows: true,
      autoplay: true,
      autoplaySpeed: 0,
      speed: 6500,
      cssEase: "linear",
      infinite: true,
      pauseOnHover: true,
      pauseOnFocus: true,
      pauseOnDotsHover: true,
      swipeToSlide: true,
      draggable: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      nextArrow: <ArrowButton direction="next" ariaLabel={resolvedNextLabel} />,
      prevArrow: <ArrowButton direction="prev" ariaLabel={resolvedPrevLabel} />,
      responsive: [
        {
          breakpoint: 1180,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 580,
          settings: {
            slidesToShow: 1.2,
          },
        },
      ],
    }),
    [resolvedNextLabel, resolvedPrevLabel]
  );

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <section className="related-products-section" aria-label={resolvedSectionLabel}>
      <div className="related-products-head">
        <div>
          <p className="related-products-kicker">{resolvedKicker}</p>
          <h2>{resolvedHeading}</h2>
        </div>
        <div className="related-products-head-right">
          <span>{resolvedSideLabel}</span>
        </div>
      </div>

      <div className="related-products-slider-wrap">
        <Slider {...sliderSettings}>
          {relatedProducts.map((product) => (
            <div key={product.id} className="related-products-slide">
              <article
                className="related-product-card"
                role="link"
                tabIndex={0}
                aria-label={product.title || product.name}
                onMouseDown={(event) => startPointerTracking(event)}
                onMouseMove={(event) => updatePointerTracking(event)}
                onTouchStart={(event) => startPointerTracking(event.touches[0])}
                onTouchMove={(event) => updatePointerTracking(event.touches[0])}
                onClick={(event) => handleCardClick(event, product.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`${routeBase}/${product.id}`);
                  }
                }}
              >
                <div className="related-product-media">
                  {product.badge || product.discount ? <span className="related-product-badge">{product.badge || product.discount}</span> : null}
                  {product.rating ? (
                    <span className="related-product-rating">
                      <FaStar />
                      {product.rating}
                    </span>
                  ) : null}
                  <img src={product.image} alt={product.title || product.name} className="related-product-image" loading="lazy" />
                </div>

                <div className="related-product-copy">
                  <h3>{product.title || product.name}</h3>
                  <div className="related-product-price-row">
                    <strong>Rs. {formatRupees(product.price)}</strong>
                    {product.oldPrice ? <span>Rs. {formatRupees(product.oldPrice)}</span> : null}
                  </div>
                </div>
              </article>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default RelatedProductsSlider;
