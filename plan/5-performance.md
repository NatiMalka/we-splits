# 5. Performance (Speed)

**In plain words:** the app works fine on a computer and on a good phone. These items are about making it fast on a normal phone with normal restaurant internet — which is the situation it's actually used in.

---

## 5.1 The app downloads 1 MB before showing anything

**Priority: MEDIUM · Effort: small**

**Now we have:** When you open the app, it downloads everything at once — every screen, including ones you might never open.

**The problem:** That's about 1 MB before the first thing appears on screen. On café wifi or weak mobile signal, that's a real wait — and that's exactly when people use it.

Good news: the AI part (another 350 KB) is already done correctly — it only downloads when someone actually uploads a receipt. We just need to do the same for the screens.

**The solution:** Load each screen only when someone opens it.

📁 `src/App.tsx`

---

## 5.2 We ship fonts for languages nobody uses

**Priority: MEDIUM · Effort: very small — easiest win on this list**

**Now we have:** 58 font files get sent to the website.

**The problem:** That includes full Arabic and Russian alphabets. This is a Hebrew app. Those files are pure dead weight that every visitor pays for.

**The solution:** Keep Hebrew and English only. Should cut the font files by roughly two thirds.

📁 `src/index.css`

---

## 5.3 The counting-up numbers make the app work 60× harder

**Priority: MEDIUM · Effort: small**

**Now we have:** When a total changes, the number counts up smoothly. It looks nice.

**The problem:** The way it's built, it redraws the whole screen about 60 times a second while counting. The summary screen has **four** of these running at the same time.

On a computer you'd never notice. On an older phone this is a likely cause of stuttering.

**The solution:** Animate just the number instead of redrawing everything around it.

📁 `src/hooks/useCountUp.ts`

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
