# 5. Performance (Speed)

**In plain words:** the app works fine on a computer and on a good phone. These items are about making it fast on a normal phone with normal restaurant internet — which is the situation it's actually used in.

---

## 5.1 The app downloads 1 MB before showing anything

**Priority: MEDIUM · Effort: small** · ✅ **DONE (partly) — 7 Sep 2026**

**Now we have:** Each screen loads only when someone opens it, and the app also quietly pre-loads the screen you'll probably open next, so tapping still feels instant.

**What we measured**, compressed, which is what actually travels over the wire:

| | before | after |
|---|---|---|
| Loaded before anything appears | 322 KB | 299 KB |
| …of which is **our own code** | most of it | **6.6 KB** |

**The honest part:** that's a much smaller improvement than it looks like it should be, and it's worth knowing why. Almost none of the weight is ours:

| What | Compressed | Share |
|---|---|---|
| **Firebase** | 177 KB | **59%** |
| React + router | 69 KB | 23% |
| Animation library | 45 KB | 15% |
| **Our whole app** | **6.6 KB** | 2% |

**What's left — the one that matters:** Firebase is 59% of the wait, and it loads even for someone sitting on the first screen who never opens a room. Two reasons: `main.tsx` starts the room connection the moment the app boots, and `src/lib/firebase.ts` sets up the database and the login in the same file, so asking for login drags the whole database library in with it.

Fixing that would take roughly **100 KB** off the opening wait — by far the biggest remaining win in this document. It is *not* done here on purpose: it touches the code that moves people's money, and it deserves its own careful change rather than being bundled into UI work.

📁 `src/App.tsx`, `src/routes/lazyScreens.ts`, `vite.config.ts` · remaining: `src/main.tsx`, `src/lib/firebase.ts`

---

## 5.2 We ship fonts for languages nobody uses

**Priority: LOW · Effort: very small** · ✅ **DONE — 7 Sep 2026**

**Now we have:** Only Hebrew and English letters are published. 60 font files → 20.

**Correction to what this item used to say.** It was written as *"the easiest win on this list"* and implied every visitor was downloading Arabic and Russian alphabets. **That was wrong**, and it's worth recording why, because it's an easy mistake to repeat.

Each font file is published with a note saying *which letters it contains*. Browsers read that note first and only download the files they actually need. So nobody was ever downloading the Arabic font — it was sitting on the server unused. Real font download, before and after: roughly **60–90 KB** either way.

So this was **deploy tidiness, not a speed fix**. Still worth doing — fewer files, smaller uploads — but it saved the user nothing, and the genuine opening-speed win is [5.1](#51-the-app-downloads-1-mb-before-showing-anything) above.

*(The remaining 20 are pairs: a modern file and an old-browser copy of each. The font package lists them together, and nothing that can run this app fetches the old one.)*

📁 `src/index.css`

---

## 5.3 The counting-up numbers make the app work 60× harder

**Priority: MEDIUM · Effort: small** · ✅ **DONE — 6 Sep 2026**

**Now we have:** The number still counts up, but only the number itself is redrawn — not the whole screen around it.

**What it was:** every frame of the count went through the app's redraw system, so each counting number redrew its part of the screen about 60 times a second, and the summary screen runs **four** of them at once. This turned out to be one of two causes of the "scrolling feels stuck" problem reported on a real phone — the counting was competing with the finger for the same thread.

It also now respects the phone's "reduce motion" setting, and the digits no longer jitter sideways while counting.

📁 `src/components/ui/AnimatedCurrency.tsx` *(the old `src/hooks/useCountUp.ts` this item used to name has been deleted)*

---

## 5.4 Every single tap talks to the server

**Priority: MEDIUM · Effort: small**

**Now we have:** Tap a dish → saved immediately. And every save gets pushed out to everyone else in the room.

**The problem:** Pressing "+" five times sends five separate saves. The work grows with taps × number of people, not just taps.

Honest assessment: at family size you are nowhere near the free plan's limits, so this is not urgent. It's just cheap insurance before more people use it.

**The solution:** Wait about half a second and send one save instead of five.

📁 `src/screens/MenuScreen.tsx`

---

## 5.5 The app doesn't work without internet

**Priority: MEDIUM · Effort: medium**

**Now we have:** You can add the app to your home screen and it opens like a real app.

**The problem:** With no signal, it opens to nothing at all. Which is a shame, because the data part is *already* built to work offline — it's only the app itself that fails to load.

Restaurants are exactly where the signal is bad.

**The solution:** Save a copy of the app on the phone so it can open without internet.

📁 new service worker file

---

## 5.6 Nothing tells you when you're offline

**Priority: MEDIUM · Effort: small**

**Now we have:** If you lose signal, your taps are quietly stored and sent later.

**The problem:** That sounds good, but the screen looks completely normal — so you think everything saved and synced, when actually nobody else can see it yet.

**The solution:** A small bar at the top: "אין חיבור — שינויים יסתנכרנו".

📁 `src/components/layout/AppShell.tsx`

---

## 5.7 The browser re-downloads files it already has

**Priority: LOW · Effort: very small**

**Now we have:** No instructions to the browser about how long to keep files.

**The problem:** Files that never change (they have unique names) get re-checked more often than needed. Small effect, trivial fix.

**The solution:** Add caching instructions to the hosting config.

📁 `firebase.json`
