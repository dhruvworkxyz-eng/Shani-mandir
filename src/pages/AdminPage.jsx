import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProductCatalog } from "../context/ProductCatalogContext";
import { getAdminOrders, subscribeToAdminOrders, updateAdminOrderStatus } from "../lib/adminOrders";
import { updateOrderHistoryEntry } from "../lib/orderHistory";

const defaultFormState = {
  name: "",
  category: "Temple Products",
  price: "",
  oldPrice: "",
  rating: "4.8",
  image: "",
  description: "",
  discount: "",
};

const orderStatuses = ["All", "Confirmed", "Preparing Order", "Dispatched", "Delivered", "Cancelled"];

const AdminPage = () => {
  const { user } = useAuth();
  const { products, productCategories, createProduct, updateProduct, deleteProduct, resetCatalog } = useProductCatalog();
  const [orders, setOrders] = useState(() => getAdminOrders());
  const [editingId, setEditingId] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [orderQuery, setOrderQuery] = useState("");

  useEffect(() => subscribeToAdminOrders(() => setOrders(getAdminOrders())), []);

  const dashboardStats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    return {
      products: products.length,
      orders: orders.length,
      revenue,
      pending: orders.filter((order) => {
        const status = String(order.status || "").toLowerCase();
        return !status.includes("deliver") && !status.includes("cancel");
      }).length,
    };
  }, [orders, products.length]);

  const visibleProducts = useMemo(() => {
    if (categoryFilter === "All") {
      return products;
    }

    return products.filter((product) => product.category === categoryFilter);
  }, [categoryFilter, products]);

  const visibleOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        order.orderId,
        order.paymentId,
        order.customer?.name,
        order.customer?.email,
        order.customer?.phone,
        ...(order.items || []).map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [orderQuery, orders, statusFilter]);

  const highlightedOrder = useMemo(() => visibleOrders[0] || null, [visibleOrders]);

  const populateForm = (product) => {
    setEditingId(String(product.id));
    setFormState({
      name: product.name || "",
      category: product.category || "Temple Products",
      price: product.price ? String(product.price) : "",
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      rating: product.rating ? String(product.rating) : "4.8",
      image: product.image || "",
      description: product.description || "",
      discount: product.discount || "",
    });
  };

  const resetForm = () => {
    setEditingId("");
    setFormState(defaultFormState);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      name: formState.name.trim(),
      category: formState.category.trim(),
      price: Number(formState.price),
      oldPrice: formState.oldPrice ? Number(formState.oldPrice) : null,
      rating: Number(formState.rating) || 4.8,
      image: formState.image.trim(),
      images: [formState.image.trim()].filter(Boolean),
      description: formState.description.trim(),
      discount: formState.discount.trim(),
      sale: Boolean(formState.discount.trim()),
      specifications: [],
      priceRangeLabel: formState.price ? `Rs. ${Number(formState.price).toLocaleString("en-IN")}` : "",
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      createProduct(payload);
    }

    resetForm();
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (order, nextStatus) => {
    updateAdminOrderStatus(order.orderId, nextStatus);

    if (order.userId) {
      updateOrderHistoryEntry(order.userId, order.orderId, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-topbar">
          <div>
            <p className="admin-kicker">Private dashboard</p>
            <h1>Temple store admin</h1>
            <span>Signed in as {user?.email}</span>
          </div>
          <Link to="/" className="admin-back-link">
            Return to website
          </Link>
        </div>

        <div className="admin-stat-grid">
          <article className="admin-stat-card">
            <strong>{dashboardStats.products}</strong>
            <span>Products</span>
          </article>
          <article className="admin-stat-card">
            <strong>{dashboardStats.orders}</strong>
            <span>Orders</span>
          </article>
          <article className="admin-stat-card">
            <strong>Rs. {dashboardStats.revenue.toLocaleString("en-IN")}</strong>
            <span>Total revenue</span>
          </article>
          <article className="admin-stat-card">
            <strong>{dashboardStats.pending}</strong>
            <span>Open orders</span>
          </article>
        </div>

        <div className="admin-grid">
          <section className="admin-card">
            <div className="admin-card-head">
              <div>
                <p className="admin-section-label">{editingId ? "Edit product" : "Add product"}</p>
                <h2>Manage catalog</h2>
              </div>
              <button type="button" className="admin-muted-btn" onClick={resetForm}>
                Clear form
              </button>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Product name</span>
                <input type="text" value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label>
                <span>Category</span>
                <input type="text" value={formState.category} onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))} required />
              </label>
              <label>
                <span>Price</span>
                <input type="number" min="0" value={formState.price} onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))} required />
              </label>
              <label>
                <span>Old price</span>
                <input type="number" min="0" value={formState.oldPrice} onChange={(event) => setFormState((current) => ({ ...current, oldPrice: event.target.value }))} />
              </label>
              <label>
                <span>Rating</span>
                <input type="number" min="0" max="5" step="0.1" value={formState.rating} onChange={(event) => setFormState((current) => ({ ...current, rating: event.target.value }))} />
              </label>
              <label>
                <span>Discount label</span>
                <input type="text" value={formState.discount} onChange={(event) => setFormState((current) => ({ ...current, discount: event.target.value }))} placeholder="20% OFF" />
              </label>
              <label className="admin-form-span-2">
                <span>Image URL or existing asset path</span>
                <input type="text" value={formState.image} onChange={(event) => setFormState((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." />
              </label>
              <label className="admin-form-span-2">
                <span>Description</span>
                <textarea rows="5" value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <div className="admin-form-actions admin-form-span-2">
                <button type="submit" className="admin-primary-btn">
                  {editingId ? "Update product" : "Add product"}
                </button>
                <button type="button" className="admin-danger-btn" onClick={resetCatalog}>
                  Reset all admin product changes
                </button>
              </div>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card-head">
              <div>
                <p className="admin-section-label">Storefront list</p>
                <h2>Live products</h2>
              </div>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="admin-select">
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-product-list">
              {visibleProducts.map((product) => (
                <article key={product.id} className="admin-product-card">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                    <b>Rs. {Number(product.price || 0).toLocaleString("en-IN")}</b>
                  </div>
                  <div className="admin-inline-actions">
                    <button type="button" className="admin-muted-btn" onClick={() => populateForm(product)}>
                      Edit
                    </button>
                    <button type="button" className="admin-danger-btn" onClick={() => deleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-section-label">Order center</p>
              <h2>Customer orders</h2>
            </div>
            <div className="admin-order-toolbar">
              <input
                type="search"
                value={orderQuery}
                onChange={(event) => setOrderQuery(event.target.value)}
                className="admin-select"
                placeholder="Search by order ID, customer, email, phone, product"
              />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="admin-select">
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {highlightedOrder ? (
            <div className="admin-order-highlight">
              <div className="admin-order-highlight-head">
                <div>
                  <p className="admin-section-label">Tracking summary</p>
                  <h2>{highlightedOrder.orderId}</h2>
                </div>
                <div className="admin-order-meta">
                  <b>Rs. {Number(highlightedOrder.total || 0).toLocaleString("en-IN")}</b>
                  <select
                    value={highlightedOrder.status || "Confirmed"}
                    onChange={(event) => handleStatusChange(highlightedOrder, event.target.value)}
                    className="admin-select"
                  >
                    {orderStatuses.filter((status) => status !== "All").map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-order-details admin-order-details-grid">
                <span><strong>Customer:</strong> {highlightedOrder.customer?.name || "-"}</span>
                <span><strong>Email:</strong> {highlightedOrder.customer?.email || "-"}</span>
                <span><strong>Phone:</strong> {highlightedOrder.customer?.phone || "-"}</span>
                <span><strong>Payment:</strong> {highlightedOrder.method || "-"}</span>
                <span><strong>Payment ID:</strong> {highlightedOrder.paymentId || "-"}</span>
                <span><strong>Created:</strong> {formatDate(highlightedOrder.createdAt)}</span>
              </div>

              <div className="admin-order-address">{highlightedOrder.customer?.address || "No address saved"}</div>
            </div>
          ) : null}

          <div className="admin-order-list">
            {visibleOrders.length > 0 ? (
              visibleOrders.map((order) => (
                <article key={order.orderId} className="admin-order-card">
                  <div className="admin-order-head">
                    <div>
                      <strong>{order.orderId}</strong>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="admin-order-meta">
                      <b>Rs. {Number(order.total || 0).toLocaleString("en-IN")}</b>
                      <select
                        value={order.status || "Confirmed"}
                        onChange={(event) => handleStatusChange(order, event.target.value)}
                        className="admin-select"
                      >
                        {orderStatuses.filter((status) => status !== "All").map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-order-details">
                    <span>{order.customer?.name || "-"}</span>
                    <span>{order.customer?.email || "-"}</span>
                    <span>{order.customer?.phone || "-"}</span>
                    <span>{order.method || "-"}</span>
                  </div>

                  <div className="admin-order-details">
                    <span>Payment ID: {order.paymentId || "-"}</span>
                    <span>Items: {order.itemCount || order.items?.length || 0}</span>
                    <span>User: {order.userId || "-"}</span>
                  </div>

                  <div className="admin-order-address">{order.customer?.address || "No address saved"}</div>

                  <div className="admin-order-items">
                    {(order.items || []).map((item) => (
                      <div key={`${order.orderId}-${item.id}`} className="admin-order-item">
                        <span>{item.name}</span>
                        <span>
                          Qty {item.quantity} | Rs. {Number(item.price || 0).toLocaleString("en-IN")}
                          {item.kind === "puja" && (item.pujaDate || item.pujaTime)
                            ? ` | Puja Schedule: ${item.pujaDate || "-"} ${item.pujaTime || ""}`
                            : ""}
                          {item.kind === "puja" && item.pujaMode ? ` | Puja Mode: ${item.pujaMode}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty-state">No matching orders found yet.</div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
};

export default AdminPage;
