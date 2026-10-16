# Kickoff — `g6-resolve` (R60–R62)

Historical kickoff — **landed** 16 Oct 2026 (`R60`–`R62` closed).
Keep for regressions. Do not re-open as **Now**.

Copy everything below the line only if re-running the slice.

Do not start Phase 3, G7 pairing, or G15 unless Ron asks.

---

Follow `docs/principles.md` (**Naming**, visual fidelity). Sources:
[`docs/tech-issues.md`](../tech-issues.md) open `R60`–`R62`,
`roadmap.md` **Now** `g6-resolve`,
[`validate-status.md`](validate-status.md) G6 table.
Update tech-issues / roadmap **Now** / validate-status in the same
change. Smoke [`sanity-landed.md`](sanity-landed.md).

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
parked. Doc map: [`../README.md`](../README.md).

## Must do

1. **`R60`** — DEL with the caret on infix **P** (nPr) or **C**
   (nCr) must **erase** like the unit, not move the caret behind
   the letter. Same fix for both.
2. **`R61`** — Abs bars that stretch for tall content (frac) must
   keep a **thin** stroke like normal Abs. Stretch (`R59`) stays;
   do not thicken the boundaries when they grow.
3. **`R62`** — Empty RanInt#: unit shows `RanInt#(` only — no
   placeholder boxes, no comma until the user types `,` and an
   integer. Shevon must match. DEL on that open form must not leave
   a stranded comma.

Also: goldens / focused tests. Do not `Read` large PNGs.

## Do not

- Start G7 / G15 pairing or Phase 3.
- Change EVAL for G6 values that already matched (5!, nPr/nCr
  results, Ran# range, etc.).
- Hand-rewrite to “revert”; use git if Ron asks
  (`.cursor/rules/git-revert.mdc`).
- Name the hardware vendor or original model. Touch `manual.pdf`.
- Edit canvases unless Ron asks.

## Done when

- `R60`–`R62` closed in `docs/tech-issues.md`.
- `npm test` / `npm run lint` green. Smoke sanity-landed as needed.
- `roadmap.md` **Now** clears `g6-resolve`; next is **G7** pairing
  (or whatever Ron schedules). Update `validate-status.md` cursor.
