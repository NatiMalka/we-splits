# 3. UI / UX

Design, usability and accessibility. Most of these are small changes that make the app feel considerably more finished.

---

## 3.1 Animations can't be turned off

**Priority: MEDIUM-HIGH · Effort: very small**

**Now we have:** The app animates a lot — screens fade, lists slide in one by one, numbers count up, and the receipt icon on the home screen floats forever.

**The problem:** Every phone has a "reduce motion" setting for people who get dizzy or nauseous from movement. The app completely ignores it — there is not a single line about it anywhere in the code.

**The solution:** Check that setting and turn the animations off when it's on. One small block of CSS plus a check in the counting-numbers code.

📁 `src/index.css`, `src/hooks/useCountUp.ts`, `src/components/upload/UploadHero.tsx`

---

## 3.2 "I picked this" is shown only by colour

**Priority: MEDIUM-HIGH · Effort: small**

**Now we have:** When you tap an item, its background turns slightly green.

**The problem:** That's the single most important state in the whole app and it's a faint colour change and nothing else. No checkmark, no text. Easy to miss, and invisible to colourblind users.

**The solution:** Add a clear checkmark, and make the picked state more obvious.

📁 `src/components/menu/MenuItemCard.tsx`

---

## 3.3 You can't really tell who took what

**Priority: MEDIUM · Effort: small**

**Now we have:** Small coloured circles with one letter in them, next to each item.

**The problem:** "דני" and "דוד" both show **ד**, and the only difference is the circle colour. In a family group that's genuinely confusing.

Also — the app already knows Dani took 2 beers out of 3. It just never shows that number anywhere.

**The solution:** Tap an item to see the real names and how many units each person took.

📁 `src/components/menu/MenuItemCard.tsx`, `src/screens/MenuScreen.tsx`

---

## 3.4 Two different "how much is left" numbers that disagree

**Priority: MEDIUM · Effort: small**

**Now we have:** The menu screen shows a percentage based on the **number of items** picked. The summary screen shows how much **money** is still unpicked.

**The problem:** These two can tell you completely different stories. Pick 9 of 10 items and the menu happily says "90% שויך" — even if the one item nobody picked is the 189 ₪ platter, which is most of the bill.

**The solution:** Base both on money, so 90% always means 90% of the shekels.

📁 `src/components/menu/MenuScreenHeader.tsx`, `src/lib/calc/splitEngine.ts`

---

## 3.5 The menu shows a price you don't actually pay

**Priority: MEDIUM · Effort: very small**

**Now we have:** An item like "בירה ×3" shows 14 ₪.

**The problem:** The app actually charges 42 ₪ for that line. So the number on screen is not the number that lands in your total. Confusing when people check their own math.

**The solution:** Show both — "14 ₪ ליחידה · 42 ₪ סה"כ".

📁 `src/components/menu/MenuItemCard.tsx`

---

## 3.6 Wrong keyboard for typing numbers

**Priority: MEDIUM · Effort: very small**

**Now we have:** Tapping a price or quantity field opens the normal letters keyboard.

**The problem:** You have to switch to numbers yourself, every single time, on the app's most-typed screen.

**The solution:** One extra attribute on those fields so the number pad opens automatically.

📁 `src/components/review/ItemEditableRow.tsx`, `src/components/review/TipPercentageSelector.tsx`

---

## 3.7 Some buttons are too small to hit

**Priority: MEDIUM · Effort: very small**

**Now we have:** The back arrow, the delete-item bin, and the +/− buttons are roughly 28–32 pixels.

**The problem:** The recommended minimum for a finger is 44. The bin icon is especially risky because it sits right next to a text field — easy to delete a dish while trying to edit it.

**The solution:** Add padding around them so the tappable area is bigger, even if the icon stays the same size.

📁 `src/components/ui/NumberStepper.tsx`, `src/components/review/ItemEditableRow.tsx`, `src/screens/ReviewScreen.tsx`

---

## 3.8 Deleting a dish can't be undone

**Priority: MEDIUM · Effort: small**

**Now we have:** Tap the bin, the item is gone.

**The problem:** No confirmation, no undo. Combined with the small tap target above, it's easy to lose a line and not notice.

**The solution:** A short "נמחק — בטל" message that lets you take it back.

📁 `src/screens/ReviewScreen.tsx`

---

## 3.9 Some text is too faint to read

**Priority: MEDIUM · Effort: small**

**Now we have:** Lots of small grey text at 30–40% opacity on the dark background.

**The problem:** It falls below the readable contrast level — and this app gets used on a sunny café patio, which is the hardest case there is.

**The solution:** Raise the opacity on the small text. Nothing needs to be redesigned.

📁 across components — search for `text-brand-sand/30` and `/40`

---

## 3.10 Keyboard focus is invisible in the item editor

**Priority: MEDIUM · Effort: very small**

**Now we have:** The name / quantity / price fields have their focus outline removed, with nothing added back.

**The problem:** If you're using a keyboard, you cannot see which field you're in.

**The solution:** Add a visible focus ring.

📁 `src/components/review/ItemEditableRow.tsx`

---

## 3.11 Nothing tells a new guest what to do

**Priority: MEDIUM · Effort: small**

**Now we have:** A guest joins and lands on a list of dishes with nothing selected and no instructions.

**The problem:** It's not obvious you're meant to tap the things you ate.

**The solution:** One dismissible line at the top — "סמנו מה אכלתם".

📁 `src/screens/MenuScreen.tsx`

---

## 3.12 The shared link looks blank in WhatsApp

**Priority: MEDIUM · Effort: very small**

**Now we have:** The join link is plain — no preview title, description or picture.

**The problem:** Sharing a link in WhatsApp is *the* way people get into this app, and right now it arrives looking like a bare, slightly suspicious URL. A proper preview card makes people much more likely to tap it.

**The solution:** Add description and preview tags to the page.

📁 `index.html`

---

## 3.13 Empty situations aren't explained

**Priority: MEDIUM · Effort: small**

**Now we have:** Several screens show a bare 0 ₪ with no explanation.

**The problem:** Two real cases:
- You open your summary without picking anything → just "0 ₪", no hint, no way back.
- If you're not actually in the room, the summary shows a confident 0 ₪ instead of sending you to join. That looks like a bug.

**The solution:** Add short messages for both, with a link to the right place.

📁 `src/screens/SummaryScreen.tsx`

---

## 3.14 Loading is a bare spinner, and can spin forever

**Priority: MEDIUM · Effort: small**

**Now we have:** A small spinning circle in the middle of the screen while data loads.

**The problem:** No text, no sense of progress. And if login quietly fails, the app spins **forever** with no message and nothing in the log — see reliability doc, item 6.3.

**The solution:** Grey placeholder shapes instead of a spinner, plus a message if it takes too long.

📁 `src/components/ui/Spinner.tsx` and the screens that use it

---

## 3.15 Long bills are hard to work through

**Priority: LOW-MEDIUM · Effort: small**

**Now we have:** All items in one long scrolling list, in receipt order.

**The problem:** On a 25-item receipt, finding your dish is a lot of thumb-scrolling. And because each row fades in slightly after the one above it, the 40th item appears about 2 seconds late.

**The solution:** A search box, and cap the fade-in delay.

📁 `src/screens/MenuScreen.tsx`, `src/components/summary/SummaryItemRow.tsx`

---

## 3.16 The quantity pop-up ignores the keyboard

**Priority: LOW-MEDIUM · Effort: small**

**Now we have:** The "split quantity" sheet slides up from the bottom.

**The problem:** Escape doesn't close it, keyboard focus isn't trapped inside it, and screen readers aren't told it's a pop-up at all. Its "אישור" button also does nothing except close — the changes were already saved as you pressed +/−.

**The solution:** Standard pop-up behaviour, and make "אישור" actually mean confirm.

📁 `src/components/menu/QuantitySplitSheet.tsx`

---

## 3.17 Dark mode only

**Priority: MEDIUM · Effort: large**

**Now we have:** One dark theme. It looks good.

**The problem:** The actual place people use this is a restaurant — often outdoors, in daylight. Dark glass on a bright patio is hard to read.

**The solution:** Consider a light theme. Being honest: this is a big job, because every glass surface, colour and glow is tuned for dark. Worth discussing before starting.

📁 `src/index.css` and most components
