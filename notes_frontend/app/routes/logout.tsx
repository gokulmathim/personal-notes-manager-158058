import { redirect } from "@remix-run/node";
import { destroyToken } from "~/utils/session.server";

// PUBLIC_INTERFACE
export async function action() {
  /**
   * Destroy session token and redirect to /login.
   */
  const cookie = await destroyToken();
  return redirect("/login", {
    headers: { "Set-Cookie": cookie },
  });
}

export default function Logout() {
  // Logout is handled entirely by action via a POST; component can render nothing.
  return null;
}
