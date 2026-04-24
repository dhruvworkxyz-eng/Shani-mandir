import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import HistoryPage from './HistoryPage'
import ContactPage from './ContactPage'
import LandingPage from './LandingPage'
import Header from '../components/Header'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'
import VideoPage from './VideoPage'
import PujaSlider from "../components/PujaSlider";
import AuthModal from "../components/AuthModal";
import DonationModal from "../components/DonationModal";
import CartModal from "../components/CartModal";
import ItemDetailsModal from "../components/ItemDetailsModal";
import { useProductCatalog } from "../context/ProductCatalogContext";

const Index = ({ cartItems, addToCart, removeFromCart, clearCart }) => {
  const { products } = useProductCatalog();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartStartInCheckout, setCartStartInCheckout] = useState(false);
  const [shopCategory, setShopCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (location.state?.openAuth) {
      setAuthModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!location.state?.shopCategory) {
      return;
    }

    setCartStartInCheckout(false);
    setCartModalOpen(false);
    setShopCategory(location.state.shopCategory);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection("shop");
      });
    });

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!location.state?.sectionId) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection(location.state.sectionId);
      });
    });

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection(sectionId);
      });
    });
  }, [location.hash]);

  const browseTempleProducts = () => {
    setCartStartInCheckout(false);
    setCartModalOpen(false);
    setShopCategory("Temple Products");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection("shop");
      });
    });
  };

  const openFeaturedProduct = (productName) => {
    const product = products.find((entry) => entry.name === productName);
    if (!product) {
      return;
    }

    setSelectedItem(null);
    setShopCategory(product.category);

    window.requestAnimationFrame(() => {
      scrollToSection("shop");

      window.setTimeout(() => {
        setSelectedItem(product);
      }, 260);
    });
  };

  const openOrderFlow = (item) => {
    if (!item) {
      return;
    }

    const normalizedItem =
      item.kind === "puja"
        ? {
            id: `puja-${item.id}`,
            name: item.title || item.name,
            category: "Puja Booking",
            price: item.price,
            oldPrice: item.oldPrice || null,
            image: item.image,
            rating: item.rating || 5,
            kind: "puja",
            date: item.date,
          }
        : item;

    addToCart?.(normalizedItem);
    setSelectedItem(null);
    setCartStartInCheckout(true);
    setCartModalOpen(true);
  };

  const handleOpenCart = () => {
    setCartStartInCheckout(false);
    setCartModalOpen(true);
  };

  return (
    <div>
      <TopBar />
      <Header
        cartCount={cartItems.length}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenDonation={() => setDonationModalOpen(true)}
        onOpenCart={handleOpenCart}
        onOpenShopCategory={(category) => {
          setCartStartInCheckout(false);
          setCartModalOpen(false);
          setShopCategory(category);

          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              scrollToSection("shop");
            });
          });
        }}
      />
      <LandingPage
        id="home"
        onFeatureProductClick={openFeaturedProduct}
      />
      <VideoPage/>
      <HistoryPage
        id="shop"
        activeCategory={shopCategory}
        onCategoryChange={setShopCategory}
        onViewProduct={(product) => navigate(`/products/${product.id}`)}
      />
      <PujaSlider
        id="online-puja-booking"
        onViewPuja={(puja) => navigate(`/pujas/${puja.id}`)}
        onFeatureProductClick={openFeaturedProduct}
      />
      <ContactPage id="contact" />
      <Footer/>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />
      <CartModal
        isOpen={cartModalOpen}
        cartItems={cartItems}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onClose={() => setCartModalOpen(false)}
        onBrowseTempleProducts={browseTempleProducts}
        onRequireAuth={() => setAuthModalOpen(true)}
        defaultCheckoutOpen={cartStartInCheckout}
      />
      <ItemDetailsModal
        isOpen={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={openOrderFlow}
      />
    </div>
  )
}

export default Index
