# Lottie animations

Files here are fetched at runtime by `src/components/ui/LottiePlayer.tsx`. They
are **not** bundled, so you can drop in a replacement and redeploy without a code
change — the filename is the contract.

| File | Used by | Loops? |
|---|---|---|
| `scan.json` | `AnalyzingOverlay` — while the AI reads the receipt | yes |

`scan.json` is hand-authored (see the generator in the commit that added it) so
the app ships with something real. To replace it with richer artwork:

1. Pick an animation from <https://lottiefiles.com> — search "receipt scan",
   "document scanning" or "invoice".
2. Check its licence badge. Some free animations require attribution.
3. Download the **Lottie JSON** (not `.lottie`, which is a zip the light player
   can't read), and save it over the file above, keeping the name.
4. Keep it under ~50 KB, and prefer warm amber / teal / coral to match the theme.
   Lottie bakes its colours in, which is why the app uses code — not Lottie — for
   anything that has to follow the theme.

Every player call site passes a static fallback icon, so a missing, broken or
oversized file degrades to that icon instead of leaving a hole in the screen.
