# Kickoff — `g8-resolve` (R69–R73)

Historical kickoff — **landed** 17 Oct 2026 (`R69`–`R73` closed).
Keep for regressions. Do not re-open as **Now**.

Copy everything below the line only if re-running the slice.

Do not start Phase 3, G9 pairing, or G15 unless Ron asks.

---

Follow `docs/principles.md` (**Naming**, visual fidelity). Sources:
[`docs/tech-issues.md`](../tech-issues.md) open `R69`–`R73`,
`roadmap.md` **Now** `g8-resolve`,
[`validate-status.md`](validate-status.md) G8 table.
Update tech-issues / roadmap **Now** / validate-status in the same
change. Smoke [`sanity-landed.md`](sanity-landed.md).

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
parked. Doc map: [`../README.md`](../README.md).

## Must do

1. **`R69`** — Show keys chrome: live key strip shares the **same
   vertical band** as the top buttons (no second strip that steals
   height). With keys mode on, Hide keys / More / Pin stay
   **auto-hidden** and appear **on hover** in that row (Close may
   stay visible or follow the same rule if it sits in that band).
2. **`R70`** — Pol / Rec entry: no placeholder boxes in the
   arguments. Unit shows open `Pol(` / `Rec(` only; comma only after
   the user types it. Same family as closed `R49` / `R57` / `R62`.
3. **`R71`** — Pol result (`r=`, `θ=`) at normal result size/weight
   (not much smaller than a COMP result). Dual-line pair stays
   (`debt-value` already ok — do not refile).
4. **`R72`** — Inside Rec, a square-root argument must sit on the
   **same writing line** as the other argument (unit does). Not a
   refile of `R45` / `R53`.
5. **`R73`** — PC keyboard: `,` is a first-class shortcut (same as
   SHIFT `)` / argument comma). Works in COMP templates (Pol/Rec,
   etc.) and is listed in Keyboard shortcuts help.

Also: goldens / focused tests. Do not `Read` large PNGs. Prefer
editing under `src/` only as needed — Ron may have the app open;
Vite HMR is off by default.

## Do not

- Start G9 / G15 pairing or Phase 3.
- Change EVAL for G8 values that already matched (Pol/Rec numbers,
  X/Y writes).
- Refile closed `R16` or `debt-value`.
- Hand-rewrite to “revert”; use git if Ron asks
  (`.cursor/rules/git-revert.mdc`).
- Name the hardware vendor or original model. Touch `manual.pdf`.
- Edit canvases unless Ron asks.

## Done when

- `R69`–`R73` closed in `docs/tech-issues.md`.
- `npm test` / `npm run lint` green. Smoke sanity-landed as needed.
- `roadmap.md` **Now** clears `g8-resolve`; next is whatever Ron
  schedules (often G9 pairing). Update `validate-status.md` cursor.
