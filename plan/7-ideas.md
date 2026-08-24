# 7. Ideas

Not problems — these are new things the app could do. Worth talking through before building any of them.

---

## 7.1 "Just split it evenly"

**Value: HIGH · Effort: medium**

**Now we have:** The app always requires picking who ate what.

**The idea:** Sometimes nobody cares — the table just wants to divide by 5 and go home. Right now the app can't do that at all; you'd have to tap every dish for every person.

A "חלקו שווה בשווה" button would cover a very common real-world situation the app currently can't serve. Could also work per-dish, for a shared platter.

---

## 7.2 Keep the receipt photo

**Value: HIGH · Effort: medium**

**The idea:** Save the photo of the receipt and let anyone in the room open it.

Why it's useful: when someone says "no way my salad was 54 shekels", you can pull up the actual receipt on the spot instead of arguing. It also builds trust in the AI reading — people can check it themselves.

Note: storing images needs Firebase Storage (there's a free tier). A cheaper first version could keep the photo only on the phone that scanned it.

---

## 7.3 One summary message for the whole group

**Value: MEDIUM-HIGH · Effort: small**

**The idea:** Right now each person copies their own total separately. Instead, let anyone send one WhatsApp message listing what everybody owes — handy for posting into the group chat once.

---

## 7.4 "I'll cover for someone"

**Value: MEDIUM · Effort: small**

**The idea:** One person takes on another person's share — a parent paying for a kid, someone treating a friend. Very common at a family table, and right now there's no way to express it.

---

## 7.5 Let people fix their own name

**Value: MEDIUM · Effort: small**

**The idea:** Type your name with a typo and it's permanent. Let people rename themselves after joining.

---

## 7.6 History of past bills

**Value: MEDIUM · Effort: large**

**The idea:** "You've split 4 bills with this group." Nice for regulars.

Honest catch: this needs a real way to remember who you are across time. Right now the app gives you an anonymous identity that's tied to one browser on one device — clear it and you're a new person. So this is a meaningful step up in scope, not a quick add.

---

## 7.7 Scan the QR from inside the app

**Value: LOW · Effort: medium**

**The idea:** A built-in QR scanner.

My honest opinion: skip it. The phone's own camera already reads QR codes and opens the link. Building this means asking for camera permission and adding a library, to replace something that already works well.
