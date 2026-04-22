import React, { useMemo, useState } from "react";
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
import pujas from "../data/pujas";

const PujaDetailPage = ({ cartItems, addToCart, removeFromCart, clearCart }) => {
  const { t } = useLanguage();
  const { pujaId } = useParams();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartStartInCheckout, setCartStartInCheckout] = useState(false);

  const puja = useMemo(
    () => pujas.find((entry) => String(entry.id) === String(pujaId)),
    [pujaId]
  );

  const openOrderFlow = (item) => {
    if (!item) {
      return;
    }

    const normalizedItem = {
      id: `puja-${item.id}`,
      name: item.title || item.name,
      category: "Puja Booking",
      price: item.price,
      oldPrice: item.oldPrice || null,
      image: item.image,
      rating: item.rating || 5,
      kind: "puja",
      date: item.date,
    };

    addToCart?.(normalizedItem);
    setCartStartInCheckout(true);
    setCartModalOpen(true);
  };

  if (!puja) {
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
            <h1>{t("details.pujaNotFound", "Puja not found")}</h1>
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
              item={{ ...puja, kind: "puja" }}
              onAddToCart={openOrderFlow}
              assuranceText={t("details.pujaAssurance", "Temple support team will verify your puja booking, sankalp details, and schedule after order confirmation.")}
            />
          </section>
        </div>
      </main>
      <RelatedProductsSlider
        currentProduct={puja}
        allProducts={pujas}
        itemType="puja"
        heading={t("shop.relatedPujas", "Suggested Pujas")}
        sideLabel={t("shop.relatedPujas", "Suggested Pujas")}
        sectionLabel={t("shop.relatedPujasAria", "Related pujas")}
        nextLabel={t("shop.nextRelatedPujas", "Next related pujas")}
        prevLabel={t("shop.prevRelatedPujas", "Previous related pujas")}
      />
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

export default PujaDetailPage;
