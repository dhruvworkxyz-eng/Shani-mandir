import { useLanguage } from "../context/LanguageContext";

const ProductCard = ({ product, onViewProduct }) => {
  const { t, translateCategory } = useLanguage();
  if (!product) {
    return null;
  }

  const gallery = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
  const [primaryImage, secondaryImage] = gallery;
  const hasSecondaryImage = Boolean(secondaryImage);

  const handleViewProduct = () => {
    if (typeof onViewProduct === "function") {
      onViewProduct(product);
    }
  };

  return (
    <article
      className="shop-product-card shop-product-card-clickable"
      onClick={handleViewProduct}
      role="button"
      tabIndex={0}
      data-has-secondary-image={hasSecondaryImage ? "true" : "false"}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleViewProduct();
        }
      }}
    >
      <div className="shop-product-media">
        {product.sale ? <span className="shop-sale-badge">{product.discount}</span> : null}
        <span className="shop-rating-badge">{product.rating} ★</span>
        <img src={primaryImage} alt={product.name} className="shop-product-image shop-product-image-primary" loading="lazy" />
        {secondaryImage ? (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="shop-product-image shop-product-image-secondary"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="shop-product-body">
        <p className="shop-product-category">{translateCategory(product.category)}</p>
        <h3 className="shop-product-title">{product.name}</h3>

        <div className="shop-price-row">
          <span className="shop-price-current">Rs. {product.price}</span>
          {product.oldPrice ? <span className="shop-price-old">Rs. {product.oldPrice}</span> : null}
        </div>

        <button
          className="shop-add-cart-btn"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleViewProduct();
          }}
        >
          {t("shop.viewDetails", "View Details")}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
