# Kickoff — `g1-resolve` (G1 form/chrome + small display)

`R36` was later dropped (unresolved, not prioritized). Do not reopen it.

Copy everything below the line into a **new agent chat**. One slice.
This is the **issue-resolution** chat after G1 pairing — not a
validation sitting. Do not start Phase 3, LineIO, or `p4-exact`.

---

Follow `docs/principles.md` (especially **Naming** and visual
fidelity). Sources: [`docs/tech-issues.md`](../tech-issues.md) open
`R31` `R32` `R34` `R35` `R36` `R37`, [`issues.md`](../../issues.md)
`prompt-prev-size`, `roadmap.md` **Now** `g1-resolve`,
[`docs/visual-fidelity-inventory.md`](../visual-fidelity-inventory.md).
Update tech-issues / issues / roadmap **Now** in the same change.
Refresh canvases if the story changed. Afterward run
[`sanity-landed.md`](sanity-landed.md).

You are closing **G1 pairing fails** plus one parked small display
leftover. Match the **unit** (form + chrome), not a generic sci-calc
look. Values that already match stay matched.

`R30` and `R33` are closed — do not re-open. `show-keys-size` is a
**separate** Now id — do not absorb it here.

## Must do

Cluster related caret / idle chrome first, then glyphs, then history.

1. **`R32` / `R35` (caret after `=` / Ans continue)** — After `=`
   the expression may stay, but the unit **hides** the caret.
   Same after `5` `=` then `+` (Ans continuation). Shevon must hide
   it until the user edits again. Prefer one shared rule.
2. **`R34` (AC idle chrome)** — After AC, the unit clears the line
   and shows **no** result. Shevon must not paint idle `0`. Keep
   blank-while-typing from closed `R24`; do not restore “AC → 0”
   as correct.
3. **`R31` (COMP history ▲▼)** — Match the unit walk (three COMP
   lines): first ▲ after latest `=` shows the **previous** line
   (not a no-op reload of the current); further ▲ keeps expression
   + stored result; ▼ restores newer lines **with** the matching
   result (no stale result); caret hidden while traversing history
   (same family as `R32`/`R35`).
4. **`R36` (`×10ˣ` paint)** — Condensed `10`; exponent is a
   **normal-width** superscript (not condensed with the `10`).
   Closed `R28` (condensed `×10`, caret in template, `2×10^(3)` =
   2000) stays. Glyph detail only.
5. **`R37` (π glyph)** — Classic serif-style π (curved top bar /
   flared legs feel), not a straight-edged π. Still a π symbol,
   never the letters “pi”.
6. **`prompt-prev-size`** — SOLVE/CALC previous value (bottom-right)
   uses **normal result size**, not `0.7rem` / 50% fade. Behavior
   (`R7`) unchanged.
7. Goldens / focused tests for caret-after-`=`, AC blank result,
   history ▲ first step + ▼ result sync, ×10ˣ paint, and prompt
   previous-value size. π glyph: assert paint path / class if a
   snapshot is impractical — still verify in the browser vs a unit
   photo Ron already used (do not `Read` large PNGs into chat).

## Do not

- Implement inside a validate-unit chat; this file is resolution only.
- Start Phase 3, `show-keys-size`, `p4-exact`, LineIO, Dist, EQN
  leftovers, or `hist-letters`.
- Change EVAL for arithmetic that already matches (e.g. `2` π `=`
  value, `2×10^(3)` = 2000).
- Re-open `R24` as “AC shows 0”, `R28` as “redo condensed ×10”, or
  `R30` / `R33`.
- Name the hardware vendor or original model.
- Touch `manual.pdf`.
- `Read` overlay / icon / unit PNGs into chat (provider 400 risk).

## Files (likely)

- `src/modes/comp.ts` — caret visibility, history replay index / result
- `src/lcd.tsx` / `src/display.tsx` / `src/index.css` — idle result,
  ×10ˣ, π, prompt previous value
- `src/manual.golden.test.ts`
- `docs/tech-issues.md`, `issues.md` `prompt-prev-size`, `roadmap.md`

## Done when

- Ron (or a quick browser check he accepts) confirms: caret hidden
  after `=` / Ans `+`; AC blank result; history ▲▼ match the G1.12
  notes; ×10ˣ / π look closer to the unit; CALC/SOLVE prev value
  is normal size.
- `npm test` / `npm run lint` green. `sin(30)` still 0.5.
- `R31` `R32` `R34` `R35` `R36` `R37` checked in
  `docs/tech-issues.md`; `prompt-prev-size` closed in `issues.md`.
- `roadmap.md` `g1-resolve` checked; **Now** advances to
  `show-keys-size` (or whatever remains).
