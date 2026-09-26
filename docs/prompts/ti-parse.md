# Kickoff — `ti-parse` (XY implicit multiply, SOLVE stem letters)

Copy everything below the line into a **new agent chat**. This is slice 4
of the tech-issues program. Do not start `ti-keys` or Phase 2 leftovers
in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R2` `R8`, `roadmap.md` **Now** §1 `ti-parse`. Update
`docs/tech-issues.md` and `roadmap.md` in the same change. Refresh canvases
if the program story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are fixing **landed parse / SOLVE letter collection** only: adjacent
memory letters multiply, and SOLVE must not prompt letters that live
inside `Ans` / `nCr` / function stems. Do not implement unshifted CALC
E-19 (`p2-calc` / `calc-ux`).

## Must do

1. **R2** — Adjacent memory letters multiply. `XY` is X×Y, `AB` is A×B.
   Do not tokenize them as one identifier (`XY` / `AB` → Syntax ERROR).
   Single-letter memory is A–F, M, X, Y. Keep `Ans`, `pi`, `__sin` /
   `stat_*` as whole identifiers. Implicit multiply for `2X` / `AnsX`
   stays.
2. **R8** — `collectSolvePromptVars` does not treat letters inside
   `Ans` / `nCr` / function stems as memory. `Ans+X` does not prompt A.
   `nCr(X,2)` does not prompt C. Real letters still prompt (`Y=X+10` →
   Y; `A+X` → A). Landed SOLVE (`p2-solve`) only — CALC letter scan
   stays `p2-calc`.
3. Tests cover `XY` / `AB` evaluate as products, `Ans` still a name,
   and SOLVE collection for `Ans+X`, `nCr(X,2)`, and `Y=X+10`.

## Do not

- Start `ti-keys` or later `ti-*` slices.
- Implement Dist (`p2-dist`), stay-in-STAT, CALC E-19, EQN 1/2/4,
  LineIO, or packaging.
- Re-open engine debt A–C or change Pol/Rec pair display.
- Disable lying MODE/EQN rows.

## Files

- `src/parser.ts` — ident token (memory letters vs reserved names)
- `src/modes/comp.ts` — `collectSolvePromptVars`
- `src/manual.golden.test.ts` (and parser tests)

## Done when

- `XY` with X=3, Y=4 is 12; `AB` with A=2, B=5 is 10.
- `Ans` still evaluates as Ans; `__log10(100)` stays a call.
- `collectSolvePromptVars('Ans+X')` and `nCr(X,2)` are `[]`;
  `Y=X+10` is still `['Y']`.
- `docs/tech-issues.md` R2/R8 and `roadmap.md` `ti-parse` checked only
  if the whole slice is in.
