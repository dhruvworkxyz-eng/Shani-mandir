import { buildApiUrl } from "./api";

const ORDER_HISTORY_PREFIX = "temple-order-history";
const DONATION_HISTORY_PREFIX = "temple-donation-history";
const ORDER_HISTORY_EVENT = "temple-order-history-updated";

const buildHistoryKey = (userId) => `${ORDER_HISTORY_PREFIX}:${userId}`;
const buildDonationKey = (userId) => `${DONATION_HISTORY_PREFIX}:${userId}`;

const readHistory = (userId) => {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(buildHistoryKey(userId));
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const writeHistory = (userId, history) => {
  if (!userId || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildHistoryKey(userId), JSON.stringify(history));
  window.dispatchEvent(
    new CustomEvent(ORDER_HISTORY_EVENT, {
      detail: { userId },
    })
  );
};

const readDonationHistory = (userId) => {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(buildDonationKey(userId));
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const writeDonationHistory = (userId, history) => {
  if (!userId || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildDonationKey(userId), JSON.stringify(history));
};

export const getOrderHistory = (userId) => readHistory(userId);

export const refreshOrderHistory = async (userId) => {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const response = await fetch(buildApiUrl(`/api/users/${encodeURIComponent(userId)}/orders`));
    if (!response.ok) {
      throw new Error("Unable to load backend order history.");
    }

    const data = await response.json();
    const orders = Array.isArray(data.orders) ? data.orders : [];
    writeHistory(userId, orders);
    return orders;
  } catch {
    return readHistory(userId);
  }
};

export const appendOrderHistory = (userId, order) => {
  const currentHistory = readHistory(userId);
  writeHistory(userId, [order, ...currentHistory]);
};

export const updateOrderHistoryEntry = (userId, orderId, updates) => {
  if (!userId || !orderId) {
    return;
  }

  const currentHistory = readHistory(userId);
  const nextHistory = currentHistory.map((entry) =>
    entry.orderId === orderId
      ? {
          ...entry,
          ...updates,
        }
      : entry
  );

  writeHistory(userId, nextHistory);

  fetch(buildApiUrl(`/api/orders/${encodeURIComponent(orderId)}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  }).catch(() => {});
};

export const subscribeToOrderHistory = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(ORDER_HISTORY_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(ORDER_HISTORY_EVENT, handleChange);
  };
};

export const getDonationHistory = (userId) => readDonationHistory(userId);

export const refreshDonationHistory = async (userId) => {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const response = await fetch(buildApiUrl(`/api/users/${encodeURIComponent(userId)}/donations`));
    if (!response.ok) {
      throw new Error("Unable to load backend donation history.");
    }

    const data = await response.json();
    const donations = Array.isArray(data.donations) ? data.donations : [];
    writeDonationHistory(userId, donations);
    return donations;
  } catch {
    return readDonationHistory(userId);
  }
};

export const appendDonationHistory = (userId, donation) => {
  const donationRecord = {
    ...donation,
    userId,
  };
  const currentHistory = readDonationHistory(userId);
  writeDonationHistory(userId, [donationRecord, ...currentHistory]);

  fetch(buildApiUrl("/api/donations"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ donation: donationRecord }),
  }).catch(() => {});
};
