# Improvement Plan — מתחלקים

I went through the whole app and found about 50 things worth improving. This file is the summary: **what to fix, in what order, and why**.

Every item in the other files is written the same way: *what we have now → what's wrong with it → how to fix it.*

> **What this app is** (clarified 24 Aug 2026): a tool for **diners** splitting a receipt between themselves. There is no host, nobody collects money, and the restaurant isn't involved. Everyone is equal — the only difference is that one person scanned the receipt, which is what lets them edit the items. A business/restaurant version may come much later; nothing here assumes it.

## The documents

| File | What's inside |
|---|---|
| [PROGRESS.md](PROGRESS.md) | **What we've already done.** Updated as we go. |
| [1-money-bugs.md](1-money-bugs.md) | People pay the wrong amount. Start here. |
| [2-missing-features.md](2-missing-features.md) | Features that are half-built — the code exists, there's just no button |
| [3-ui-ux.md](3-ui-ux.md) | Design, usability, accessibility |
| [4-security.md](4-security.md) | Who can see and change what |
| [5-performance.md](5-performance.md) | Speed on a real phone with restaurant internet |
| [6-reliability.md](6-reliability.md) | What happens when something goes wrong |
| [7-ideas.md](7-ideas.md) | New ideas, not problems |

---

## The 5 things that matter most

If you only read one section, read this one.

**1. ~~The project isn't saved in git.~~** ✅ **DONE** — now on [GitHub](https://github.com/NatiMalka/we-splits), secrets kept out. → [6.1](6-reliability.md)

**2. ~~The app charges a tip on bills that already include service.~~** ✅ **DONE** — bills with service now start at 0% tip. → [1.1](1-money-bugs.md)

**3. One guest can change what everyone else owes.** The security guard checks a guest's selections the first time they save, and never again. Someone can send a fake number from their own phone and quietly shift everybody's total. → [4.1](4-security.md)

**4. ~~The bill can't be fixed once the room is open.~~** ✅ **DONE** — whoever scanned the receipt can now edit it live. → [2.4](2-missing-features.md)

**5. ~~There's no way to type a room code.~~** ✅ **DONE** — there's a code-entry screen now. → [2.2](2-missing-features.md)

---

## Suggested order

### Phase 1 — Safety net and wrong money ✅ COMPLETE
*Done 24 Aug 2026 — see [PROGRESS.md](PROGRESS.md).*

Nothing here adds features. It protects the work and stops the app from taking people's money incorrectly.

1. ✅ **DONE** — Put the project in git → [6.1](6-reliability.md)
2. ✅ **DONE** — Crash safety net so errors don't blank the screen → [6.2](6-reliability.md)
3. ✅ **DONE** — Don't add a tip when the receipt already includes service → [1.1](1-money-bugs.md)
4. ✅ **DONE** — Fix the missing agorot when rounding → [1.2](1-money-bugs.md)
5. ✅ **DONE** — Warn when items don't add up to the receipt's printed total → [1.3](1-money-bugs.md)

### Phase 2 — Make it actually work ✅ COMPLETE
*Done 25 Aug 2026 — see [PROGRESS.md](PROGRESS.md).*

6. ✅ **DONE** — Share to WhatsApp in one tap instead of copy-and-paste → [2.3](2-missing-features.md)
7. ✅ **DONE** — Let people type a room code → [2.2](2-missing-features.md)
8. ✅ **DONE** — Add a back button on the summary screen → [2.5](2-missing-features.md)
9. ✅ **DONE** — Show a message when a tap fails to save → [6.4](6-reliability.md)
10. ✅ **DONE** — Stop the "forever spinner" when login fails → [6.3](6-reliability.md)

Also finished, from the same document: fixing the bill after the room is open ([2.4](2-missing-features.md)), leaving a room ([2.7](2-missing-features.md)), and closing the bill with an ending screen ([2.8](2-missing-features.md)).

### Phase 3 — Lock the doors
*About half a day. Two of these are in your console, not the code.*

12. Check saved selections every time, not just the first → [4.1](4-security.md)
13. Require the join-time field so one bad record can't break a room → [4.2](4-security.md)
14. ✅ **DONE** — Use proper random room codes → [4.4](4-security.md)
15. **Turn on the two auto-delete policies in Firebase** — nothing is being deleted right now → [4.3](4-security.md)
16. **Restrict the AI key to your website** in Google AI Studio → [4.6](4-security.md)

### Phase 4 — Make it feel good 🔄 IN PROGRESS
*Started 7 Sep 2026 — see [PROGRESS.md](PROGRESS.md).*

17. ✅ **DONE** — Respect the phone's "reduce motion" setting → [3.1](3-ui-ux.md)
18. Add a checkmark on picked items instead of colour only → [3.2](3-ui-ux.md)
19. Show who took what, and how many → [3.3](3-ui-ux.md)
20. Use one consistent "how much is left" number → [3.4](3-ui-ux.md)
21. Number keyboard, bigger buttons, visible focus, brighter small text → [3.6, 3.7, 3.9, 3.10](3-ui-ux.md)
22. Show the line total on the menu, not just the unit price → [3.5](3-ui-ux.md)
23. Make the shared link show a proper preview in WhatsApp → [3.12](3-ui-ux.md)

Also finished, found while working on the animations:

- ✅ **DONE** — The AI progress bar no longer lies (it used to freeze at 92% for up to 20s) → [3.18](3-ui-ux.md)
- ✅ **DONE** — Buttons show when they're working; joining a room had no error handling at all → [3.19](3-ui-ux.md)
- ✅ **DONE** — Placeholder shapes instead of six bare spinners → [3.14](3-ui-ux.md)
- ✅ **DONE** — Empty screens explain themselves instead of showing a bare "0 ₪" → [3.13](3-ui-ux.md)
- ✅ **DONE** — Two animations that never ran; the "everyone paid" moment is celebrated → [3.20](3-ui-ux.md)
- ✅ **DONE** — A Lottie animation while the AI reads the receipt → [3.21](3-ui-ux.md)

### Phase 5 — Faster and offline 🔄 IN PROGRESS
*Started 7 Sep 2026 — see [PROGRESS.md](PROGRESS.md).*

24. ✅ **DONE** — Stop publishing fonts for unused languages → [5.2](5-performance.md)
    ⚠️ *but this was never the "easiest win" this list claimed — it saved the user nothing. See the corrected item.*
25. ✅ **DONE (partly)** — Load each screen only when it's opened → [5.1](5-performance.md)
    **The real remaining win lives here:** Firebase is 59% of the opening download and loads even for people who never open a room. Worth ~100 KB, and needs its own careful change because it touches the money path.
26. ✅ **DONE** — Fix the counting-numbers slowdown → [5.3](5-performance.md)
27. Add an "you're offline" bar → [5.6](5-performance.md)
28. Make the app open without internet → [5.5](5-performance.md)

### Phase 6 — Nice to have
*No rush. Pick what you like.*

29. "Just split it evenly" button → [7.1](7-ideas.md)
30. Keep the receipt photo so people can check it → [7.2](7-ideas.md)
31. One group summary message → [7.3](7-ideas.md)

---

## My honest recommendation

**Phases 1 and 2 are done.** What's left that I'd genuinely call a problem is **Phase 3**, and within it [4.1](4-security.md) above all: one guest can currently rewrite what everyone else owes, from their own phone. That's the last real bug in the app.

**Phases 4 and 5 are now partly done** (7 Sep 2026). Two things found in there were *not* polish and are worth calling out:

- The AI progress bar **froze at 92%** while the real scan ran for up to another twenty seconds, never mentioning that it was retrying. That's the app's first impression, and it looked broken.
- Joining a room had **no error handling at all** — if it failed, you tapped a dead button forever with no message.

The rest of those two phases genuinely is polish. What's left in Phase 5 has one substantial item: getting Firebase off the opening download (~100 KB, 59% of it).

**Phase 6 and the ideas file are for later.** Talk through them first; some are bigger than they look.

One thing worth saying plainly: for a family app, this is in good shape. The core — reading a receipt with AI, live syncing across phones, splitting the money correctly — works, and the maths behind the splitting is well tested. Most of what's above is edges and polish, apart from the four or five real problems listed at the top.

---

## Two things only you can do

These need your Firebase and Google accounts — I can't reach them:

- **Turn on the two auto-delete policies** in Firebase → Firestore → TTL, on the `expiresAt` field, for both `rooms` and `participants`. Until this is done, every test room we ever created is still stored.
- **Restrict the AI key** to `we-splits.web.app` in Google AI Studio, so nobody else can spend your free quota.
