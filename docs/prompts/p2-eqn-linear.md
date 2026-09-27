# Kickoff — `p2-eqn-linear` (EQN 2-unk / 3-unk)

Copy everything below the line into a **new agent chat**. One slice.
`p2-stat-mode` is in. Do not start cubic, LineIO, or packaging.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Phase 2
`p2-eqn-linear`, `issues.md` `eqn-menu-fallthrough`, `docs/coverage.md`
EQN, `roadmap.md` `vis-menus`, manual **E-28** types 1 and 2.
Update those files in the same change. Refresh canvases if the Phase 2
story changed. Afterward run [`sanity-landed.md`](sanity-landed.md).

You are implementing **EQN menu 1 and 2** (linear systems). Type 3
(quadratic) already runs: a/b/c labels, cell caret, bottom-left entry,
real and a+bi roots. Types 1 / 2 / 4 currently no-op (`EQN_MENU` only
accepts `3`). Type 4 stays that way until `p2-eqn-cubic`.

## Must do

1. Read E-28 types 1 and 2 (and the figures). Element + behavior
   parity — not pixel-perfect. Use the numbered samples as tests.
2. MODE 5 → **1** opens 2-unknown (`anX+bnY=cn`). MODE 5 → **2**
   opens 3-unknown (`anX+bnY+cnZ=dn`). Labels and active entry sit
   in the hardware’s position/role (bottom-left number like
   quadratic). Do not invent a COMP-style line.
3. `=` solves; ▲/▼ walk X, Y (and Z). Results match the unit to
   displayed precision. Never fake a unique solution.
4. A singular / no-unique system is **Math ERROR**, same class as
   quadratic `a=0` (`R19`). Not a silent COMP fallthrough.
5. Type **4** still does not run. Leave that lie until
   `p2-eqn-cubic`. Do not disable the menu row.

## Do not

- Start `p2-eqn-cubic`, LineIO, or packaging.
- Re-open quadratic a+bi or STAT recall.
- Disable lying MODE rows (CMPLX / BASE-N / …).
- Re-open engine debt A–C.

## Files

- `src/modes/eqn.tsx` — 2-unk / 3-unk editor + solver
- `src/modeRouter.ts` — `EQN_MENU` 1 / 2 (today only `3`)
- `src/types.ts` — modes if 2-unk / 3-unk need their own
- `src/lcd.tsx` — screens / bottom-left entry
- `src/manual.golden.test.ts` — E-28 type 1 and 2 samples

## Done when

- Browser: MODE 5 → 1 and → 2 open coefficient editors; the E-28
  samples produce X, Y (and Z) via ▲/▼; a singular system is Math
  ERROR. Type 4 still does nothing.
- Quadratic MODE 5 → 3 is unchanged.
- Tests/lint green. `roadmap.md` `p2-eqn-linear` checked only if
  both linear types are in. `eqn-menu-fallthrough` stays open (type
  4). Coverage 2-unk / 3-unk Missing → Done.
