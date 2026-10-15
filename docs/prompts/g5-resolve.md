# Kickoff — `g5-resolve` (R55–R59)

Historical kickoff — **landed** 15 Oct 2026 (`R55`–`R59` closed).
Keep for regressions. Do not re-open as **Now**.

Copy everything below the line only if re-running the slice.

---

Resolution only — not pairing. G5 pairing sitting was done
15 Oct 2026 (see [`validate-status.md`](validate-status.md) G5).

Do not start Phase 3, G6 pairing, or G15 unless Ron asks.

---

Follow `docs/principles.md` (**Naming**, visual fidelity). Sources:
[`docs/tech-issues.md`](../tech-issues.md) `R55`–`R59`,
`roadmap.md` **Now** (was `g5-resolve`),
[`validate-status.md`](validate-status.md) G5 table.
Update tech-issues / roadmap **Now** / validate-status in the same
change. Smoke [`sanity-landed.md`](sanity-landed.md).

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
parked.

## Must do

Interim (logged outside G5 — do not drop):

1. **`R55`** — Show-keys overlay: SHIFT legend barely legible
   (faded yellow + small). Shifted faces such as `10ˣ` (SHIFT π
   etc.) are tiny. Raise contrast/size so SHIFT chrome and shifted
   legends stay readable at the current overlay scale.
2. **`R56`** — Implicit × with π / `e` across ÷: unit treats
   `10π÷2π` as `(10×π)÷(2×π)` (→ 5); Shevon does left-associative
   `10×π÷2×π` (→ 5π²). Same for `e` (`10e÷2e`). Match the unit’s
   juxtaposition binding across ÷. Goldens for both.
3. **`R58`** — PC Alt (ALPHA hold) sticks after Alt-Tab away from
   Shevon (lost `keyup` on blur). Clear ALPHA on `blur` /
   `visibilitychange` (and SHIFT the same way if it can stick).
   On-tab, hold-only behavior stays.

G5 pairing finds:

4. **`R57`** — Empty open templates must not paint a placeholder
   box when the unit shows none: trig `sin(` `cos(` `tan(` /
   inverses and hyp `sinh(` `cosh(` `tanh(` / inverses. Shared
   paint rule — do not refile per-key. Same family as `R49`
   (empty `log`/`ln`).
5. **`R59`** — Abs bars `| |` grow taller for stacked / tall
   content inside (e.g. fraction), like stretchy parens (`R53`).
   Fractions must not clip / break Abs boundaries.

Also: goldens / focused tests. Do not `Read` large PNGs.

## Do not

- Start G6 / G15 pairing or Phase 3.
- Change EVAL for G5 values that already matched (trig degrees,
  Abs of −7 → 7, etc.).
- Hand-rewrite to “revert”; use git if Ron asks to revert
  (`.cursor/rules/git-revert.mdc`).
- Name the hardware vendor or original model. Touch `manual.pdf`.

## Done when

- `R55`–`R59` closed in `docs/tech-issues.md`.
- `npm test` / `npm run lint` green. Smoke `sanity-landed` paths
  that touch COMP / Abs / show-keys / modifiers as needed.
- `roadmap.md` **Now** clears `g5-resolve`; next is **G6** pairing
  (or whatever Ron schedules). Update `validate-status.md` cursor.
