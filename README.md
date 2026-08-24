# מתחלקים (BillSplitter)

A mobile-first Hebrew (RTL) web app for splitting restaurant bills with a group. Photograph the receipt, let AI extract the items, share a room via QR/link, and everyone taps what they ate — live per-person totals with tip, no signup required.

**Live app:** https://we-splits.web.app

## Core flow

1. Host photographs or uploads a receipt.
2. Gemini Vision extracts items, quantities, prices, and service fee into structured JSON.
3. Host reviews/edits the extracted items and sets a tip percentage, then creates a room.
4. Guests join via QR code or link (just a first name, no account).
5. Everyone taps the items they had — shared items split evenly, multi-unit items can be split by exact count.
6. Live per-person totals (item share + proportional tip), a "still unclaimed" amount so nothing gets forgotten, and a WhatsApp-ready summary.

## Tech stack

- **Vite + React 19 + TypeScript** — client-only SPA, no server
- **Tailwind CSS v4** (CSS-first `@theme` config in `src/index.css`)
- **Firebase** — Firestore (data + realtime sync) + Anonymous Auth. No Cloud Functions (requires Firebase's paid Blaze plan; this stays on the free Spark plan)
- **`@google/genai`** — Gemini Vision called directly from the client to parse receipt photos (lazy-loaded, not in the main bundle)
- **`react-router-dom`**, **`motion`** (Framer Motion), **`lucide-react`**, **`react-qr-code`**
- **Vitest** for the calculation engine

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase + Gemini config, see below
npm run dev
```

### Environment variables (`.env.local`, gitignored)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

- Firebase values come from **Firebase Console → Project settings → Your apps → Web app**. The `apiKey` here is not a secret — it's meant to be public/client-embedded; security is enforced by Firestore rules, not by hiding this value.
- Gemini key: free, no billing card required, from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). This one *should* be restricted to your deployed domain under the key's settings once live, since it does ship in the client bundle.

### One-time Firebase project setup

1. **Firestore Database** → create in Native mode.
2. **Firestore → Rules** → paste `firestore.rules` (or run `.\deploy.ps1 -Rules`).
3. **Firestore → TTL policies** → add a policy on field `expiresAt` for collection ID `rooms`, and a second one for collection ID `participants` (two policies — TTL doesn't cascade to subcollections). Handles the 24h auto-cleanup of old rooms.
4. **Authentication → Sign-in method** → enable **Anonymous**.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run test` | Run the Vitest suite (calculation engine) |
| `npm run preview` | Preview the production build locally |
| `.\deploy.ps1` | Build and deploy to Firebase Hosting |
| `.\deploy.ps1 -Rules` | Also deploy `firestore.rules` |

## Architecture notes

- **`src/store/RoomStore.ts`** defines the data-access interface; `FirestoreRoomStore` is the real implementation. `LocalRoomStore` (localStorage + BroadcastChannel) still exists as an offline-dev fallback, not currently wired up.
- Room state is tri-state (`loading | not-found | ready`) via `useRoomState`, since Firestore reads are async — never collapse this back to a bare nullable check.
- `Participant.isHost` is never trusted from Firestore (a participant could spoof their own doc) — host status is always derived from `room.hostId`.
- The calculation engine (`src/lib/calc/splitEngine.ts`) is pure and framework-free, fully covered by unit tests.
- Firestore security rules (`firestore.rules`) are the *only* backend validation layer — there's no server. See the file's comments for the reasoning behind each rule.

## Known limitations

- The Gemini API key is client-side by design (no server to hide it behind, on the free plan). Fine for private/family use; revisit before going fully public.
- "Reopen the same join link, same participant" only holds within one browser profile — a different browser or incognito mints a new anonymous participant.
- Main JS bundle is ~1MB (mostly Firebase) — acceptable for this app's scale, but a candidate for further code-splitting if it grows.
