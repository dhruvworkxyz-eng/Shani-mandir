const trimmedApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

const isLocalApiBaseUrl = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url);
const isBrowserOnLocalhost = () =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const buildApiUrl = (path) => {
  if (!trimmedApiBaseUrl || (isLocalApiBaseUrl(trimmedApiBaseUrl) && !isBrowserOnLocalhost())) {
    return path;
  }

  const normalizedBase = trimmedApiBaseUrl.endsWith("/")
    ? trimmedApiBaseUrl.slice(0, -1)
    : trimmedApiBaseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};
