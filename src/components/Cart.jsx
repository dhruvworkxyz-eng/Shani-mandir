import { useLanguage } from "../context/LanguageContext";

const Cart = ({ cartItems = [], removeFromCart }) => {
  const { t, translateCategory } = useLanguage();
  const groupedItems = cartItems.reduce((items, item) => {
    const existingItem = items.find((entry) => entry.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      return items;
    }

    items.push({ ...item, quantity: 1 });
    return items;
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item?.price || 0), 0);

  return (
    <aside className="cart-box shop-cart-box">
      <div className="shop-cart-header">
        <div>
          <p className="shop-cart-kicker">{t("cart.kicker")}</p>
          <h2>{t("cart.title")}</h2>
        </div>
        <span className="shop-cart-count">{cartItems.length} {t("cart.items")}</span>
      </div>

      {groupedItems.length === 0 ? (
        <div className="shop-cart-empty">
          <p>{t("cart.emptyTitle")}</p>
          <span>{t("cart.emptyText")}</span>
        </div>
      ) : (
        <>
          <div className="shop-cart-list">
            {groupedItems.map((item) => (
              <div key={item.id} className="shop-cart-item">
                <img src={item.image} alt={item.name} className="shop-cart-image" />

                <div className="shop-cart-details">
                  <p className="shop-cart-item-category">{translateCategory(item.category)}</p>
                  <h3 className="shop-cart-item-title">{item.name}</h3>
                  <div className="shop-cart-meta">
                    <span className="shop-cart-qty">{t("cart.qty")} {item.quantity}</span>
                    <strong className="shop-cart-price">Rs. {item.price * item.quantity}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="shop-cart-remove"
                  onClick={() => removeFromCart?.(item.id)}
                >
                  {t("cart.remove")}
                </button>
              </div>
            ))}
          </div>

          <div className="shop-cart-footer">
            <div className="shop-cart-total-row">
              <span>{t("cart.subtotal")}</span>
              <strong>Rs. {total}</strong>
            </div>
            <div className="shop-cart-total-row shop-cart-total-row-final">
              <span>{t("cart.total")}</span>
              <strong>Rs. {total}</strong>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Cart;
