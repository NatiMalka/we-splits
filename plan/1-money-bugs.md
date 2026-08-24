# 1. Money Bugs

People pay the wrong amount. Fix these first.

---

## 1.1 The app adds a tip even when the bill already has service

**Priority: HIGH · Effort: very small**

**Now we have:** Every time a receipt is scanned, the app suggests a 12% tip.

**The problem:** Many Israeli receipts already include דמי שירות. The app doesn't notice, and adds 12% on top of it. So the whole table pays about 12% too much.

I saw this happen with your real receipt: the app correctly found 42 ₪ of service on the bill, and then still added 31.32 ₪ of tip.

**The solution:** When the receipt already has service on it, start the tip at 0% and write why ("שירות כבר נכלל"). The host can still choose to add a tip if they want — but it should be their choice, not a silent default.

📁 `src/draft/DraftBillContext.tsx` (line 34)

---

## 1.2 Agorot disappear

**Priority: MEDIUM-HIGH · Effort: small**

**Now we have:** The app divides the exact amount, and only rounds the number when it puts it on the screen.

**The problem:** Split a 100 ₪ dish between 3 people and each one sees 33.33 ₪. Add those up: 99.99 ₪. One agora vanished. Over a full bill this adds up.

Worse, you can see the contradiction on one screen: in "כל הסועדים", the people's rows can add up to less than the "סה"כ כולם" row right below them.

**The solution:** Round each person to whole shekels, and give the small leftover to one person (normally whoever opened the room) with a little "עיגול" line so the math visibly adds up.

📁 `src/lib/calc/splitEngine.ts`, `src/lib/format.ts`

---

## 1.3 Nobody checks the total against the receipt

**Priority: MEDIUM · Effort: very small**

**Now we have:** The app reads the printed total from the bottom of the receipt and saves it.

**The problem:** It then never uses it. If the AI misreads one price, nothing catches it, and the group happily splits a wrong bill. The whole point of the review screen is to catch AI mistakes, and the one number that could prove there's a mistake is sitting unused.

**The solution:** On the review screen, add up the items and compare to the printed total. If they're more than about 1 ₪ apart, show a small warning with both numbers so the host can check against the paper.

📁 `src/screens/ReviewScreen.tsx`
