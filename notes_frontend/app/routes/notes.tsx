import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { apiDeleteNote, apiListNotes, type Note } from "~/utils/api.server";
import { requireTokenOrRedirect } from "~/utils/session.server";

// PUBLIC_INTERFACE
export async function loader({ request }: LoaderFunctionArgs) {
  /**
   * List notes for the authenticated user.
   * Supports search via `?q=...`.
   */
  const token = await requireTokenOrRedirect(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || undefined;

  try {
    const notes = await apiListNotes({ token, q, limit: 100 });
    return json({ notes, q });
  } catch (e: unknown) {
    // If unauthorized at this point, force re-login
    const status = (e as { status?: number } | null | undefined)?.status;
    if (status === 401) return redirect("/login");
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function action({ request }: ActionFunctionArgs) {
  /**
   * Handle delete intent from the list. Expects form fields: intent=delete, noteId=<id>.
   */
  const token = await requireTokenOrRedirect(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  if (intent === "delete") {
    const noteId = Number(formData.get("noteId"));
    if (!Number.isFinite(noteId)) {
      return json({ error: "Invalid note id" }, { status: 400 });
    }
    try {
      await apiDeleteNote(token, noteId);
      const referer = request.headers.get("Referer");
      return redirect(referer && new URL(referer).pathname === "/notes" ? referer : "/notes");
    } catch (e: unknown) {
      const status = (e as { status?: number } | null | undefined)?.status ?? 500;
      return json({ error: "Failed to delete note." }, { status });
    }
  }
  return json({ error: "Unsupported action." }, { status: 400 });
}

export default function Notes() {
  const { notes, q } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Form method="get" className="flex w-full sm:max-w-md gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search notes..."
            defaultValue={q ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-white"
            style={{ backgroundColor: "#1976d2" }}
            disabled={busy}
          >
            Search
          </button>
        </Form>
        <Link
          to="/notes/new"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-white"
          style={{ backgroundColor: "#1976d2" }}
        >
          New Note
        </Link>
      </div>

      {actionData?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionData.error}
        </div>
      ) : null}

      {notes.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-600">
          No notes found{q ? ` for “${q}”` : ""}. Create your first note!
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n: Note) => (
            <li key={n.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{n.title}</h3>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/notes/${n.id}/edit?${searchParams.toString()}`}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="noteId" value={n.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 text-sm text-gray-700">
                {n.content}
              </p>
              {n.tags ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.tags.split(",").map((t) => (
                    <span
                      key={t.trim()}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                    >
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
