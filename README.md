# Adolescence — Next.js (Vercel-ready)

AI-powered learning platform. This is the **full Next.js rewrite** of the original
FastAPI + Vite project: the Python backend has been reimplemented as Next.js API
routes in TypeScript, so the whole app is a single deployable project.

---

## What changed from the Python version

| Before (FastAPI + Vite) | Now (Next.js) |
|---|---|
| Python backend on port 8000 | Next.js API routes at `/api/*` |
| SQLAlchemy + SQLite | Prisma + **Postgres** |
| Local `uploads/` folder | **Vercel Blob** storage |
| `python-jose` + `passlib` JWT | `jose` + `bcryptjs` |
| `google-genai` (Python) | `@google/genai` (Node) |
| Two servers to run | One |

**Why Postgres and Blob?** Vercel is serverless — the filesystem is read-only and
ephemeral. A SQLite file and a local `uploads/` folder cannot persist there. These
two swaps are required for the app to work on Vercel.

---

## Local setup

### 1. Install
```bash
npm install
```

### 2. Environment
Copy `.env.example` to `.env` and fill it in:

```env
DATABASE_URL="postgresql://user:password@host:5432/adolescence?sslmode=require"
JWT_SECRET="a-long-random-string"
GEMINI_API_KEY="AIza..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

Need a free Postgres? [Neon](https://neon.tech) or Vercel Postgres both have free tiers.

### 3. Create the tables and seed a demo admin
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Seed creates:
- **admin@adolescence.app / admin123** (admin)
- Two sample published lessons

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, **Add New → Project**, import the repo.
3. Under **Storage**, create a **Postgres** database and a **Blob** store.
   Vercel injects `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` automatically.
4. Under **Settings → Environment Variables**, add:
   - `JWT_SECRET` — any long random string
   - `GEMINI_API_KEY` — your key (must start with `AIza`)
5. Deploy.
6. After the first deploy, push the schema:
   ```bash
   npx vercel env pull .env.local
   npx prisma db push
   npm run db:seed
   ```

The build script already runs `prisma generate`, so Vercel builds work out of the box.

---

## API routes

All routes live under `/api` and mirror the original FastAPI endpoints.

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Lessons** — `GET|POST /api/lessons`, `GET|PUT|DELETE /api/lessons/[id]`,
`POST /api/lessons/[id]/publish`, `GET /api/lessons/categories`

**Quizzes** — `GET /api/quizzes/lesson/[lessonId]`, `POST /api/quizzes`,
`POST /api/quizzes/bulk?lesson_id=`, `POST /api/quizzes/submit`, `DELETE /api/quizzes/[id]`

**Progress** — `GET /api/progress/me`, `POST /api/progress/update`

**Admin** — `GET /api/analytics/overview`, `GET /api/admin/users`, `DELETE /api/admin/users/[id]`

**AI** — `POST /api/ai/chat`, `POST /api/ai/generate-quiz`,
`GET /api/ai/chat-history/[lessonId]`, plus two diagnostics below.

---

## Troubleshooting the AI

Two no-login diagnostic endpoints are built in:

- **`/api/ai/diagnose`** — tests your key against each model, shows the exact error.
- **`/api/ai/list-models`** — lists which models your key can actually use.

### "Quota exceeded ... limit: 0"
Your key's Google Cloud project has no free-tier allocation. This is **not** a bug in
the app. Fix it by creating a new key at https://aistudio.google.com/apikey — choose
**"Create API key in new project."**

### Check your key format
A valid Gemini API key starts with **`AIza`**. If yours starts with `AQ.`, it's an
OAuth/Vertex-style token, which has no free Gemini tier and will always return
`limit: 0`. Generate a proper API key instead.

### Model list
Chat and quiz generation try, in order:
`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash-001`,
falling through on 404 (model unavailable) or 429 (quota). To change them, edit
`MODELS` in `src/lib/gemini.ts`.

---

## Project structure

```
prisma/
  schema.prisma        8 models: User, Lesson, Quiz, Progress,
                       AIChat, Assignment, AssignmentSubmission
  seed.ts              demo admin + sample lessons
src/
  app/
    page.tsx           landing
    (auth)/            login, register
    (app)/             protected pages (auth-guarded layout)
      dashboard/       student dashboard
      lessons/         list + [id] viewer
      admin/           dashboard, lessons manager, users
    api/               all 22 backend routes
  components/          AppLayout, AIChat, QuizPanel
  lib/
    prisma.ts          client singleton (serverless-safe)
    auth.ts            JWT + bcrypt + requireUser/requireAdmin
    gemini.ts          model fallback, prompts, learning modes
    upload.ts          Vercel Blob + PDF text extraction
    api.ts             client-side fetch wrapper
    AuthContext.tsx    React auth context
```

---

## Notes

- `typescript.ignoreBuildErrors` is enabled in `next.config.js` because Prisma's
  generated types only exist after `prisma generate` runs. After running it locally,
  you can typecheck fully with `npx tsc --noEmit`.
- AI routes set `maxDuration = 60` so Gemini calls don't hit Vercel's default timeout.
- The design system (Tailwind config + `globals.css`) is carried over unchanged from
  the previous version, so the look is identical.
