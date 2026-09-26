# Sanity — landed functionality only

Run after debt A–C, and after **every** remaining Phase 2 slice. Leftovers
(LineIO, Dist empty, EQN types 1/2/4, letter-key steal) are **not**
failures. File new defects in `issues.md` with an associated id.

## Commands

```bash
npm test
npm run lint
```

Expect the current suite to stay green (101 after debt-value; more is
fine).

## Browser (http://localhost:3000)

COMP

- `sin(30)` `=` → 0.5 (Degree).
- `2/3+1/2` `=` → 7/6 (or mixed if SETUP ab/c).
- `log10(100)` `=` → 2 (not Syntax ERROR).
- A Syntax ERROR ◀▶ jumps to the bad token (E-40).
- SHIFT CALC on `2+2` → Variable ERROR.
- SHIFT CALC on `abs(X)+1=0` → Can’t Solve.
- `Y=X+10`, Y=12, SOLVE → x=2 and L−R ≈ 0; Continue? still works.
- Pol/Rec at top level paints `r=…, θ=…` or bottom-right `x=…, y=…`.

STAT

- MODE 3 → a type → editor opens; FREQ ON still caps rows.

EQN

- MODE 5 → 3 → a=1, b=0, c=−1 → real roots; a=1, b=0, c=1 → a+bi.

## Do not

- Treat empty Dist, EQN 1/2/4 fallthrough, or unshifted CALC ≠ E-19
  as a new bug (those wait on their Phase 2 slices).
- Start the next leftover slice in the same chat if this pass fails —
  fix the regression first.
