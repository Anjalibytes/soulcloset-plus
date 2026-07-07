# SoulCloset+ — Full-Stack Version

A real, standalone full-stack app: your own storage (no dependency on any
external platform), and your own secured AI calls.

## Architecture (what talks to what)

```
Browser (React app, port 5173)
     │  fetch("/api/...")
     ▼
Vite dev server proxies /api/* to →  Express backend (port 4000)
                                          │
                                          ├── data/db.json   (your own storage)
                                          └── Claude API (your key, kept server-side)
```

- **`/client`** — React + Vite + Tailwind. This is what renders in the browser.
- **`/server`** — Express. Owns a JSON file database (`server/data/db.json`,
  created automatically on first write) and is the only place that ever
  sees your Anthropic API key.

Why the backend calls Claude instead of the browser doing it directly:
an API key placed in frontend code is visible to anyone who opens dev
tools. Routing it through your own server keeps it private.

## Pages (v2 — multi-page structure)

The app is no longer a single page with tabs. It now has real routes:

- `/` — Landing page (marketing-style intro)
- `/signup` — simple name/email form (no password, no real backend account system yet — stored in the browser only)
- `/closet` — your wardrobe (protected: redirects to `/signup` if not "logged in")
- `/mood` — Mood Mirror (protected)
- `/profile` — Aesthetic Profile (protected)
- `/swap` — AuraSwap (protected)

"Protected" here just means: if there's no name saved in the browser yet,
visiting these pages redirects you to `/signup`. This is not real
authentication — there's no password, and anyone could still hit the
backend's `/api/...` routes directly. If you want real accounts later,
the next step is a `users` table on the backend with hashed passwords
and a login endpoint, replacing `client/src/lib/useAuth.js`.

## What's new in this version (v5)

**Real authentication** — Signup/Login now hit real backend endpoints
(`/api/auth/signup`, `/api/auth/login`). Passwords are hashed with Node's
built-in `scrypt` (never stored in plain text) and checked properly on
login. Known limitation: there's no token-verification middleware on the
other API routes yet (`/api/items`, `/api/messages`, etc. don't check
who's asking) — the login system itself is real, but nothing enforces
"only the owner can edit their own closet" yet. That's the natural next
step if you keep building this.

**AI photo-tagging** — when you upload a clothing photo, it's sent to
Claude's vision capability, which guesses type/fabric/condition/aesthetic
automatically. You can still override any of its guesses before saving.

**Upcycling suggestions** — an "Upcycle idea" button on each closet card
asks the AI for a short repair or upcycling idea based on that item's
fabric and condition.

## Step 1 — Get an Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up / log in, go to "API Keys", create a new key
3. Copy it somewhere safe (you can't view it again after creating it)

## Step 2 — Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and paste your real key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

Then start it:
```bash
npm start
```

You should see: `SoulCloset+ backend running on http://localhost:4000`

## Step 3 — Set up the frontend (in a second terminal)

```bash
cd client
npm install
npm run dev
```

It will print a local URL, usually `http://localhost:5173`. Open that in
your browser — that's the app.

## Step 4 — Try it

Add a piece of clothing, try Mood Mirror, try the Aesthetic Profile, list
something on AuraSwap. Check `server/data/db.json` — you'll see your data
sitting there in plain JSON. That file is your database.

## Step 5 — Deploying it live (so you have a real link for LinkedIn/resume)

This needs two deployments, one for each folder:

**Backend** → a host that runs Node servers continuously, e.g. Render.com
or Railway.app (both have free tiers):
1. Push this whole project to a GitHub repo
2. On Render/Railway, create a new "Web Service", point it at the `server`
   folder
3. Set the environment variable `ANTHROPIC_API_KEY` in their dashboard
   (never commit your real `.env` file to GitHub — it's already in
   `.gitignore`)
4. It will give you a live URL like `https://soulcloset-api.onrender.com`

**Frontend** → Vercel or Netlify (both free):
1. Point it at the `client` folder
2. Before deploying, change every `fetch("/api/...")` in `src/App.jsx` to
   your live backend URL, e.g. `fetch("https://soulcloset-api.onrender.com/api/...")`
   (in dev, the Vite proxy handles this for you automatically — in
   production there's no proxy, so this step is required)
3. Deploy — you'll get a live link like `https://soulcloset.vercel.app`

That live link is what you put on your resume/LinkedIn/GitHub README.

## Known limitations (worth mentioning honestly in your project writeup)

- Single shared closet per backend instance — no login/accounts yet, so
  it's really a one-person demo unless you add authentication
- `db.json` isn't a "real" database (Postgres/MongoDB) — fine for a
  portfolio project, but you'd want to swap this out before any real
  users touch it
- AuraSwap "propose swap" just shows a confirmation — no real messaging
  system yet
