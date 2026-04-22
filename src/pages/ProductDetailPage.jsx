import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartModal from "../components/CartModal";
import DonationModal from "../components/DonationModal";
import AuthModal from "../components/AuthModal";
import ItemDetailsContent from "../components/ItemDetailsContent";
import RelatedProductsSlider from "../components/RelatedProductsSlider";
import { useLanguage } from "../context/LanguageContext";
import { useProductCatalog } from "../context/ProductCatalogContext";

const ProductDetailPage = ({ cartItems, addToCart, removeFromCart, clearCart }) => {
  const { t } = useLanguage();
  const { products } = useProductCatalog();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartStartInCheckout, setCartStartInCheckout] = useState(false);

  const product = useMemo(
    () => products.find((entry) => String(entry.id) === String(productId)),
    [productId, products]
  );

  const openOrderFlow = (item) => {
    if (!item) {
      return;
    }

    addToCart?.(item);
    setCartStartInCheckout(true);
    setCartModalOpen(true);
  };

  if (!product) {
    return (
      <div>
        <TopBar />
        <Header
          cartCount={cartItems.length}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenDonation={() => setDonationModalOpen(true)}
          onOpenCart={() => setCartModalOpen(true)}
        />
        <main className="product-detail-page">
          <div className="product-detail-shell product-detail-shell-empty">
            <h1>{t("details.productNotFound", "Product not found")}</h1>
            <button type="button" className="product-detail-back" onClick={() => navigate("/")}>
              <FaArrowLeft />
              {t("details.backToHome", "Back to Home")}
            </button>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
        <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
        <CartModal
          isOpen={cartModalOpen}
          cartItems={cartItems}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          onClose={() => setCartModalOpen(false)}
          onRequireAuth={() => setAuthModalOpen(true)}
          defaultCheckoutOpen={cartStartInCheckout}
        />
      </div>
    );
  }

  return (
    <div>
      <TopBar />
      <Header
        cartCount={cartItems.length}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenDonation={() => setDonationModalOpen(true)}
        onOpenCart={() => {
          setCartStartInCheckout(false);
          setCartModalOpen(true);
        }}
      />
      <main className="product-detail-page">
        <div className="product-detail-shell">
          <button type="button" className="product-detail-back" onClick={() => navigate("/")}>
            <FaArrowLeft />
            {t("details.backToHome", "Back to Home")}
          </button>
          <section className="product-detail-layout">
            <ItemDetailsContent
              item={product}
              onAddToCart={openOrderFlow}
              assuranceText={t("details.itemAssurance", "Temple support team will verify your order and dispatch details after booking.")}
            />
          </section>
        </div>
      </main>
      <RelatedProductsSlider currentProduct={product} allProducts={products} />
      <Footer />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
      <CartModal
        isOpen={cartModalOpen}
        cartItems={cartItems}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onClose={() => setCartModalOpen(false)}
        onRequireAuth={() => setAuthModalOpen(true)}
        defaultCheckoutOpen={cartStartInCheckout}
      />
    </div>
  );
};

export default ProductDetailPage;
