# Kickoff — `p2-stat-mode` (stay in STAT on recall)

Copy everything below the line into a **new agent chat**. One slice.
`p2-dist` is in. Do not start EQN 1/2/4, LineIO, or packaging.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Phase 2
`p2-stat-mode`, `issues.md` `stat-jump-comp`, `docs/coverage.md` STAT
Sum / Dist, manual STAT recall (E-23–25). Update those files in the
same change. Refresh canvases if the Phase 2 story changed. Afterward
run [`sanity-landed.md`](sanity-landed.md).

You are stopping STAT recall from silently jumping to COMP. The unit
stays in STAT (STAT indicator on) when you pick n / x̄ / P( / `'t` /
Reg letters. Today `insertStatVar` always returns `calcMode: 'COMP'`.

## Must do

1. Recalling from SHIFT 1 submenus (Sum, Var, MinMax, Reg, Dist)
   **stays in STAT**. STAT stays lit. Do not drop to COMP.
2. The recalled symbol lands on the STAT calc line and `=` still
   uses the current STAT data (same values as today’s COMP jump).
   Never fake a result.
3. Dist P( Q( R( `'t` stay 1-VAR-only (already landed). They must
   also stay in STAT.
4. CALC / SOLVE / hyp still do **not** overlay STAT (`R12` /
   `ti-escape`). AC from STAT still turns STAT off (`R13`).
5. Tests cover stay-in-STAT on at least one Var recall and one Dist
   recall, plus a COMP-mode regression that STAT AC still clears STAT.

## Do not

- Start `p2-eqn-linear`, `p2-eqn-cubic`, LineIO, or packaging.
- Re-open Dist formulas or CALC E-19.
- Disable lying MODE/EQN rows.
- Re-open engine debt A–C.

## Files

- `src/modes/stat.tsx` — `insertStatVar` (stop forcing COMP)
- `src/modeRouter.ts` — STAT_RESULT_SUB insert path
- `src/lcd.tsx` — STAT indicator if it only lights on certain modes
- `src/manual.golden.test.ts`

## Done when

- Browser: 1-VAR data in, SHIFT 1 → Var → n (or Dist → `'t`) inserts
  and STAT stays on; `=` matches the unit. MODE still shows STAT
  until you leave it.
- CALC from that screen does not open a COMP prompt overlay.
- Tests/lint green. `issues.md` `stat-jump-comp` and `roadmap.md`
  `p2-stat-mode` checked only if the whole slice is in. Coverage
  Dist / Sum gap “jumps to COMP” cleared.
