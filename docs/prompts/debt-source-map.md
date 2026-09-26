# Kickoff — `debt-source-map` (slice A)

Copy everything below the line into a **new agent chat**. Do not start
`debt-shell`, `debt-value`, remaining Phase 2, or packaging in that chat.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Now `debt-source-map`,
`issues.md` `err-jump`. Update those files in the same change. Refresh
canvases if the Now story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are implementing **slice A only**: source-map the IR rewrite so
`CalcError.offset` is real and E-40 left/right jumps to the fault token.

## Must do

1. Keep the caret string as the LCD source of truth. Do not change how
   keys insert `sin(`, `sqrt(`, etc.
2. When `evaluateExpression` rewrites stems (`sin(` → `__sin(`), record
   each stem’s start index in the **original** string. Put that span on
   the AST node and on thrown `CalcError.offset`.
3. LCD: on Syntax ERROR / Math ERROR, left/right moves the caret to
   `offset` (E-40). AC still clears the error (and on the hardware, AC clears the
   expression — match E-40 if that is what the figure shows; do not
   invent extra recovery).
4. Move implicit multiply into the parser (token-level). Delete the
   post-rewrite regex that once turned `__log10(100)` into
   `__log10*(100)`. `log10(100)` must stay 2.
5. Type the helper bag (`h: any` goes away).

## Do not

- Replace the AST walker or parse templates natively.
- Add Stack / Argument / Time Out / Dimension screens.
- Start `debt-shell` or `debt-value`.
- Touch STAT Dist, EQN 1/2/4, LineIO.

## Files

- `src/evaluator.ts` — rewrite + offset + typed helpers
- `src/parser.ts` — implicit multiply
- `src/types.ts` — `CalcError.offset` already exists; use it
- `src/Calculator.tsx` — left/right on an error jumps the caret
- `src/manual.golden.test.ts` — offset + jump + `log10(100)`

## Done when

- A Syntax ERROR left/right lands on the fault token (browser + test).
- Existing tests still pass; new tests cover offset, jump, and `log10(100)`.
- `issues.md` `err-jump` updated for what landed (check only if jump works).
- `roadmap.md` `debt-source-map` checked only if the whole slice is in.
