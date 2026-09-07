# 3. UI / UX

Design, usability and accessibility. Most of these are small changes that make the app feel considerably more finished.

---

## 3.1 Animations can't be turned off

**Priority: MEDIUM-HIGH · Effort: very small** · ✅ **DONE — 7 Sep 2026**

**Now we have:** The app checks the phone's "reduce motion" setting and respects it everywhere.

It turned out one line does almost all of it. The animation library has a single switch that covers **every** animated component at once — all ~35 of them, including the receipt icon that floats forever on the home screen. Before this, exactly two components checked the setting for themselves. Editing 35 files would have been the wrong fix.

Also added: the matching CSS rule for the few things not driven by the animation library, and the new scanning animation doesn't even download when reduce-motion is on — it shows a still icon instead.

📁 `src/App.tsx` (the switch), `src/index.css` (the CSS half)

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

**Priority: MEDIUM · Effort: small** · ✅ **DONE — 7 Sep 2026**

**Now we have:** Open your summary without picking anything and it says *"עדיין לא בחרת מנות"* with a button straight back to the dish list — instead of a confident **0 ₪** that read as a bug. The "share my summary" button is hidden too; there was nothing to share.

The app had exactly **one** empty state in the whole codebase before this. Also added:

- The item list when you delete every row — previously it collapsed to a lone "add item" button with no explanation.
- The share screen while you wait for people. This one changed during the work: the state originally written for it (*"waiting for joiners"*) turned out to be nearly unreachable, because whoever scanned the receipt counts as a participant, so the card reads "(1)" from the moment the room exists. The state the host is really in is *"רק אתם כאן — שתפו את הקוד"*.

📁 `src/components/ui/EmptyState.tsx`, `src/screens/SummaryScreen.tsx`, `src/components/review/ItemList.tsx`, `src/components/room-share/ParticipantJoinFeed.tsx`

---

## 3.14 Loading is a bare spinner, and can spin forever

**Priority: MEDIUM · Effort: small** · ✅ **DONE — 7 Sep 2026**

**Now we have:** Grey placeholder shapes in the shape of the real list, so the screen looks like it's filling in rather than like something is stuck. Six screens showed the same text-free spinning circle before.

A second problem was hiding underneath: all six of those screens returned their spinner *before* the screen-transition wrapper, so arriving at a room had no entrance animation at all and the spinner snapped to the content. Now it fades across.

*(The "spins forever if login fails" half was fixed earlier — see [6.3](6-reliability.md).)*

📁 `src/components/ui/Skeleton.tsx`, `src/components/ui/RoomLoadingState.tsx`, and the six room screens

---

## 3.15 Long bills are hard to work through

**Priority: LOW-MEDIUM · Effort: small**

**Now we have:** All items in one long scrolling list, in receipt order.

**The problem:** On a 25-item receipt, finding your dish is a lot of thumb-scrolling. And because each row fades in slightly after the one above it, the 40th item appears about 2 seconds late.

**The solution:** A search box, and cap the fade-in delay.

✅ **Half done — 7 Sep 2026:** the fade-in delay is capped. However long the receipt, the whole cascade now finishes within half a second, so the last row never keeps you waiting. **Still to do:** the search box.

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

---

## 3.18 The screen lied about how far along the AI was

**Priority: HIGH · Effort: small** · ✅ **DONE — 7 Sep 2026**

**Now we have:** While the AI reads your receipt, the screen tells you what is actually happening — and admits when it doesn't know.

**What it was:** the loading bar filled to 92% in two seconds and then **froze there**. Three status lines advanced on a blind timer with no connection to the real request. And if the AI service was busy, the app quietly retried up to three times without ever saying so.

The catch: a real scan takes 10–25 seconds. The screen had been tuned against the fake 2-second delay used in development and never re-checked against the real thing. So people sat watching a frozen 92% for twenty seconds with no idea anything was still happening.

**The rule now:** never show a percentage we can't justify. While we're waiting on the AI we genuinely don't know how long it will take, so the bar sweeps instead of claiming a number. Past 12 seconds it says *"לוקח יותר מהרגיל"*. If it's retrying, it says so, and which attempt.

📁 `src/components/upload/AnalyzingOverlay.tsx`, `src/components/upload/analyzeStageCopy.ts`, `src/lib/gemini/analyzeReceipt.ts`

---

## 3.19 Buttons gave no sign they were working

**Priority: MEDIUM-HIGH · Effort: small** · ✅ **DONE — 7 Sep 2026**

**Now we have:** Buttons that are saving something say so, and show a spinner.

Three places had nothing:

- **"צור חדר"** faded to 40% and that was it. Dimmed-and-dead reads as *broken*, not as *working* — so a loading button now stays fully bright, with a spinner and *"יוצר חדר..."*.
- **Joining a room** had no "working" state and, worse, **no error handling at all**. If joining failed nothing was shown — you tapped a dead button forever. It also let extra taps through, firing pointless repeat saves. *(It could not create a duplicate person — that was checked.)*
- **"סגור חשבון"** — the biggest action in the app — waits for the server to confirm before moving everyone to the ending screen. The host used to tap it and sit on a frozen screen for that whole round trip.

📁 `src/components/ui/Button.tsx`, `src/components/join/JoinForm.tsx`, `src/components/summary/RoomFooterActions.tsx`, `src/components/review/ReviewSummaryBar.tsx`

---

## 3.20 Two animations that never ran, and an uncelebrated finish

**Priority: LOW-MEDIUM · Effort: very small** · ✅ **DONE — 7 Sep 2026**

Small things found while going through the animation code:

- **Two panels closed instantly** while opening smoothly — "כל הסועדים" and "הסכום שלי". Both had closing animations written, but neither was wired up, so the code never ran.
- **The moment everyone finishes paying** — arguably the happiest moment in the app — replaced the amount with a plain **✓** text character, with no transition at all. It's now a checkmark that draws itself on.

📁 `src/components/summary/AllParticipantsSummary.tsx`, `src/components/menu/LiveTotalsDrawer.tsx`, `src/components/ui/AnimatedCheck.tsx`, `src/components/summary/SettleUpCard.tsx`

---

## 3.21 Lottie animations — and why only in one place

**Priority: LOW · Effort: medium** · ✅ **DONE (the first one) — 7 Sep 2026**

**Now we have:** A proper illustrated animation — a beam sweeping over a receipt — while the AI reads your bill.

**Why only there.** Lottie animations are artwork files. They're wonderful for illustration and the wrong tool for everything else, for three reasons: they need a **47 KB player** downloaded, their **colours are baked in** so they can't follow the app's theme (and would all need redoing if a light theme ever lands — see [3.17](#317-dark-mode-only)), and each one is a file that has to be found and licence-checked.

So the split is deliberate:

| | Approach |
|---|---|
| The AI reading your receipt | **Lottie** — the longest wait in the app, and real illustration says what's happening better than a spinning icon |
| Checkmarks, placeholders, sliding panels, counting numbers, screen changes | **Code** — free, follows the theme, works offline |

**What it costs:** nothing up front. The player and the artwork both download only when someone actually scans a receipt — the opening download grew by **98 bytes**. If the file is missing, fails to load, or reduce-motion is on, you get the old spinning icon instead and nothing breaks.

**To make it fancier:** the animation is at `public/lottie/scan.json` and can be swapped for anything from [lottiefiles.com](https://lottiefiles.com) without touching code. Instructions are in `public/lottie/README.md`.

**Not done:** a Lottie for the ending/celebration screen. The existing confetti is 9 hand-made falling rectangles — sparse, no burst, and nothing at all under reduce-motion. Worth revisiting, but it needs artwork chosen first.

📁 `src/components/ui/LottiePlayer.tsx`, `public/lottie/`
