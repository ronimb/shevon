# Sanity — landed functionality only

Run after debt A–C, and after **every** remaining Phase 2 slice. Leftovers
(LineIO, letter-key steal)
are **not** failures. File new **honesty / leftover** defects in `issues.md` with an
associated id. File new **landed-correctness** defects in
[`docs/tech-issues.md`](../tech-issues.md) (`R*` / `ti-*`), not both.

## Commands

```bash
npm test
npm run lint
```

Expect the current suite to stay green (138 after `ti-edges`; more is
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
- `3A+B` CALC → A? then B? with previous values; A=5 B=10 → 25;
  CALC again re-prompts. `cos(30)` CALC is not a C? prompt.
- Pol/Rec at top level paints `r=…, θ=…` or bottom-right `x=…, y=…`.

STAT

- MODE 3 → a type → editor opens; FREQ ON still caps rows.
- 1-VAR data in, SHIFT 1 → Var → n (or Dist → `'t`) inserts on the
  STAT calc line; STAT stays on; `=` uses the current STAT data.
  Dist still shows P( Q( R( `'t`; E-25 sample `3't` / `P(t)` Fix 3 is
  −0.762 / 0.223. CALC from that screen does not open a COMP prompt.

EQN

- MODE 5 → 3 → a=1, b=0, c=−1 → real roots; a=1, b=0, c=1 → a+bi.
- MODE 5 → 1 → 1, 2, 3 / 2, 3, 4 → X=−1, Y=2. A singular system is
  Math ERROR. MODE 5 → 2 → E-28 sample → X=1, Y=2, Z=3.
- MODE 5 → 4 → a=1, b=−2, c=−1, d=2 → X1=−1, X2=2, X3=1;
  a=0 is Math ERROR.

## Do not

- Treat EQN type 4 no-op as a regression (`p2-eqn-cubic` is in).
  STAT recall jumping to COMP is a regression. Linear 1/2 no-op is a
  regression.
- Start the next leftover slice in the same chat if this pass fails —
  fix the regression first.
