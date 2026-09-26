# Kickoff prompt — typed errors + honest SOLVE (`p2-solve`)

Copy everything below the line into a **new agent chat**. Do not start
`vis-errors` jump-to-token, an evaluator IR rewrite, CALC UX, or the rest of
Phase 2 in that chat.

---

Follow `docs/principles.md`. Markdown is the source of truth: `roadmap.md`
Phase 2 `p2-solve`, `issues.md` `solve-errors`, `docs/coverage.md` CALC/SOLVE.
Update those files in the same change as the code. Refresh canvases if the
Phase 2 story changed.

Behavior spec: `manual.pdf` **E-20, E-21, E-41**. Element +
behavior parity vs those figures — not pixel-perfect.

You are implementing **priority-1 technical gap: two-bucket errors**, as the
opening of `p2-solve`. The LCD today only knows Syntax ERROR and Math ERROR.
SOLVE with no X, or a Newton miss, is shown as Syntax ERROR.

## Do this first: `CalcError` (required foundation)

Add a small shared type (prefer `src/types.ts`):

```ts
type CalcErrorKind = 'syntax' | 'math' | 'variable' | 'cantSolve';

// kind + optional offset. offset stays unused in this slice.
```

Rules:

- Throw or return `CalcError`. Stop using the string `"MathError"` and a
  bare `catch` that always calls `setSyntaxError(true)`.
- LCD state is one `lcdError: CalcErrorKind | null` (or equivalent), not two
  booleans. Paint the hardware label:
  - `syntax` → `Syntax ERROR`
  - `math` → `Math ERROR`
  - `variable` → `Variable ERROR`
  - `cantSolve` → `Can't Solve`
- Keep existing Syntax / Math recovery (◀▶ / AC dismiss). New kinds dismiss
  the same way. **Do not** jump the caret to a fault token.
- Leave `offset` optional and unset. Do not build a source map.
- Do **not** add Stack / Argument / Time Out / Dimension screens. Those wait
  for a mode that needs them.

Wire `evaluateExpression` failures through `CalcError` (`math` for
NaN/Infinity/±1e100, `syntax` for parse/undefined). That is routing only.
Do **not** rewrite `processTemplatesForJS`, implicit-multiply regex, or the
parser.

## Then: honest SOLVE (`solve-errors`)

Today (`Calculator.tsx` `handleCalc` when SHIFT, `newtonSolveX` in
`src/modes/comp.ts`):

- No `X` in the expression → `setSyntaxError(true)`.
- Newton always returns a number after 40 steps, even when |f| is still large.
- Any `catch` → Syntax ERROR.
- No initial-X prompt, no L−R residual, no Continue screen.

Match E-20 / E-21 / E-41:

1. **Variable ERROR** — SOLVE when the equation does not contain X (the
   variable being solved). Not Syntax ERROR.
2. **Can't Solve** — Newton does not converge (after the same 40-step budget,
   |f| still large, or a step blows up). `newtonSolveX` must **report
   failure**, not return the last guess as if it worked.
3. **Initial X** — after other variables (if any) are prompted, prompt for
   the starting X. Show the current X as the previous value, same role as
   today’s CALC `A?` prompt (bottom-left / previous-above-entry).
4. **Result then L−R** — on success, show `X=` (or the hardware’s result
   line) and the L−R residual (left minus right; a single equation is
   treated as `expr = 0` so L−R is the residual).
5. **Continue** — the hardware’s Continue step so the user can retry with a
   different initial X. Read the E-20/E-21 figure; do not invent a flow.

Prompt remaining non-X letters the way CALC already does (`promptVar` /
`promptVarsQueue`), then the initial-X prompt. Unshifted CALC is
**out of scope** (`comp-calc`).

## Out of scope (do not start)

- `vis-errors` / `err-jump` — ◀▶ jump-to-token (needs a source map; that is
  priority 2)
- Evaluator IR rewrite, implicit-multiply parser move, typing `h: any`
- `CalcValue` / dual-line Pol/Rec / surd-π (`vis-result`, `p4-exact`)
- Splitting `Calculator.tsx` except the minimum SOLVE/error state you touch
- `comp-calc` (CALC equalities / Linear-during-prompt)
- `p2-edit`, `p2-dist`, `p2-stat-mode`, `p2-eqn-linear`, `p2-eqn-cubic`
- Phase 3 modes, lying-menu disable pass
- Stack / Argument / Time Out ERROR screens
- LineIO, 99-byte cap, `:` / Disp

## Files you will likely touch

- `src/types.ts` — `CalcError` / `CalcErrorKind`
- `src/evaluator.ts` — throw `CalcError` instead of `"MathError"` / generic
- `src/modes/comp.ts` — `newtonSolveX` success vs failure
- `src/Calculator.tsx` — SOLVE path, LCD error paint, initial-X / L−R /
  Continue
- `src/manual.golden.test.ts` — new cases below

## Done when

- `X+1` then SHIFT CALC (no X in a different equation such as `2+2`, or an
  expression with only A/B/…) shows **Variable ERROR**, not Syntax ERROR.
- A non-converging SOLVE (e.g. `abs(X)+1=0` or `1=2` with an X forced in)
  shows **Can't Solve**, not a fake root and not Syntax ERROR.
- A converging SOLVE still finds X; then L−R and Continue match E-20/E-21.
- Existing 80 tests still pass; add golden coverage for Variable ERROR,
  Can't Solve, and L−R on a known sample.
- `roadmap.md` `p2-solve` and `issues.md` `solve-errors` updated for what
  actually landed (check the box only if the full E-20 procedure is there).
- Browser: exercise Variable ERROR, Can't Solve, and one successful SOLVE
  through L−R / Continue.

Follow `docs/principles.md`: never fake a result; never dump literal function
text; element + behavior parity vs the manual figure.
