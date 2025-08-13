//
// Utilities to resolve environment configuration for server-side usage.
//

// PUBLIC_INTERFACE
export function getBackendURL(): string {
  /**
   * Resolve the backend API base URL.
   * Reads BACKEND_URL (server) or VITE_BACKEND_URL (build-time) environment variables.
   * Returns a string like "http(s)://host:port".
   *
   * Note: Do not hardcode URLs; ensure the .env file provides BACKEND_URL (recommended).
   */
  const url =
    process.env.BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    "";

  if (!url) {
    // We intentionally avoid hardcoding a default here to prevent accidental misconfiguration.
    // Consumers should configure BACKEND_URL in the environment/.env file.
    throw new Error(
      "BACKEND_URL is not set. Please configure BACKEND_URL (or VITE_BACKEND_URL) in your environment."
    );
  }
  return url.replace(/\/+$/, "");
}
