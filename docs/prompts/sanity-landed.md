# Sanity — landed functionality only

Run after **every** tech-debt slice, and once after A+B+C. Leftovers
(LineIO, Dist empty, EQN types 1/2/4, letter-key steal) are **not**
failures. File new defects in `issues.md` with an associated id.

## Commands

```bash
npm test
npm run lint
```

Expect the current suite to stay green (86 at the 25 Sep baseline; more
is fine).

## Browser (http://localhost:3000)

COMP

- `sin(30)` `=` → 0.5 (Degree).
- `2/3+1/2` `=` → 7/6 (or mixed if SETUP ab/c).
- `log10(100)` `=` → 2 (not Syntax ERROR).
- SHIFT CALC on `2+2` → Variable ERROR.
- SHIFT CALC on `abs(X)+1=0` → Can’t Solve.
- `Y=X+10`, Y=12, SOLVE → x=2 and L−R ≈ 0; Continue? still works.

STAT

- MODE 3 → a type → editor opens; FREQ ON still caps rows.

EQN

- MODE 5 → 3 → a=1, b=0, c=−1 → real roots; a=1, b=0, c=1 → a+bi.

After slice A only: a Syntax ERROR ◀▶ jumps to the bad token.

## Do not

- Treat empty Dist or EQN 1/2/4 fallthrough as a new bug.
- Start the next debt slice in the same chat if this pass fails — fix
  the regression first.
