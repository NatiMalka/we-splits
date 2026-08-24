# Improvement Plan — מתחלקים

I went through the whole app and found about 50 things worth improving. This file is the summary: **what to fix, in what order, and why**.

Every item in the other files is written the same way: *what we have now → what's wrong with it → how to fix it.*

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

**4. The payment link doesn't work.** The host types their Bit link, it saves, and no guest ever sees it. The "pay me back" step — the whole point of the app — is a dead end today. → [2.1](2-missing-features.md)

**5. There's no way to type a room code.** The code is displayed big on screen, but there's no field anywhere to enter one. If the QR won't scan, the guest simply can't get in. → [2.2](2-missing-features.md)

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

### Phase 2 — Make it actually work
*About a day. Removes the dead ends people can hit today.*

6. Show the payment link to guests → [2.1](2-missing-features.md)
7. Share to WhatsApp in one tap instead of copy-and-paste → [2.3](2-missing-features.md)
8. Let people type a room code → [2.2](2-missing-features.md)
9. Add a back button on the summary screen → [2.5](2-missing-features.md)
10. Show a message when a tap fails to save → [6.4](6-reliability.md)
11. Stop the "forever spinner" when login fails → [6.3](6-reliability.md)

### Phase 3 — Lock the doors
*About half a day. Two of these are in your console, not the code.*

12. Check saved selections every time, not just the first → [4.1](4-security.md)
13. Require the join-time field so one bad record can't break a room → [4.2](4-security.md)
14. Use proper random room codes → [4.4](4-security.md)
15. **Turn on the two auto-delete policies in Firebase** — nothing is being deleted right now → [4.3](4-security.md)
16. **Restrict the AI key to your website** in Google AI Studio → [4.6](4-security.md)

### Phase 4 — Make it feel good
*About a day. All small, all visible.*

17. Respect the phone's "reduce motion" setting → [3.1](3-ui-ux.md)
18. Add a checkmark on picked items instead of colour only → [3.2](3-ui-ux.md)
19. Show who took what, and how many → [3.3](3-ui-ux.md)
20. Use one consistent "how much is left" number → [3.4](3-ui-ux.md)
21. Number keyboard, bigger buttons, visible focus, brighter small text → [3.6, 3.7, 3.9, 3.10](3-ui-ux.md)
22. Show the line total on the menu, not just the unit price → [3.5](3-ui-ux.md)
23. Make the shared link show a proper preview in WhatsApp → [3.12](3-ui-ux.md)

### Phase 5 — Faster and offline
*About half a day.*

24. Stop shipping Arabic and Russian fonts — easiest win on the list → [5.2](5-performance.md)
25. Load each screen only when it's opened → [5.1](5-performance.md)
26. Fix the counting-numbers slowdown → [5.3](5-performance.md)
27. Add an "you're offline" bar → [5.6](5-performance.md)
28. Make the app open without internet → [5.5](5-performance.md)

### Phase 6 — Nice to have
*No rush. Pick what you like.*

29. Let the host fix the bill after the room is open → [2.4](2-missing-features.md)
30. "Just split it evenly" button → [7.1](7-ideas.md)
31. Keep the receipt photo so people can check it → [7.2](7-ideas.md)
32. One group summary message → [7.3](7-ideas.md)

---

## My honest recommendation

**Do phases 1, 2 and 3.** That's roughly two days of work and it covers everything I'd genuinely call a problem: the app takes the wrong amount of money, one guest can mess up everyone's totals, the payment step doesn't work, and the project has no backup.

**Phases 4 and 5 are real but optional.** They make the app nicer and faster. Nothing there is broken — it's polish. Worth doing before showing it to more people, not before showing it to family.

**Phase 6 and the ideas file are for later.** Talk through them first; some are bigger than they look.

One thing worth saying plainly: for a family app, this is in good shape. The core — reading a receipt with AI, live syncing across phones, splitting the money correctly — works, and the maths behind the splitting is well tested. Most of what's above is edges and polish, apart from the four or five real problems listed at the top.

---

## Two things only you can do

These need your Firebase and Google accounts — I can't reach them:

- **Turn on the two auto-delete policies** in Firebase → Firestore → TTL, on the `expiresAt` field, for both `rooms` and `participants`. Until this is done, every test room we ever created is still stored.
- **Restrict the AI key** to `we-splits.web.app` in Google AI Studio, so nobody else can spend your free quota.
