# Kickoff — `R29` (∫ limits on the symbol; caret path)

Copy everything below the line into a **new agent chat**. One slice.
Do not start `p2-calc` in that chat.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R29`, `roadmap.md` **Now** row 1, `docs/visual-fidelity-inventory.md`
`R29`, `roadmap.md` `vis-elements`. Manual E-14 / E-15 ∫ figure.
Update `docs/tech-issues.md` and `roadmap.md` **Now** in the same
change. Refresh canvases if the story changed. Afterward run
[`sanity-landed.md`](sanity-landed.md).

You are fixing **landed ∫ entry paint and caret** only. Evaluation
already matches (Gauss–Kronrod, Time Out on singular — `R22`). SHIFT
∫ is d/dx — leave that template except where shared caret helpers
must not break it.

Today `handleIntegralKey` inserts `int(‸,,,x)`. Limits paint in
`.int-bounds` **beside** ∫ like a fraction. ▶/◀ walk the IR
character-by-character; ▲/▼ jump the next/prev comma in any
template, not only upper/lower from the integrand.

## Must do

1. Limits sit **on the ∫ symbol** (upper above, lower below the
   glyph), not in a stacked box to the left. Integrand + `d` + dummy
   `x` stay to the right of the symbol.
2. Caret starts in the integrand. ▶: integrand → lower → upper →
   after dx → before ∫ (then wraps). ◀ reverses: integrand →
   before ∫ → after dx → upper → lower → integrand. Do not leave
   the caret inside `int` / commas / the dummy `x`.
3. ▲ from the integrand (or lower) goes to upper and stops. ▼ from
   the integrand (or upper) goes to lower and stops. They must not
   walk commas in other templates.
4. `int(sqr(x),0,1)` `=` is still 1/3. Do not change the `__int`
   eval path.
5. Tests cover the on-symbol paint, the ▶ slot order, and ▲/▼
   from the integrand.

## Do not

- Start `p2-calc`, Dist, stay-in-STAT, EQN 1/2/4, LineIO, or packaging.
- Re-open `R22` (Time Out) or change d/dx paint unless a shared
  helper forces it.
- Disable lying MODE/EQN rows.
- Re-open engine debt A–C.

## Files

- `src/display.tsx` — `int` painter
- `src/index.css` — `.int-container` / `.int-bounds` / `.int-symbol`
- `src/modes/comp.ts` — ▶/◀/▲/▼ for `int(`
- `src/modeRouter.ts` — `handleIntegralKey` insert form if the IR
  slots change
- `src/manual.golden.test.ts`

## Done when

- Browser: fresh ∫ shows limits on the symbol; ▶ and ◀ walk the
  cycle above; ▲/▼ only jump upper↔lower.
- `∫` `x²` `▶` `0` `▶` `1` `=` → 1/3.
- Tests/lint green. `docs/tech-issues.md` `R29` and `roadmap.md`
  **Now** move to `p2-calc` only if this slice is fully in.
  `vis-elements` ∫ hole cleared.
