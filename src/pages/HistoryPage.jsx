import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";
import { useProductCatalog } from "../context/ProductCatalogContext";

const HistoryPage = ({ id, activeCategory: controlledCategory, onCategoryChange, onViewProduct }) => {
  const { t, translateCategory } = useLanguage();
  const { products, productCategories } = useProductCatalog();
  const [internalCategory, setInternalCategory] = useState("All");
  const activeCategory = controlledCategory ?? internalCategory;
  const setActiveCategory = onCategoryChange ?? setInternalCategory;

  const filteredProducts = useMemo(
    () => {
      if (activeCategory !== "All") {
        return products.filter((product) => product.category === activeCategory);
      }

      return productCategories
        .filter((category) => category !== "All")
        .flatMap((category) =>
          products.filter((product) => product.category === category).slice(0, 2)
        );
    },
    [activeCategory, productCategories, products]
  );

  return (
    <section id={id} className="shop-section">
      <div className="shop-header-block">
        <p className="shop-kicker">{t("shop.kicker", "Temple Store")}</p>
        <h1 className="shop-heading">{t("shop.heading", "Shop Sacred Essentials")}</h1>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="Product categories">
        {productCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={category === activeCategory ? "shop-tab shop-tab-active" : "shop-tab"}
            onClick={() => setActiveCategory(category)}
          >
            {translateCategory(category)}
          </button>
        ))}
      </div>

      <div className={activeCategory === "All" ? "shop-grid shop-grid-all-mix" : "shop-grid"}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
        ))}
      </div>
    </section>
  );
};

export default HistoryPage;
