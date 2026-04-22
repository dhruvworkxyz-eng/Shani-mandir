import { useEffect, useLayoutEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ProductDetailPage from "./pages/ProductDetailPage";
import PujaDetailPage from "./pages/PujaDetailPage";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import GlobalWhatsAppButton from "./components/GlobalWhatsAppButton";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const animationFrame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [pathname]);

  return null;
};

function App() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((currentItems) => [...currentItems, product]);
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) => {
      const itemIndex = currentItems.findIndex((item) => item.id === productId);

      if (itemIndex === -1) {
        return currentItems;
      }

      return currentItems.filter((_, index) => index !== itemIndex);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ProductCatalogProvider>
            <Router>
              <ScrollToTop />
              <GlobalWhatsAppButton />
              <Routes>
                <Route
                  path="/"
                  element={
                    <Index
                      cartItems={cartItems}
                      addToCart={addToCart}
                      removeFromCart={removeFromCart}
                      clearCart={clearCart}
                    />
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/products/:productId"
                  element={
                    <ProductDetailPage
                      cartItems={cartItems}
                      addToCart={addToCart}
                      removeFromCart={removeFromCart}
                      clearCart={clearCart}
                    />
                  }
                />
                <Route
                  path="/pujas/:pujaId"
                  element={
                    <PujaDetailPage
                      cartItems={cartItems}
                      addToCart={addToCart}
                      removeFromCart={removeFromCart}
                      clearCart={clearCart}
                    />
                  }
                />
              </Routes>
            </Router>
          </ProductCatalogProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
