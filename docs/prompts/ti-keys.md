# Kickoff — `ti-keys` (x^n / x² / caret stems / mode-gated frac)

Copy everything below the line into a **new agent chat**. This is slice 5
of the tech-issues program. Do not start `ti-escape` or Phase 2 leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R9` `R10` `R11` `R25`, `roadmap.md` **Now** §1 `ti-keys`. Update
`docs/tech-issues.md` and `roadmap.md` in the same change. Refresh canvases
if the program story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are fixing **landed faceplate keys** only: x^n / x² after a result,
caret stems for Pol / Rec / `^(`, and frac / nPr / nCr mode gates. Do
not implement CALC/SOLVE/hyp overlays (`ti-escape`) or unshifted CALC
E-19 (`p2-calc` / `calc-ux`).

## Must do

1. **R9** — x^n after `=` starts from Ans (the hardware result path:
   `Ans^(‸)` / SHIFT `root(Ans,‸)`), not by editing the old formula.
   In STAT / EQN (and other non-COMP modes) the key does not write the
   hidden COMP line.
2. **R10** — x² / cube after a result always clears SHIFT. The early
   `showingResult` return must not leave the next key secretly shifted.
   Cube is still SHIFT x² → `Ans³`. Also do not write COMP from STAT/EQN.
3. **R11** — `CURSOR_PATS` includes `pol(`, `rec(`, `^(`. Arrowing must
   jump the whole stem so the LCD does not show raw `pol` / `^`.
4. **R25** — frac / nPr / nCr are mode-gated the same way as R9/R10:
   they write the COMP line only in COMP.
5. Tests cover Ans-from-result power / square (SHIFT off after cube),
   caret jumps over `pol(` `rec(` `^(`, and the COMP-only gate.

## Do not

- Start `ti-escape` or later `ti-*` slices.
- Implement Dist (`p2-dist`), stay-in-STAT, CALC E-19, EQN 1/2/4,
  LineIO, or packaging.
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/modeRouter.ts` — `handlePowerKey`, `handleSquareKey`,
  `handleFracKey`, `handlePermComb`
- `src/modes/comp.ts` — result-path / mode-gate helpers
- `src/keys.ts` — `CURSOR_PATS`
- `src/manual.golden.test.ts`

## Done when

- After `=`, x^n is `Ans^(‸)` (SHIFT: `root(Ans,‸)`), not the old
  formula with `^(` tacked on.
- After `=`, SHIFT x² is `Ans³` and SHIFT is off.
- `▶` from `‸pol(3,4)` / `5‸^(2)` lands after the stem, not inside it.
- STAT/EQN x^n / x² / frac / nPr / nCr do not change `currentInput`.
- `docs/tech-issues.md` R9/R10/R11/R25 and `roadmap.md` `ti-keys`
  checked only if the whole slice is in.
