# Kickoff — `p2-eqn-cubic` (EQN cubic)

Copy everything below the line into a **new agent chat**. One slice.
`p2-eqn-linear` is in. Do not start packaging, LineIO, or Phase 3.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Phase 2
`p2-eqn-cubic`, `issues.md` `eqn-menu-fallthrough`, `docs/coverage.md`
EQN cubic, `roadmap.md` `vis-menus`, manual **E-28** type 4.
Update those files in the same change. Refresh canvases if the Phase 2
story changed. Afterward run [`sanity-landed.md`](sanity-landed.md).

You are implementing **EQN menu 4** (cubic). Types 1–3 already run
(Coefficient Editors + quadratic a+bi). `eqnMenuSelect` returns null
for `4`. `EqnKind` is `'2unk' | '3unk' | 'quad'` — cubic waits here.

## Must do

1. Read E-28 type 4 (and the figure). Element + behavior parity —
   not pixel-perfect. Use the numbered samples as tests.
2. MODE 5 → **4** opens `aX³+bX²+cX+d=0`. Labels **a / b / c / d**,
   cell caret, bottom-left entry — same role as quadratic. Do not
   invent a COMP-style line.
3. `=` solves; ▲/▼ walk the roots (up to three). Real and complex
   a+bi match the unit to displayed precision. Never fake a root.
   Exact surd form is `p4-exact`, not this slice.
4. `a=0` is **Math ERROR**, same class as quadratic (`R19`).
5. Close `eqn-menu-fallthrough` only if type 4 actually runs.

## Do not

- Start `p4-packaging`, LineIO, or Phase 3 (`p3-*`).
- Re-open linear 1/2 or quadratic a+bi except to share editor helpers.
- Disable lying MODE rows (CMPLX / BASE-N / …).
- Re-open engine debt A–C.

## Files

- `src/modes/eqn.tsx` — `eqnMenuSelect`, `EqnKind`, cubic editor +
  `solveEqn`
- `src/types.ts` — `EqnKind` / `EQN_*` mode if needed
- `src/modeRouter.ts` — menu 4 path (shared `eqnMenuSelect`)
- `src/lcd.tsx` — cubic screen / bottom-left entry
- `src/manual.golden.test.ts` — E-28 type 4 samples

## Done when

- Browser: MODE 5 → 4 opens a/b/c/d; the E-28 cubic sample(s)
  produce the hardware roots via ▲/▼; `a=0` is Math ERROR.
  Types 1–3 are unchanged.
- Tests/lint green. `issues.md` `eqn-menu-fallthrough` and
  `roadmap.md` `p2-eqn-cubic` checked only if cubic is in.
  Coverage Cubic Missing → Done. **Now** moves to `p4-packaging`
  only if this slice is fully in.
