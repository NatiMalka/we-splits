# 2. Half-Built Features

These are things where the code is already written but there's no button to reach it. Cheap to finish, and they remove real dead ends.

> **Important context added 24 Aug 2026.** I had originally built this around a "host" — one person who organises the bill and collects money from everyone else. **That was wrong.** This app is for a group of diners sorting out a receipt between themselves. Nobody organises, nobody collects, and the restaurant isn't involved at all. Everyone is equal; the only difference is that one person happened to scan the receipt.
>
> Two items below were written on the wrong assumption and are now closed. See [PROGRESS.md](PROGRESS.md) for what changed.

---

## 2.1 The payment link goes nowhere ⏸️ SHELVED

**Was: HIGH · Now: not relevant · Shelved 24 Aug 2026**

**Now we have:** The Bit / PayBox link input is switched off.

**Why it's shelved:** This assumed one person collects money from the others. In reality people settle up however they normally do — Bit, cash, whatever — and the app's job is just to say who owes what. A "pay this person" link doesn't fit.

The code is still there, behind an off switch (`src/lib/featureFlags.ts`), so it can come back quickly if a version aimed at restaurants/businesses ever happens.

📁 `src/lib/featureFlags.ts`

---

## 2.2 There's no way to type a room code ✅ DONE

**Priority: HIGH · Effort: small · Done 25 Aug 2026**

**Now we have:** The 6-letter code is shown nice and big on the room screen. You can join by scanning the QR or opening the link.

**The problem:** There is no field anywhere in the app to type a code in. If the camera won't focus, or WhatsApp breaks the link, or someone just reads the code out loud across the table — the guest has no way in at all. Dead end.

(There's even a helper function `formatRoomCode` in the code that was clearly written for this screen and never used.)

**The solution:** Add "יש לי קוד חדר" on the home screen → type 6 letters → join.

**✅ Done:** New screen at `/join` with a big 6-character field. It filters as you type — only characters that can actually appear in a code get through, and lowercase becomes uppercase automatically. So a misheard letter fails while the field is still in front of you, instead of turning into a confusing "room not found" after navigating away.

Verified end to end: a second device joined a real room purely by typing the code.

**Bonus picked up here:** codes were generated with `Math.random()`, a predictable formula — that was security item **4.4**. Since I was rewriting that exact line anyway, I fixed it: codes now use proper crypto randomness.

📁 `src/screens/EnterCodeScreen.tsx`, `src/store/roomCode.ts`, `src/App.tsx`, `src/screens/UploadScreen.tsx`

---

## 2.3 The WhatsApp button only copies text ✅ DONE

**Priority: MEDIUM-HIGH · Effort: very small · Done 25 Aug 2026**

**Now we have:** The button copies your summary to the clipboard, and you paste it into WhatsApp yourself.

**The problem:** Extra steps for something that should be one tap. A function to open WhatsApp directly (`buildWhatsAppShareUrl`) was written and then never used.

**The solution:** Use the phone's built-in share sheet. One tap and it goes straight to WhatsApp, Telegram or SMS. Keep the copy option as a backup for computers.

**✅ Done:** One tap now opens the phone's real share sheet — WhatsApp, Telegram, SMS, whatever they use. On a computer, where there's no share sheet, it falls back to copying and the button honestly says "הועתק" rather than claiming it shared.

Small detail that matters: closing the share sheet counts as normal, not as a failure — so dismissing it doesn't secretly copy to your clipboard or flash an error at you.

📁 `src/hooks/useShare.ts`, `src/components/summary/ShareSummaryButton.tsx`

---

## 2.4 The bill can't be fixed after the room is open ✅ DONE

**Priority: HIGH · Effort: medium · Done 25 Aug 2026**

**Now we have:** You can edit items only before you create the room.

**The problem:** Dessert arrives later. Or you spot that the AI missed a line. Right now your only option is to throw the room away and start over — while everyone else is already picking items.

The save function for this (`updateBillData`) is already written and the security rules already allow it. There's just no button.

**The solution:** Let whoever scanned the receipt reopen the item editor from the room screen, reusing the same editing components from the review screen. (They're the only one allowed to edit — everything else in the app treats everyone equally.)

**✅ Done:** "עריכת החשבונית" on the room screen, visible only to whoever scanned the receipt. It opens the same editor used before the room existed — fix a price, correct a name, add the dessert that arrived late. Changes reach everyone's phone immediately.

Deleting a dish somebody already picked asks first: *"3 אנשים בחרו את זה — מחיקה תסיר אותה מהם והסכום שלהם יקטן"*. Deleting something nobody picked just deletes, with no nagging.

The editor re-reads the bill each time it opens, so it can't save a stale copy over someone else's change.

📁 `src/components/room-share/EditBillSheet.tsx`, `src/screens/RoomShareScreen.tsx`

---

## 2.5 You can't go back from the summary ✅ DONE

**Priority: MEDIUM · Effort: very small · Done 25 Aug 2026**

**Now we have:** The summary screen has no back button at all.

**The problem:** You get to your summary, notice you picked the wrong dish, and there's no way back to the menu except the browser's back button (which people don't use in an app-like screen).

**The solution:** Add a back link to the menu.

**✅ Done:** Back arrow in the summary header, returning to the item list.

📁 `src/screens/SummaryScreen.tsx`

---

## 2.6 Not everyone could mark themselves as paid ✅ DONE

**Priority: MEDIUM · Effort: small · Done 24 Aug 2026**

**Now we have:** Everyone marks their own share as settled — including whoever scanned the receipt.

**The problem it fixed:** The "I paid" button was hidden from the person who created the room, because the app assumed they were collecting rather than paying. And the summary showed them a "נותר לגבות" (remaining to collect) figure, which framed them as a debt collector.

**What was done:** Removed the collector idea entirely. The "מארח" badge is gone, everyone gets the same "שילמתי" button, and "נותר לגבות" was replaced with a neutral counter: *"2 מתוך 5 סימנו ששילמו"* plus the amount still outstanding. Someone who claimed nothing isn't counted, so they can't block the "all settled" state.

📁 `src/screens/SummaryScreen.tsx`, `src/components/summary/SettleUpCard.tsx`, `src/lib/calc/splitEngine.ts`

---

## 2.7 Nobody can be removed from a room ✅ DONE

**Priority: MEDIUM · Effort: small · Done 25 Aug 2026**

**Now we have:** Once someone joins, they're in forever. The security rules block all deleting.

**The problem:** A guest joins with a typo in their name, or joins the wrong room by mistake. They stay in the list permanently, and so do their item picks — which affects everyone else's share.

**The solution:** Let whoever scanned the receipt remove a participant. Needs a small security-rules change too.

**✅ Done** (your choice: leave yourself, and the scanner can remove others): "עזוב את החדר" at the bottom of the summary. It warns first, because leaving deletes your picks — which changes the amount for anyone who shared a dish with you.

The security rules now allow removing a participant only if it's yourself, or if you scanned the receipt. **These rules are deployed** (rules only — your app deploy is untouched).

Verified live: a guest left, and vanished from the other device's list within a second.

📁 `src/components/summary/RoomFooterActions.tsx`, `src/store/*`, `firestore.rules`

---

## 2.8 There's no "we're done" state ✅ DONE

**Priority: LOW-MEDIUM · Effort: medium · Done 25 Aug 2026**

**Now we have:** A room has a `status` field with an option called "completed" — which is never used anywhere. The security rules also block changing it, so it couldn't be used even if a button existed.

**The problem:** No way to close a bill off. Old rooms just sit there looking active.

**The solution:** Add a "סגור חשבון" action that freezes further changes. Needs a rules change as well.

**✅ Done — built bigger than originally planned, following your description:** "סגור חשבון" (scanner only, with a confirmation that tells you how many people still haven't marked themselves paid). Closing it moves **everyone** in the room to a new ending screen:

- Confetti and a "החשבון נסגר!" celebration
- "תודה שהתחלקתם ב<שם המסעדה>"
- The final bill — everyone's name, avatar and amount, with a tick for whoever settled
- **"שתפו את מתחלקים עם חברים"** — shares the app itself, right at the moment people have just had a good experience with it
- "חשבון חדש" to start again

Nobody needs to be told the bill closed: every phone still in the room is moved there automatically by the live sync. Verified with two devices — one pressed the button, the other arrived on the ending screen by itself.

The confetti is skipped entirely when the phone's "reduce motion" setting is on.

📁 `src/screens/BillClosedScreen.tsx`, `src/components/closed/*`, `src/hooks/useRedirectWhenClosed.ts`, `firestore.rules`
