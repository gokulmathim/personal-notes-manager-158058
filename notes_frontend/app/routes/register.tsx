import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { apiRegister } from "~/utils/api.server";
import { getToken } from "~/utils/session.server";

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  /**
   * If already authenticated, go to /notes.
   */
  const token = await getToken(request);
  if (token) return redirect("/notes");
  return json({});
}

// PUBLIC_INTERFACE
export async function action({ request }: ActionFunctionArgs) {
  /**
   * Handle user registration. On success, redirect to /login.
   */
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = formData.get("name") ? String(formData.get("name")) : undefined;

  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    await apiRegister({ email, password, name });
    return redirect("/login?registered=1");
  } catch (e: unknown) {
    const status = (e as { status?: number } | null | undefined)?.status ?? 500;
    const message =
      status === 400
        ? "Registration failed. User may already exist."
        : "Registration failed. Please try again.";
    return json({ error: message }, { status });
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#1976d2" }}>
        Create your account
      </h1>
      {actionData?.error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionData.error}
        </div>
      ) : null}
      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name (optional)
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md px-4 py-2 text-white"
          style={{ backgroundColor: "#1976d2" }}
          disabled={busy}
        >
          {busy ? "Creating..." : "Create account"}
        </button>
      </Form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="underline" style={{ color: "#1976d2" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
