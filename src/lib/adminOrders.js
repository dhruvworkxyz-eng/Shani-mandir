import { buildApiUrl } from "./api";

const ADMIN_ORDER_STORAGE_KEY = "temple-admin-orders";
const ADMIN_ORDER_EVENT = "temple-admin-orders-updated";

const readOrders = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(ADMIN_ORDER_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADMIN_ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(ADMIN_ORDER_EVENT));
};

export const getAdminOrders = () => readOrders();

export const refreshAdminOrders = async () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const response = await fetch(buildApiUrl("/api/orders"));
    if (!response.ok) {
      throw new Error("Unable to load backend orders.");
    }

    const data = await response.json();
    const orders = Array.isArray(data.orders) ? data.orders : [];
    writeOrders(orders);
    return orders;
  } catch {
    return readOrders();
  }
};

export const appendAdminOrder = (order) => {
  if (!order) {
    return;
  }

  const currentOrders = readOrders();
  writeOrders([order, ...currentOrders]);

  fetch(buildApiUrl("/api/orders"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  }).catch(() => {});
};

export const updateAdminOrderStatus = (orderId, status) => {
  const currentOrders = readOrders();
  const nextOrders = currentOrders.map((order) =>
    order.orderId === orderId
      ? {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        }
      : order
  );

  writeOrders(nextOrders);

  fetch(buildApiUrl(`/api/orders/${encodeURIComponent(orderId)}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  }).catch(() => {});
};

export const subscribeToAdminOrders = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(ADMIN_ORDER_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(ADMIN_ORDER_EVENT, handleChange);
  };
};
