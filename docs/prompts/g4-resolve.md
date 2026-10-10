# Kickoff — `g4-resolve` (G4 form fails R49–R54)

Historical kickoff — **landed** 10 Oct 2026 (`R49`–`R54` closed;
re-check pass). Keep for regressions. Do not re-open as **Now**.

Copy everything below the line only if re-running the slice.

---

Resolution only — not pairing. G4 pairing sitting was
([G4 pair](db788c9e-e8de-401f-8e63-7b766be15180)).

Do not start Phase 3, G5 pairing, or G15 unless Ron asks.

---

Follow `docs/principles.md` (**Naming**, visual fidelity). Sources:
[`docs/tech-issues.md`](../tech-issues.md) open `R49`–`R54`,
`roadmap.md` **Now** `g4-resolve`,
[`validate-status.md`](validate-status.md) G4 table.
Update tech-issues / roadmap **Now** in the same change.
Smoke [`sanity-landed.md`](sanity-landed.md).

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
parked.

## Must do

1. **`R49`** — Empty `log` / `ln` (same family): unit shows **no**
   placeholder box; Shevon must not paint one. DEL empty already
   clears — keep that.
2. **`R50`** — Letter `e` (ALPHA constant and `e` in `e^`) reads
   distinct from function text (unit: bolder / italic feel).
3. **`R51`** — `log□` (log base): paint **closed** parentheses the
   way the unit does.
4. **`R52`** — `10^` template: condensed `10` (~one digit wide), not
   two full digit widths.
5. **`R53` (global)** — Parentheses **grow taller** to fit nested
   tall content (stacked fractions, etc.). Not limited to `log`:
   any `(…)` that wraps a nested frac / similar height must stretch
   like the unit. Fix the shared paren paint path so G15 / sin /
   Abs / ∫ nests inherit the same behavior.
6. **`R54` (fractional exponents)** — With a stacked-frac exponent,
   drop the **base** slightly so the frac reads clearly as the
   exponent (unit: `10` sits a bit lower; Shevon lets the frac fall
   near the baseline of `10`). Apply the same layout rule to other
   power templates that take a frac exponent (`e^`, `xⁿ`, …) — not
   a one-off `10^` tweak. Logged G4.7 pairing 10 Oct 2026.
7. Goldens / focused tests. Do not `Read` large PNGs.

## Do not

- Start G5 / G15 pairing or Phase 3.
- Change EVAL for G4 values that already matched.
- Hand-rewrite to “revert”; use git if Ron asks to revert
  (`.cursor/rules/git-revert.mdc`).
- Name the hardware vendor or original model. Touch `manual.pdf`.

## Done when

- `R49`–`R54` (and any extra G4 `R*` from the finished sitting)
  closed in `docs/tech-issues.md`.
- Tall-paren and frac-exponent layout are shared paint rules.
- `npm test` / `npm run lint` green. `sin(30)` still 0.5.
- `roadmap.md` **Now** clears `g4-resolve`.
