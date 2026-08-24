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
| Phase 1 — Safety net & wrong money | 🔄 In progress | 1 of 5 |
| Phase 2 — Make it actually work | ⏳ Not started | 0 of 6 |
| Phase 3 — Lock the doors | ⏳ Not started | 0 of 5 |
| Phase 4 — Make it feel good | ⏳ Not started | 0 of 7 |
| Phase 5 — Faster and offline | ⏳ Not started | 0 of 5 |
| Phase 6 — Nice to have | ⏳ Not started | 0 of 4 |

---

## 24 Aug 2026

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

Rest of **Phase 1** — this is where I'd continue:

| Item | What it is | Where |
|---|---|---|
| ⏳ 6.2 | Crash safety net, so an error can't blank the whole screen | [6-reliability.md](6-reliability.md) |
| ⏳ 1.1 | Stop adding a tip when the receipt already includes service | [1-money-bugs.md](1-money-bugs.md) |
| ⏳ 1.2 | Fix the disappearing agorot when rounding | [1-money-bugs.md](1-money-bugs.md) |
| ⏳ 1.3 | Warn when items don't add up to the receipt's printed total | [1-money-bugs.md](1-money-bugs.md) |

Still waiting on you (I can't reach these accounts):

| Item | What it is | Where |
|---|---|---|
| 👤 4.3 | Turn on the two auto-delete policies in Firebase — nothing is being deleted right now | [4-security.md](4-security.md) |
| 👤 4.6 | Restrict the AI key to your website in Google AI Studio | [4-security.md](4-security.md) |
