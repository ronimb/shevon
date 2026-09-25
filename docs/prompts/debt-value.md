# Kickoff — `debt-value` (slice C)

Copy everything below the line into a **new agent chat**. Only after
`debt-shell` has landed. Do not start Phase 2 leftovers, CMPLX, or
`p4-exact` in that chat.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Now `debt-value`,
`issues.md` `pol-rec-line` if you paint dual-line. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are changing the **result type**, not adding modes. COMP must look the
same for everyday decimals, fractions, sci, ENG, and DMS.

## Must do

1. Add `CalcValue`: `real` | `complex` | `pair` in `src/types.ts`.
   IEEE `number` stays the payload for `real`.
2. `evaluateExpression` returns `CalcValue` (or a thin wrapper). Route
   Math ERROR the same way (`CalcError`).
3. Formatters (`formatResultNumber`, S⇔D, ENG, DMS) consume `real` as
   today. No invented fractions.
4. EQN quadratic a+bi uses `complex` (delete the `imag?` side field if
   you can do it without a visual change).
5. Pol/Rec **may** return `pair` and paint dual-line r,θ / X,Y
   (`pol-rec-line`) if that is cheap. If not, keep today’s scalar + X,Y
   write and leave the issue open.

## Do not

- Implement CMPLX mode, ∠ entry, arg/Conjg menus.
- Surd / p/q·π exact forms (`p4-exact`).
- BASE-N integer values or matrices.
- Start remaining Phase 2.

## Files

- `src/types.ts`, `src/evaluator.ts`, `src/display.tsx`, `src/format.ts`
- `src/modes/eqn.tsx`, `src/Calculator.tsx` (result paint)
- Golden tests: existing COMP/EQN/SOLVE must still pass

## Done when

- Tests + [`sanity-landed.md`](sanity-landed.md) pass with no COMP
  regression.
- `roadmap.md` `debt-value` checked.
- `pol-rec-line` updated only if dual-line actually shipped.
