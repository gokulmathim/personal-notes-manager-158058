import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { apiCreateNote } from "~/utils/api.server";
import { requireTokenOrRedirect } from "~/utils/session.server";

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  /**
   * Ensure authenticated before showing create form.
   */
  await requireTokenOrRedirect(request);
  return json({});
}

// PUBLIC_INTERFACE
export async function action({ request }: ActionFunctionArgs) {
  /**
   * Create a new note from form submission.
   */
  const token = await requireTokenOrRedirect(request);
  const formData = await request.formData();
  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  const tags = formData.get("tags") ? String(formData.get("tags")) : undefined;

  if (!title || !content) {
    return json({ error: "Title and content are required." }, { status: 400 });
  }

  try {
    await apiCreateNote(token, { title, content, tags });
    return redirect("/notes");
  } catch (e: unknown) {
    const status = (e as { status?: number } | null | undefined)?.status ?? 500;
    return json({ error: "Failed to create note." }, { status });
  }
}

export default function NewNote() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "#1976d2" }}>
          New Note
        </h1>
        <Link to="/notes" className="text-sm underline" style={{ color: "#1976d2" }}>
          Back to notes
        </Link>
      </div>
      {actionData?.error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionData.error}
        </div>
      ) : null}
      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="work, personal, ideas"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-white"
            style={{ backgroundColor: "#1976d2" }}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save Note"}
          </button>
          <Link
            to="/notes"
            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}
