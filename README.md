# WildDex — a real-life Pokédex 🔍

Snap any creature or plant in nature, get an instant ID with fun facts, and add it
to your growing personal collection. Mobile-first web app (installable PWA).

## How it works

```
Phone camera ──> /identify (backend) ──> Claude vision ──> structured entry
                       (holds the API key)                  (name, facts, rarity…)
   └────────── result card ──> "Add to Dex" ──> IndexedDB (on-device collection)
```

- **Frontend** — React + Vite PWA (`src/`). Camera capture, result card, collection.
- **Backend** — tiny Express proxy (`server/`) that holds the Claude API key and
  exposes `POST /identify`.
- **Identification** — `server/identify.js` is the swappable "brain". It returns a
  fixed shape (`server/schema.js`) so specialist species-ID APIs can be added later
  without touching the UI.
- **Collection** — saved on-device in IndexedDB (`src/lib/storage.js`). No login.

## Run it

```bash
npm install
cp .env.example .env      # then add your ANTHROPIC_API_KEY
npm run dev               # starts the API (8787) + Vite (5173) together
```

Open the printed `http://localhost:5173`. To use it on your phone, open the
**Network** URL Vite prints (same Wi-Fi) — camera capture needs that.

### No API key yet?

Leave `ANTHROPIC_API_KEY` unset (or set `USE_MOCK=1`) and the app runs against a
built-in mock identifier so you can click through the whole experience.

## Scripts

- `npm run dev` — backend + frontend together
- `npm run server` — backend only
- `npm run client` — frontend only
- `npm run build` — production build
