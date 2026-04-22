const ORDER_HISTORY_PREFIX = "temple-order-history";
const DONATION_HISTORY_PREFIX = "temple-donation-history";

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
  } catch (error) {
    return [];
  }
};

const writeHistory = (userId, history) => {
  if (!userId || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildHistoryKey(userId), JSON.stringify(history));
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
  } catch (error) {
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

export const appendOrderHistory = (userId, order) => {
  const currentHistory = readHistory(userId);
  writeHistory(userId, [order, ...currentHistory]);
};

export const getDonationHistory = (userId) => readDonationHistory(userId);

export const appendDonationHistory = (userId, donation) => {
  const currentHistory = readDonationHistory(userId);
  writeDonationHistory(userId, [donation, ...currentHistory]);
};
