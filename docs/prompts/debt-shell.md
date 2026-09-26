# Kickoff — `debt-shell` (slice B)

Copy everything below the line into a **new agent chat**. Only after
`debt-source-map` has landed. Do not start `debt-value` or Phase 2
features in that chat.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Now `debt-shell`.
Update `roadmap.md` in the same change. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are **splitting** `src/Calculator.tsx` along seams that already exist.
hardware behavior must not change.

## Must do

1. Extract LCD + status annunciators (including `lcdError`, SOLVE screens,
   carets, ◀▶ / ▲▼ lighting).
2. Extract PC keyboard + overlay SHIFT/ALPHA flash.
3. Extract a mode router so COMP / STAT / EQN / SETUP / CLR handlers are
   not one 1800-line component. One state store or reducer — modes must
   not fork `vars` / `ans` / history.
4. STAT recall (`insertStatVar`) must live in a place `p2-stat-mode` can
   later edit without rewriting the shell. **Do not** implement stay-in-STAT
   unless it falls out of the move with no behavior change (today it still
   jumps to COMP — leave that unless you are sure).

## Do not

- Change key sequences, SOLVE, or display glyphs.
- Start `p2-stat-mode`, `p2-edit`, `p2-dist`, or EQN 1/2/4.
- Start `debt-value`.
- A “disable lying menus” pass.

## Files

- `src/Calculator.tsx` — shrink to compose the extracts
- New modules under `src/` (e.g. `lcd.tsx`, `keyboard.ts`, `shell` /
  `useCalculatorState`) — keep names boring and local
- Tests must still import the same public helpers

## Done when

- `npm test` and `npm run lint` pass with no user-visible COMP/STAT/EQN
  change.
- Browser smoke in [`sanity-landed.md`](sanity-landed.md) passes.
- `roadmap.md` `debt-shell` checked.
