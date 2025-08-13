import { createCookie, redirect } from "@remix-run/node";

// Secure cookie to store the JWT access token.
// Name kept simple; ensure to configure secrets for production if you convert to session storage.
const tokenCookie = createCookie("notes_token", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  // Configure a long expiration; backend token validity still applies.
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

// PUBLIC_INTERFACE
export async function getToken(request: Request): Promise<string | null> {
  /**
   * Parse and return the JWT token from cookie if present, otherwise null.
   */
  const cookieHeader = request.headers.get("Cookie");
  const token = await tokenCookie.parse(cookieHeader);
  return token ?? null;
}

// PUBLIC_INTERFACE
export async function commitToken(token: string): Promise<string> {
  /**
   * Serialize and return the Set-Cookie header value that stores the given token.
   */
  return tokenCookie.serialize(token);
}

// PUBLIC_INTERFACE
export async function destroyToken(): Promise<string> {
  /**
   * Serialize and return the Set-Cookie header value to clear the token cookie.
   */
  return tokenCookie.serialize("", { maxAge: 0 });
}

// PUBLIC_INTERFACE
export async function requireTokenOrRedirect(request: Request): Promise<string> {
  /**
   * Ensure a JWT token exists in the request cookies.
   * If not present, redirect to /login.
   * Returns the token string on success.
   */
  const token = await getToken(request);
  if (!token) {
    throw redirect("/login");
  }
  return token;
}
