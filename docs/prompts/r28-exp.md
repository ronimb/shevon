# Kickoff — `R28` (×10ˣ condensed ×10; caret keeps the exponent)

Copy everything below the line into a **new agent chat**. One slice.
Do not start `R29` or `p2-calc` in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R28`, `roadmap.md` **Now** row 1, `docs/visual-fidelity-inventory.md`
`R28`, `roadmap.md` `vis-no-literal`. Manual: ×10ˣ entry (same class as
R11 caret stems). Update `docs/tech-issues.md` and `roadmap.md` **Now**
in the same change. Refresh canvases if the story changed. Afterward
run [`sanity-landed.md`](sanity-landed.md).

You are fixing **landed ×10ˣ entry paint and caret** only. Distinct
from R21 (tiny Norm *result*) and from SHIFT log `10^(‸)` (already
paints `10` + superscript). SHIFT ×10ˣ is π; ALPHA ×10ˣ is e — leave
those.

Today `handleExpKey` inserts `×10^`. `paintTemplates` only matches
`stem(` so the LCD shows literal `10^`. `CURSOR_PATS` has no `×10^`,
so the caret can sit inside the stem and exponent digits escape onto
the baseline.

## Must do

1. Faceplate ×10ˣ paints condensed **`×10`** (same role as
   `SciNotation`’s `×10` span), not the letters `10^`.
2. Digits typed after the key stay in the **exponent** (superscript).
   They must not drop to the baseline.
3. Caret jumps the whole `×10^` stem the same way R11 jumps `pol(`
   `rec(` `^(` / `10^(`. ▶ from before the stem lands in the exponent
   slot; ◀ from the exponent does not leave `10` or `^` on screen.
4. `2 ×10ˣ 3` `=` is still 2000. Do not change the `×10^` → `*10**`
   eval path except as needed to keep the exponent boxed.
5. Tests cover the condensed paint, caret jump, and `2×10^3` = 2000.

## Do not

- Start `R29` (∫ limits / caret path).
- Start `p2-calc`, Dist, stay-in-STAT, EQN 1/2/4, LineIO, or packaging.
- Change SHIFT log `10^` / SHIFT ln `e^`, Norm/ENG *results*, or R21.
- Disable lying MODE/EQN rows.
- Re-open engine debt A–C.

## Files

- `src/display.tsx` — paint `×10^` as condensed ×10 + superscript
- `src/keys.ts` — `CURSOR_PATS` (and `PATS` if the stem changes)
- `src/modeRouter.ts` — `handleExpKey` insert form
- `src/modes/comp.ts` — caret / `reconstructSequence` if the IR changes
- `src/manual.golden.test.ts`

## Done when

- Browser: ×10ˣ shows condensed `×10`; typing `3` keeps `3` in the
  exponent; ◀▶ never paints raw `10^`.
- `2 ×10ˣ 3` `=` → 2000.
- Tests/lint green. `docs/tech-issues.md` `R28` and `roadmap.md` **Now**
  move to `R29` only if this slice is fully in. `vis-no-literal` hole
  for ×10ˣ cleared.
