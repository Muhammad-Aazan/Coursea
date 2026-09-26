/**
 * Safely resolves media/image URLs to prevent Mixed Content warnings
 * when running over HTTPS in production (e.g. Vercel).
 */
export function getSafeMediaUrl(url, fallback = "") {
  if (!url) return fallback;

  // If on HTTPS (e.g. Vercel production) and the stored URL points to insecure localhost
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.includes("localhost")
  ) {
    // If it's an uploaded file, route it through the live backend domain
    if (url.includes("/uploads/")) {
      return url.replace(/http:\/\/localhost:\d+/i, "https://coursea-liart.vercel.app");
    }
    return fallback;
  }

  return url;
}
