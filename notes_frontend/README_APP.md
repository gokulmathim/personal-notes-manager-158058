# Notes Frontend (Remix)

This is the Remix frontend for the Notes application. It includes:
- User authentication (register, login, logout)
- Notes CRUD (create, list/search, update, delete)
- Responsive, minimal UI styled with Tailwind using the color palette:
  - Primary: #1976d2
  - Secondary: #90caf9
  - Accent: #ffb300

## Prerequisites

- Node.js 20+
- Backend URL configured in environment as `BACKEND_URL` (see `.env.example`)

## Development

1. Copy `.env.example` to `.env` and set `BACKEND_URL` (e.g., to your FastAPI service URL).
2. Start the dev server:

```sh
npm run dev
```

## Build and Run (Production)

```sh
npm run build
npm start
```

## Routes

- `/login` — sign in
- `/register` — create account
- `/notes` — list and search notes, delete
- `/notes/new` — create a note
- `/notes/:id/edit` — edit a note

Authentication token is stored in an HTTP-only cookie and all API calls are made server-side.
