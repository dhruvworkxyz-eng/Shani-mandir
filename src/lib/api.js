const trimmedApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

export const buildApiUrl = (path) => {
  if (!trimmedApiBaseUrl) {
    return path;
  }

  const normalizedBase = trimmedApiBaseUrl.endsWith("/")
    ? trimmedApiBaseUrl.slice(0, -1)
    : trimmedApiBaseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};
