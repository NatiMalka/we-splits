# 4. Security

**First, some background in plain words.**

This app has no server of its own. The phones talk straight to the database. So the only thing protecting the data is a file of rules called `firestore.rules` — it's the guard at the door. If the guard doesn't check something, nobody does.

That's why these items matter more than they would in a normal app.

---

## 4.1 One guest can change what everybody else owes ⚠️

**Priority: HIGH · Effort: small — this is the important one**

**Now we have:** When you tap dishes, your phone saves a list of what you took. The guard checks that list is sensible **the first time** you save it.

**The problem:** It never checks again. Every save after that goes through unchecked.

Why that matters: the app splits a shared dish by "how many parts each person took". So if someone sends a fake huge number — "I took 9999 of this dish" — everyone else's share of it gets divided down to almost nothing. Their totals change without them doing anything.

And if someone sends text where a number should be, every total in the room shows up broken instead of a price.

This isn't just untidy. **One person at the table can rewrite what everyone owes**, from their own phone, without anyone noticing.

**The solution:** Make the guard check the list on **every** save, not just the first: it has to be real numbers, sensible sizes, and not a crazy-long list.

📁 `firestore.rules`

---

## 4.2 One bad save can break the room for everyone

**Priority: HIGH · Effort: very small**

**Now we have:** When you join a room, your phone saves your name and the time you joined.

**The problem:** The guard doesn't insist that the join-time is actually there. If a record arrives without it, the app crashes — **not just for that person, but for every single person in that room**, because everyone is reading the same live data.

And because the rules block deleting anything, that broken record can never be removed. The room is dead forever.

**The solution:** Two things — make the guard require that field, and add a crash guard in the app so one bad record can't take the whole screen down (see reliability doc, item 6.1).

📁 `firestore.rules`, `src/main.tsx`

---

## 4.3 Rooms are not actually being deleted

**Priority: MEDIUM · Effort: very small (but needs your Firebase console)**

**Now we have:** The app writes "delete me after 24 hours" onto every room.

**The problem:** Two separate gaps:

1. **The automatic cleanup was never switched on.** So right now *nothing* is being deleted — every test room you and I created is still sitting in the database.
2. The guard only checks that the expiry is *a date*, not that it's 24 hours from now. So someone could set the year 9999 and their room would never be cleaned up.

**The solution:** Turn on the two cleanup policies in the Firebase console (you'll need to do this part — I can't reach it). And tighten the rule so the expiry has to be about 24 hours away.

📁 Firebase console → Firestore → TTL, plus `firestore.rules`

---

## 4.4 Room codes are guessable

**Priority: MEDIUM · Effort: very small**

**Now we have:** Codes are 6 letters, made with the browser's ordinary random function.

**The problem:** That "random" function isn't really random — it's a predictable formula. Someone who collects a few codes can work out what's coming next. On top of that, the app lets anyone check whether a code exists, so guesses are cheap to test.

**The solution:** Use the browser's proper secure random function instead. It's a one-line change.

📁 `src/store/roomCode.ts`

---

## 4.5 Anyone with a code sees everything — and can walk into any room

**Priority: MEDIUM · Effort: small**

**Now we have:** Knowing the 6-letter code gets you the whole room: all the items, all the names, who paid.

**The problem:** The guard never checks that you were actually invited. So someone can add themselves to any room without ever going through the join screen.

To be fair: the information isn't very sensitive — first names and the price of a salad. For family use this is fine.

**The solution:** Accept it for now. But this is the main thing to fix before letting strangers use the app.

📁 `firestore.rules`

---

## 4.6 The AI key is public and costs money

**Priority: MEDIUM · Effort: very small (your Google console)**

**Now we have:** The key that lets the app read receipts is inside the app's code, which anyone can download from the website.

**The problem:** We knew about this — there's no server to hide it behind on the free plan. Two details that make it a bit worse than expected:

- The key sits in the part of the app that loads **immediately**, so someone can grab it without ever uploading a receipt.
- There's no limit on how many times the app will call the AI. So whoever takes the key can burn through your free quota.

**The solution:** Restrict the key to your website only, in Google AI Studio (you already have this on your list). Longer term, if this ever goes public, it needs a small server in front of it.

📁 Google AI Studio key settings

---

## 4.7 Someone could fill up your free storage

**Priority: LOW-MEDIUM · Effort: small**

**Now we have:** No limit on how big a room can be, or how many rooms one person can make.

**The problem:** Someone could create lots of huge rooms and use up the free plan's storage or daily write limit — which would take the app down for you, not cost you money.

**The solution:** Add size limits to the rules. Low urgency while the app is private.

📁 `firestore.rules`
