const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const getAdminEmails = () =>
  String(import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

export const isAdminUser = (user) => {
  const email = normalizeEmail(user?.email);

  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email);
};
