# Kickoff — `ti-store` (STO Ans-as-value, prompt `0`)

Copy everything below the line into a **new agent chat**. This is slice 3
of the tech-issues program. Do not start `ti-parse` or Phase 2 leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R4` `R7`, `roadmap.md` **Now** §1 `ti-store`. Update
`docs/tech-issues.md` and `roadmap.md` in the same change. Refresh canvases
if the program story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are fixing **landed STO / prompt I/O** only: Ans must store as a
value, and typing `0` at a CALC/SOLVE prompt must store 0. Do not
implement unshifted CALC E-19 (`p2-calc` / `calc-ux`).

## Must do

1. **R4** — STO evaluates `Ans` as a numeric env binding (`Ans` in the
   evaluator scope), not `String(ans)` scientific text. A huge Ans
   (`1e+21`) must store `1e21`, not parse `"1e+21"` as `1×e+21` ≈ 24.
   Do not store on eval error (Math / Syntax ERROR). The letter keeps
   its previous value.
2. **R7** — Typing `0` at a CALC/SOLVE prompt stores 0. Do not treat
   `parseFloat("0")` as empty via `||`. An untouched / empty prompt
   still keeps the previous letter value. Shared helper — CALC UX
   (letter scan, previous-value figure, recalc) stays `p2-calc`.
3. Tests cover huge-Ans STO, a failing STO operand that does not write
   the letter, and `commitPromptValue("0", previous) === 0`.

## Do not

- Start `ti-parse` or later `ti-*` slices.
- Implement Dist (`p2-dist`), stay-in-STAT, CALC E-19, EQN 1/2/4,
  LineIO, or packaging.
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/modeRouter.ts` — `handleAlphaVar` STO; `tackleNextPrompt`
- `src/modes/comp.ts` — shared prompt commit helper
- `src/manual.golden.test.ts`

## Done when

- `Ans` STO with Ans = `1e21` stores `1e21`, not ~24.
- A bad STO operand (e.g. `1÷0` → A) is Math ERROR and A is unchanged.
- Prompt typed `0` stores 0; empty prompt keeps the previous value.
- `docs/tech-issues.md` R4/R7 and `roadmap.md` `ti-store` checked only
  if the whole slice is in.
