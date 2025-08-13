import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getToken } from "~/utils/session.server";

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  /**
   * Root index route loader — redirect based on auth state:
   * - Authenticated users go to /notes
   * - Unauthenticated users go to /login
   */
  const token = await getToken(request);
  return redirect(token ? "/notes" : "/login");
}

export default function Index() {
  // Unreachable because loader redirects, but export a component to satisfy Remix
  return null;
}
