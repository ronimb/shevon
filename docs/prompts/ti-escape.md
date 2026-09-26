# Kickoff — `ti-escape` (CALC/SOLVE/hyp overlays, AC leak, History Load)

Copy everything below the line into a **new agent chat**. This is slice 6
of the tech-issues program. Do not start `ti-edges` or Phase 2 leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R12` `R13` `R26`, `roadmap.md` **Now** §1 `ti-escape`. Update
`docs/tech-issues.md` and `roadmap.md` in the same change. Refresh canvases
if the program story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are fixing **mode escape / overlay leaks** only: CALC / SOLVE / hyp
must not paint over STAT or EQN, AC must clear leftover overlays, and
History Load must enter COMP. Do not implement unshifted CALC E-19
(`p2-calc` / `calc-ux`).

## Must do

1. **R12** — CALC / SOLVE / hyp do not overlay STAT or EQN. They run in
   COMP, or on a real STAT calc line (`insertStatVar` already jumps to
   COMP). The LCD must not paint `promptVar` / hyp / “solve for x”
   ahead of the STAT grid or EQN editor. CALC *behavior* vs E-19 stays
   `p2-calc`.
2. **R13** — AC from STAT / EQN clears `showHypMenu`, `promptVar`,
   `solveScreen`, and `lcdError`. AC from STAT enters COMP and clears
   `statType` so the STAT indicator is not still lit. EQN AC may stay
   in the quadratic editor; it still clears those overlays.
3. **R26** — History Load enters COMP, writes the loaded line, and
   clears the same overlays so the expression is visible.
4. Tests cover the COMP-only overlay gate, AC-from-STAT / AC-from-EQN
   overlay (and STAT-indicator) clear, and History Load → COMP.

## Do not

- Start `ti-edges` or later `ti-*` slices.
- Implement Dist (`p2-dist`), stay-in-STAT, CALC E-19, EQN 1/2/4,
  LineIO, or packaging.
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/modes/comp.ts` — overlay gate + AC / Load patches
- `src/modeRouter.ts` — `handleCalc`, hyp, `clearAll`
- `src/lcd.tsx` — do not paint COMP overlays over STAT / EQN
- `src/Calculator.tsx` — History Load
- `src/manual.golden.test.ts`

## Done when

- CALC / SOLVE / hyp in STAT_DATA / EQN_QUAD do not set a prompt, hyp
  menu, or solve screen.
- AC from STAT is COMP with STAT off and overlays cleared.
- AC from EQN clears overlays (hyp / prompt / solve / lcdError).
- History Load is COMP with the loaded line visible.
- `docs/tech-issues.md` R12/R13/R26 and `roadmap.md` `ti-escape`
  checked only if the whole slice is in.
