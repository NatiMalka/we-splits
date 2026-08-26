# 1. Money Bugs

People pay the wrong amount. Fix these first.

---

## 1.1 The app adds a tip even when the bill already has service ✅ DONE

**Priority: HIGH · Effort: very small · Done 24 Aug 2026**

**Now we have:** Every time a receipt is scanned, the app suggests a 12% tip.

**The problem:** Many Israeli receipts already include דמי שירות. The app doesn't notice, and adds 12% on top of it. So the whole table pays about 12% too much.

I saw this happen with your real receipt: the app correctly found 42 ₪ of service on the bill, and then still added 31.32 ₪ of tip.

**The solution:** When the receipt already has service on it, start the tip at 0% and write why ("שירות כבר נכלל"). A tip can still be added — but it should be a choice, not a silent default.

**✅ Done:** The tip now starts at 0% whenever service is detected, with a note on the review screen explaining it. Also added "בלי" (no tip) as a visible button next to 10/12/15% — before, choosing zero meant digging into "אחר". Verified on the burger-bar receipt: 48 ₪ service found, tip 0 ₪, total 526 ₪ instead of 583 ₪.

📁 `src/draft/DraftBillContext.tsx`, `src/screens/ReviewScreen.tsx`, `src/components/review/TipPercentageSelector.tsx`

---

## 1.2 Agorot disappear ✅ DONE

**Priority: MEDIUM-HIGH · Effort: small · Done 24 Aug 2026**

**Now we have:** The app divides the exact amount, and only rounds the number when it puts it on the screen.

**The problem:** Split a 100 ₪ dish between 3 people and each one sees 33.33 ₪. Add those up: 99.99 ₪. One agora vanished. Over a full bill this adds up.

Worse, you can see the contradiction on one screen: in "כל הסועדים", the people's rows can add up to less than the "סה"כ כולם" row right below them.

**The solution:** Round each person to whole shekels, and give the small leftover to one person (normally whoever opened the room) with a little "עיגול" line so the math visibly adds up.

**✅ Done:** Everyone now pays whole shekels, and the parts always add up to the whole.

One change from the original plan: instead of dumping the leftover on whoever opened the room, it goes to whoever was rounded down the most. That's fairer, and it means nobody is quietly penalised for being the one who scanned the receipt. ₪100 between three people is now 33 + 33 + 34 = ₪100 exactly.

The summary screen now shows the full breakdown — items, service, tip, and an "עיגול לשקל שלם" line — so the final number is always explainable. Same in the WhatsApp message.

One detail worth knowing: every phone works this out on its own, so the rounding had to give the *same* answer everywhere. It's now sorted in a fixed order rather than depending on who joined first — otherwise two people could see different numbers for the same bill. There's a test covering exactly that.

6 new tests (21 total, all passing).

📁 `src/lib/calc/splitEngine.ts`, `src/screens/SummaryScreen.tsx`, `src/lib/whatsapp.ts`

---

## 1.3 Nobody checks the total against the receipt ✅ DONE

**Priority: MEDIUM · Effort: very small · Done 24 Aug 2026**

**Now we have:** The app reads the printed total from the bottom of the receipt and saves it.

**The problem:** It then never uses it. If the AI misreads one price, nothing catches it, and the group happily splits a wrong bill. The whole point of the review screen is to catch AI mistakes, and the one number that could prove there's a mistake is sitting unused.

**The solution:** On the review screen, add up the items and compare to the printed total. If they're more than about 1 ₪ apart, show a small warning with both numbers so it can be checked against the paper receipt.

**✅ Done:** The review screen now compares the two and shows an amber warning when they disagree by 1 ₪ or more — telling you both numbers, the gap, and what probably went wrong. It updates live as you fix prices, so it disappears once the numbers line up.

The check is skipped when the AI couldn't read a total at all, so it doesn't cry wolf. Verified by changing a price from 68 to 20: "הפריטים למעלה מסתכמים ב־430 ₪, אבל בחשבונית כתוב 526 ₪ — חסר 96 ₪."

📁 `src/screens/ReviewScreen.tsx`, `src/components/review/TotalMismatchWarning.tsx`

---

## 1.4 Multi-unit rows were charged twice ✅ DONE

**Priority: HIGH · Effort: small · Found in a real restaurant 25 Aug 2026, fixed 26 Aug 2026**

**Now we have:** Israeli receipts print two price columns — `מחיר` (price for one unit) and `סך הכל` (total for that row). The app stores the *unit* price and multiplies it by the quantity.

**The problem:** Our instructions to the AI said to extract *"unit prices **or** total prices"* — so the AI was free to return either column, and picked one more or less at random each scan. When it returned the row total, the app multiplied an already-multiplied number.

On a real bill:

| Row | On the receipt | What the app charged |
|---|---|---|
| קולה | 14 × 2 = **28 ₪** | 28 × 2 = **56 ₪** |
| עסקית קטנטנים | 46 × 2 = **92 ₪** | 92 × 2 = **184 ₪** |

A **369 ₪** bill was billed as **489 ₪** — and the tip was calculated on the inflated figure too.

**Why it was so easy to miss:** on rows with quantity 1 both columns are the same number, so nothing looks wrong. The bug only ever shows on rows with quantity 2 or more. That's also why re-scanning the same receipt sometimes came out right.

**The solution:** Stop letting the AI choose, and stop trusting it blindly.

**✅ Done — three layers:**

1. **The instructions are no longer ambiguous.** The AI is now asked for all three numbers separately (quantity, unit price, row total), told they are different columns, and given the קולה row as a worked example. The AI also gets told a leading number in an item's name is part of the *name* — `2 ערב.קבב שיפודי` on this receipt is quantity 1, not 2.
2. **The app now checks the AI's work.** Because the receipt prints both columns *and* a grand total, both readings can be totalled and compared against the printed total — whichever reconciles is the one used. This is plain arithmetic, so it holds even if the AI misreads again. Repairs happen silently, as you asked.
3. **The warning from 1.3 stays** as the last line of defence, for anything the arithmetic can't settle. That warning is what caught this in the restaurant in the first place.

**Verified** by running the real receipt through the live AI five times: 369 ₪ every time, every row correct. Plus 7 unit tests, including the exact 369 → 489 case, so it can't come back unnoticed.

📁 `src/lib/gemini/analyzeReceipt.ts`, `src/lib/gemini/reconcileItems.ts`
