import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
  Form,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getToken } from "./utils/session.server";
import { apiGetMe, type UserRead } from "./utils/api.server";

import "./tailwind.css";

// PUBLIC_INTERFACE
export const meta: MetaFunction = () => {
  /** Set base metadata for the Notes app */
  return [
    { title: "Notes" },
    { name: "description", content: "A minimal notes app built with Remix" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  /**
   * Global loader to provide current user to the app shell if authenticated.
   */
  let user: UserRead | null = null;
  try {
    const token = await getToken(request);
    if (token) {
      user = await apiGetMe(token);
    }
  } catch {
    user = null;
  }
  return json({ user });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-white text-gray-900">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Link to={user ? "/notes" : "/"} className="font-semibold text-lg" style={{ color: "#1976d2" }}>
              Notes
            </Link>
            <nav className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/notes"
                    className="px-3 py-1.5 rounded-md hover:bg-gray-100"
                  >
                    All Notes
                  </Link>
                  <Link
                    to="/notes/new"
                    className="px-3 py-1.5 rounded-md text-white"
                    style={{ backgroundColor: "#1976d2" }}
                  >
                    New Note
                  </Link>
                  <span className="hidden sm:inline text-sm text-gray-600 ml-2">
                    {user.email}
                  </span>
                  <Form method="post" action="/logout">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </Form>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-1.5 rounded-md hover:bg-gray-100">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-md text-white"
                    style={{ backgroundColor: "#1976d2" }}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-16 border-t border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500">
            © {new Date().getFullYear()} Notes. All rights reserved.
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
