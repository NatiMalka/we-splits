# 2. Half-Built Features

These are things where the code is already written but there's no button to reach it. Cheap to finish, and they remove real dead ends.

---

## 2.1 The payment link goes nowhere

**Priority: HIGH · Effort: very small**

**Now we have:** The host types their Bit / PayBox link on the summary screen, and it saves correctly.

**The problem:** No guest ever sees it. Not on their screen, not in the WhatsApp message. So the actual "pay me back" step — arguably the point of the whole app — does not work at all.

**The solution:** Show it to guests as a button next to their total ("שלם לדני"), and add it to the WhatsApp text too.

📁 `src/screens/SummaryScreen.tsx`, `src/lib/whatsapp.ts`

---

## 2.2 There's no way to type a room code

**Priority: HIGH · Effort: small**

**Now we have:** The 6-letter code is shown nice and big on the host's screen. You can join by scanning the QR or opening the link.

**The problem:** There is no field anywhere in the app to type a code in. If the camera won't focus, or WhatsApp breaks the link, or someone just reads the code out loud across the table — the guest has no way in at all. Dead end.

(There's even a helper function `formatRoomCode` in the code that was clearly written for this screen and never used.)

**The solution:** Add "יש לי קוד חדר" on the home screen → type 6 letters → join.

📁 `src/screens/UploadScreen.tsx`, `src/App.tsx`

---

## 2.3 The WhatsApp button only copies text

**Priority: MEDIUM-HIGH · Effort: very small**

**Now we have:** The button copies your summary to the clipboard, and you paste it into WhatsApp yourself.

**The problem:** Extra steps for something that should be one tap. A function to open WhatsApp directly (`buildWhatsAppShareUrl`) was written and then never used.

**The solution:** Use the phone's built-in share sheet. One tap and it goes straight to WhatsApp, Telegram or SMS. Keep the copy option as a backup for computers.

📁 `src/components/summary/CopyToWhatsAppButton.tsx`

---

## 2.4 The host can't fix the bill after opening the room

**Priority: HIGH · Effort: medium**

**Now we have:** You can edit items only before you create the room.

**The problem:** Dessert arrives later. Or you spot that the AI missed a line. Right now your only option is to throw the room away and start over — while everyone else is already picking items.

The save function for this (`updateBillData`) is already written and the security rules already allow it. There's just no button.

**The solution:** Let the host reopen the item editor from the room screen, reusing the same editing components from the review screen.

📁 `src/screens/RoomShareScreen.tsx`, reuse `src/components/review/*`

---

## 2.5 You can't go back from the summary

**Priority: MEDIUM · Effort: very small**

**Now we have:** The summary screen has no back button at all.

**The problem:** You get to your summary, notice you picked the wrong dish, and there's no way back to the menu except the browser's back button (which people don't use in an app-like screen).

**The solution:** Add a back link to the menu.

📁 `src/screens/SummaryScreen.tsx`

---

## 2.6 The host can't tick people off as paid

**Priority: MEDIUM · Effort: small**

**Now we have:** Only guests get the "I paid" button. The host is left out on purpose.

**The problem:** Someone hands the host cash at the table. The host has no way to record it, so the "נותר לגבות" number stays wrong.

**The solution:** Let the host mark anyone as paid.

📁 `src/screens/SummaryScreen.tsx`, `src/components/summary/AllParticipantsSummary.tsx`

---

## 2.7 Nobody can be removed from a room

**Priority: MEDIUM · Effort: small**

**Now we have:** Once someone joins, they're in forever. The security rules block all deleting.

**The problem:** A guest joins with a typo in their name, or joins the wrong room by mistake. They stay in the list permanently, and so do their item picks — which affects everyone else's share.

**The solution:** Let the host remove a participant. Needs a small security-rules change too.

📁 `src/store/*`, `firestore.rules`

---

## 2.8 There's no "we're done" state

**Priority: LOW-MEDIUM · Effort: small**

**Now we have:** A room has a `status` field with an option called "completed" — which is never used anywhere. The security rules also block changing it, so it couldn't be used even if a button existed.

**The problem:** No way to close a bill off. Old rooms just sit there looking active.

**The solution:** Add a "סגור חשבון" action that freezes further changes. Needs a rules change as well.

📁 `src/types/room.ts`, `firestore.rules`
