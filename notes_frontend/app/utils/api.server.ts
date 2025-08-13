import { getBackendURL } from "./env.server";

/**
 * Types for backend payloads
 */
export interface Token {
  access_token: string;
  token_type?: string;
}

export interface UserRead {
  id: number;
  email: string;
  name?: string | null;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tags?: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
  tags?: string | null;
}

export interface NoteUpdate {
  title?: string | null;
  content?: string | null;
  tags?: string | null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function buildURL(path: string, searchParams?: URLSearchParams) {
  const base = getBackendURL();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);
  if (searchParams) {
    for (const [k, v] of searchParams) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function fetchJSON<T>({
  path,
  method,
  token,
  body,
  contentType,
  searchParams,
}: {
  path: string;
  method: HttpMethod;
  token?: string | null;
  body?: BodyInit | null;
  contentType?: "json" | "form";
  searchParams?: URLSearchParams;
}): Promise<T> {
  const url = buildURL(path, searchParams);
  const headers: Record<string, string> = {};

  if (contentType === "json") headers["Content-Type"] = "application/json";
  if (contentType === "form") headers["Content-Type"] = "application/x-www-form-urlencoded";

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      // Try parse json error (may fail)
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    const error = new Error(
      `API error ${res.status} ${res.statusText} for ${method} ${path}`
    ) as Error & { status?: number; detail?: unknown };
    error.status = res.status;
    error.detail = detail;
    throw error;
  }

  if (res.status === 204) {
    // @ts-expect-error - caller must ignore body for 204
    return undefined;
  }

  return (await res.json()) as T;
}

// PUBLIC_INTERFACE
export async function apiLogin(email: string, password: string): Promise<Token> {
  /**
   * Authenticate with the backend using OAuth2 Password form.
   * Returns a Token with an access_token to be used for subsequent requests.
   */
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  return fetchJSON<Token>({
    path: "/auth/login",
    method: "POST",
    contentType: "form",
    body: form,
  });
}

// PUBLIC_INTERFACE
export async function apiRegister(input: { email: string; password: string; name?: string | null; }): Promise<UserRead> {
  /**
   * Register a new user on the backend.
   * Returns created user info on success.
   */
  return fetchJSON<UserRead>({
    path: "/auth/register",
    method: "POST",
    contentType: "json",
    body: JSON.stringify(input),
  });
}

// PUBLIC_INTERFACE
export async function apiGetMe(token: string): Promise<UserRead> {
  /**
   * Retrieve current authenticated user profile using a bearer token.
   */
  return fetchJSON<UserRead>({
    path: "/auth/me",
    method: "GET",
    token,
  });
}

// PUBLIC_INTERFACE
export async function apiListNotes(params: {
  token: string;
  q?: string | null;
  skip?: number;
  limit?: number;
}): Promise<Note[]> {
  /**
   * List notes for current user with optional query and pagination.
   */
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (typeof params.skip === "number") sp.set("skip", String(params.skip));
  if (typeof params.limit === "number") sp.set("limit", String(params.limit));
  return fetchJSON<Note[]>({
    path: "/notes",
    method: "GET",
    token: params.token,
    searchParams: sp,
  });
}

// PUBLIC_INTERFACE
export async function apiSearchNotes(params: {
  token: string;
  query: string;
  skip?: number;
  limit?: number;
}): Promise<Note[]> {
  /**
   * Search notes across title, content and tags.
   */
  const sp = new URLSearchParams();
  sp.set("query", params.query);
  if (typeof params.skip === "number") sp.set("skip", String(params.skip));
  if (typeof params.limit === "number") sp.set("limit", String(params.limit));
  return fetchJSON<Note[]>({
    path: "/notes/search",
    method: "GET",
    token: params.token,
    searchParams: sp,
  });
}

// PUBLIC_INTERFACE
export async function apiGetNote(token: string, id: number): Promise<Note> {
  /**
   * Retrieve a single note by id.
   */
  return fetchJSON<Note>({
    path: `/notes/${id}`,
    method: "GET",
    token,
  });
}

// PUBLIC_INTERFACE
export async function apiCreateNote(token: string, data: NoteCreate): Promise<Note> {
  /**
   * Create a new note with title, content, and optional tags.
   */
  return fetchJSON<Note>({
    path: "/notes",
    method: "POST",
    token,
    contentType: "json",
    body: JSON.stringify(data),
  });
}

// PUBLIC_INTERFACE
export async function apiUpdateNote(token: string, id: number, data: NoteUpdate): Promise<Note> {
  /**
   * Update an existing note by id.
   */
  return fetchJSON<Note>({
    path: `/notes/${id}`,
    method: "PUT",
    token,
    contentType: "json",
    body: JSON.stringify(data),
  });
}

// PUBLIC_INTERFACE
export async function apiDeleteNote(token: string, id: number): Promise<void> {
  /**
   * Delete an existing note by id.
   */
  await fetchJSON<void>({
    path: `/notes/${id}`,
    method: "DELETE",
    token,
  });
}
