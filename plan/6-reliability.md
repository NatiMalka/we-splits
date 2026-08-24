# 6. Reliability

What happens when something goes wrong. Right now the honest answer is usually "nothing visible" — which is worse than an error message, because people don't know to retry.

---

## 6.1 The project is not saved in git ⚠️

**Priority: HIGHEST · Effort: 2 minutes**

**Now we have:** Nothing. There is no version history at all — just the files on your disk.

**The problem:** One accidental delete, one bad edit, one crashed program and everything we built is gone with no way back. No history, no ability to see what changed, no undo.

Of everything in these documents, this is the one I'd fix first, and it takes two minutes.

**The solution:** Turn the folder into a git repository and make a first save point. Two extra care items while doing it:
- `.env.local` holds your real keys — make sure it's excluded (it currently is, but only by luck, via a wildcard).
- `billll_g.jpg` in the main folder is a photo of a real receipt. Probably shouldn't be saved into history.
- Also add `.firebase/` and `.claude/settings.local.json` to the ignore list — neither is covered today.

📁 `.gitignore`

---

## 6.2 One error blanks the whole app

**Priority: HIGH · Effort: very small**

**Now we have:** No safety net anywhere in the app.

**The problem:** If any part of the app hits an error while drawing the screen, the entire page goes white and empty. No message, no explanation, no reload button. The user's only option is to guess that they should refresh.

**The solution:** Add a catch-all screen: "משהו נשבר — נסו לרענן", with a button.

📁 `src/main.tsx`

---

## 6.3 If login fails, the app spins forever

**Priority: HIGH · Effort: small**

**Now we have:** The app signs you in invisibly in the background before showing anything.

**The problem:** If that fails — bad key, no internet, setting switched off in Firebase — the error is thrown away silently. Nothing is written to the log, nothing is shown, and the app sits on a spinning circle **forever**.

This is the single most confusing possible failure, because it looks like the app is just slow.

**The solution:** Catch the failure, show a real message with a retry button, and write it to the log.

📁 `src/hooks/useAuthUid.ts`, `src/App.tsx`

---

## 6.4 Tapping a dish can silently fail

**Priority: MEDIUM-HIGH · Effort: small**

**Now we have:** You tap a dish and it looks selected straight away.

**The problem:** There's no error handling on that save. If the server rejects it, the item **still looks selected on your screen** — because the app is showing you a local copy. So you believe it worked, everyone else sees nothing, and your total is wrong.

**The solution:** Catch the failure and show a message so the person knows to try again.

📁 `src/screens/MenuScreen.tsx`

---

## 6.5 Every problem says "room not found"

**Priority: MEDIUM · Effort: small**

**Now we have:** When the live connection has any problem, the app shows "החדר לא נמצא — ייתכן שהקוד שגוי או שהחדר נמחק".

**The problem:** That message is shown for *everything* — including a two-second network hiccup. So a guest with a perfectly good link gets told their room doesn't exist, panics, and asks for a new one.

**The solution:** Separate the two. "Room really doesn't exist" vs "connection problem — retry", with a retry button on the second one.

📁 `src/store/FirestoreRoomStore.ts`

---

## 6.6 A missing AI key says "bad photo"

**Priority: MEDIUM · Effort: very small**

**Now we have:** Any failure while reading a receipt shows "לא הצלחנו לנתח את החשבונית. נסו שוב עם תמונה ברורה יותר".

**The problem:** That message also appears when the AI key is missing or wrong — which has nothing to do with the photo. Someone would retake the same photo five times before suspecting a settings problem. Nothing gets written to the log either.

**The solution:** Tell the difference between "bad photo", "service busy" and "app not set up properly", and log the real error.

📁 `src/screens/UploadScreen.tsx`

---

## 6.7 Fast taps can overwrite each other

**Priority: MEDIUM · Effort: small**

**Now we have:** Each tap saves your whole list of selections.

**The problem:** Tap two dishes very fast and both saves may be calculated from the same old list — so the second one wipes out the first. Same risk if you have the room open on two devices.

**The solution:** Wait for each save to finish before starting the next, or save item-by-item instead of the whole list.

📁 `src/screens/MenuScreen.tsx`

---

## 6.8 Refreshing the review screen loses the whole receipt

**Priority: MEDIUM · Effort: small**

**Now we have:** After the AI reads a receipt, the items live only in the phone's memory until you create the room.

**The problem:** Refresh the page, or switch apps long enough for the phone to unload it, and everything is gone — silently, straight back to the home screen with no explanation. You have to photograph the receipt again.

**The solution:** Keep the draft in the phone's local storage so a refresh doesn't lose it.

📁 `src/draft/DraftBillContext.tsx`

---

## 6.9 Nothing is tested except the calculator

**Priority: MEDIUM · Effort: medium**

**Now we have:** 18 tests, all covering the money-splitting maths. That part is genuinely well covered.

**The problem:** Everything else has zero tests — including the live-sync code, which is the most complicated and most breakable part of the app. Also, `deploy.ps1` will happily deploy even if the tests fail, because it never runs them.

**The solution:** Two cheap steps: make the deploy script run the tests first, and add one test that walks the whole flow (create room → join → pick items → check totals) so a future change can't quietly break the core promise of the app.

📁 `deploy.ps1`, new test file
