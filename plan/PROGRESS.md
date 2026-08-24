# Progress

What we've done from the plan so far. Newest at the top.

**Status meaning:**
- ✅ **DONE** — finished and verified
- 🔄 **IN PROGRESS** — started, not finished
- ⏳ **TODO** — not started yet
- 👤 **YOURS** — waiting on you (needs your Firebase / Google account)

---

## Summary

| Phase | Status | Done |
|---|---|---|
| **Phase 1 — Safety net & wrong money** | ✅ **Complete** | **5 of 5** |
| Phase 2 — Make it actually work | ⏳ Not started | 0 of 6 |
| Phase 3 — Lock the doors | ⏳ Not started | 0 of 5 |
| Phase 4 — Make it feel good | ⏳ Not started | 0 of 7 |
| Phase 5 — Faster and offline | ⏳ Not started | 0 of 5 |
| Phase 6 — Nice to have | ⏳ Not started | 0 of 4 |

---

## 24 Aug 2026 — Phase 1 complete 🎉

### ✅ 1.3 — The app now checks the receipt total

**Was:** The app read the printed total off the receipt and never used it, so a misread price went unnoticed.

**Now:** The review screen compares the items against the printed total and warns when they disagree by 1 ₪ or more — showing both numbers and the gap. It updates as you type, so it disappears once you've fixed things. Skipped when the AI couldn't read a total, so it doesn't cry wolf.

Tested by changing a price from 68 to 20 → *"הפריטים למעלה מסתכמים ב־430 ₪, אבל בחשבונית כתוב 526 ₪ — חסר 96 ₪."*

📄 [1-money-bugs.md](1-money-bugs.md) item 1.3

---

### ✅ 1.2 — Whole shekels, and the parts add up

**Was:** ₪100 split three ways showed 33.33 each — which adds up to ₪99.99, not ₪100.

**Now:** Everyone pays whole shekels and the total always matches the bill. ₪100 between three is 33 + 33 + 34.

**One improvement on the original plan:** rather than dumping the leftover agorot on whoever opened the room, it now goes to whoever was rounded down the most. Fairer, and the host isn't quietly penalised for hosting.

The summary now shows the full breakdown — items, service, tip, and an "עיגול לשקל שלם" line — so the final number is always explainable rather than appearing out of nowhere. Same in the WhatsApp message.

**Something subtle worth knowing:** every phone calculates this independently, so the rounding had to land on the *same* answer on every device. It now sorts in a fixed order instead of depending on who joined first — otherwise two people could see different amounts for the same bill. There's a test specifically for that.

6 new tests (21 total, all passing).

📄 [1-money-bugs.md](1-money-bugs.md) item 1.2

---

### ✅ 1.1 — No more double tipping

**Was:** The app always suggested 12% tip, even on receipts that already included דמי שירות — so the table paid roughly 12% too much.

**Now:** When service is already on the receipt, the tip starts at 0% and a line explains why. Adding a tip anyway is still possible — it's just a deliberate choice now instead of a silent default.

Also added **"בלי"** (no tip) as a visible button alongside 10/12/15%. Before, choosing zero meant digging into "אחר", which made the correct choice the most hidden one.

Verified on the burger-bar receipt: 48 ₪ service found, tip 0 ₪, total **526 ₪** — where the old behaviour would have charged **583 ₪**.

📄 [1-money-bugs.md](1-money-bugs.md) item 1.1

---

### ✅ 6.2 — No more white screens

**Was:** Any unexpected error left a completely blank white page — no message, no way to recover except guessing to refresh.

**Now:** A friendly screen appears instead: "משהו נשבר" with a "רענן את הדף" button. The real error still goes to the browser log so it can be diagnosed.

Verified properly rather than assumed: I deliberately crashed a screen, confirmed the fallback appeared, then removed the test crash.

📄 [6-reliability.md](6-reliability.md) item 6.2

---

### ✅ 6.1 — Project is now saved in git

**Was:** No version control at all. One accident and everything was gone.

**Now:** The project is a git repository, pushed to
[github.com/NatiMalka/we-splits](https://github.com/NatiMalka/we-splits) on the `main` branch.
108 files, one initial commit.

**What was done to keep secrets safe:**

- Rewrote `.gitignore` so secrets are blocked *on purpose*, not by luck. Before, your
  `.env.local` was only excluded because of a general `*.local` rule — easy to break by accident.
  Now there's an explicit `.env` / `.env.*` rule (with `.env.example` deliberately allowed through).
- Also newly ignored: `.firebase/` (deploy cache), `.claude/settings.local.json`
  (has your machine's folder paths in it), `*.tsbuildinfo`, and photo files.
- `billll_g.jpg` — the real receipt photo in the project folder — is **not** committed.
  It's a real receipt, so it doesn't belong in public history. It's still on your disk.

**Checks run before pushing:**

1. Confirmed each sensitive file was actually ignored (not just assumed).
2. Searched everything about to be committed for your real Firebase and Gemini key
   values — nothing found.
3. Confirmed `.env.example` holds only empty placeholders.
4. After pushing, re-checked GitHub itself for any secret file — clean.

**One extra fix along the way:** your computer's global git setting pointed all
logins at the AWS CodeCommit helper (from work). That would have interfered with
GitHub. GitHub is now set separately, for this project only — your AWS setup is
untouched and still works exactly as before.

📄 See [6-reliability.md](6-reliability.md) item 6.1

---

## Next up

**Phase 2 — Make it actually work.** Removes the dead ends people can hit today:

| Item | What it is | Where |
|---|---|---|
| ⏳ 2.1 | Show the payment link to guests — right now nobody sees it | [2-missing-features.md](2-missing-features.md) |
| ⏳ 2.3 | Share to WhatsApp in one tap instead of copy-and-paste | [2-missing-features.md](2-missing-features.md) |
| ⏳ 2.2 | Let people type a room code | [2-missing-features.md](2-missing-features.md) |
| ⏳ 2.5 | Back button on the summary screen | [2-missing-features.md](2-missing-features.md) |
| ⏳ 6.4 | Show a message when a tap fails to save | [6-reliability.md](6-reliability.md) |
| ⏳ 6.3 | Stop the "forever spinner" when login fails | [6-reliability.md](6-reliability.md) |

Still waiting on you (I can't reach these accounts):

| Item | What it is | Where |
|---|---|---|
| 👤 4.3 | Turn on the two auto-delete policies in Firebase — nothing is being deleted right now | [4-security.md](4-security.md) |
| 👤 4.6 | Restrict the AI key to your website in Google AI Studio | [4-security.md](4-security.md) |
