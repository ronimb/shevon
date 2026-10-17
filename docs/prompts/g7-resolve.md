# Kickoff — `g7-resolve` (R63–R68)

Historical kickoff — **landed** 17 Oct 2026 (`R63`–`R68` closed).
Keep for regressions. Do not re-open as **Now**.

Copy everything below the line only if re-running the slice.

Do not start Phase 3, G8 pairing, or G15 unless Ron asks.

---

Follow `docs/principles.md` (**Naming**, visual fidelity). Sources:
[`docs/tech-issues.md`](../tech-issues.md) open `R63`–`R68`,
`roadmap.md` **Now** `g7-resolve`,
[`validate-status.md`](validate-status.md) G7 table.
Update tech-issues / roadmap **Now** / validate-status in the same
change. Smoke [`sanity-landed.md`](sanity-landed.md).

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
parked. Doc map: [`../README.md`](../README.md).

## Must do

1. **`R63`** — Empty ∫: DEL must not leave `,,,x` (IR leak). Same
   family as other empty-template DEL clears.
2. **`R64`** — ∫ limit placeholders: both slots to the **right** of
   the ∫ glyph; upper slot top aligns with glyph top; lower slot
   bottom aligns with glyph bottom. Not stacked above/below the
   glyph, and the two slots must line up with each other.
3. **`R65`** — Overlay key-press feedback highlight more salient
   (stronger / clearer flash).
4. **`R66`** — Empty d/dx: one DEL must not leave `,x,)` (IR leak).
5. **`R67` + `R68` (one form pass)** — Fix Σ and `d/dx` with the
   **same tall calculus-template layout**, not separate font tweaks.
   - **`R68` (Σ):** tall template (bounds above/below, not a
     one-line squeeze). Upper = empty placeholder above; lower =
     `x=` + placeholder below; expression = parenthesized
     placeholder to the right of Σ. No prefilled `10`; bounds not
     both to the left of Σ. Do not refile as `sigma-bounds`.
   - **`R67` (`d/dx`):** once that shared form path is right, `d/dx`
     should read at unit scale/weight (it currently feels slightly
     small because the template is undersized / flat).

Also: goldens / focused tests. Do not `Read` large PNGs. Prefer
editing under `src/` only as needed — Ron may have the app open;
Vite HMR is off by default.

## Do not

- Start G8 / G15 pairing or Phase 3.
- Change EVAL for G7 values that already matched (∫ samples, d/dx
  of X² at 3 → 6, Σ of X 1..5 → 15, etc.).
- Hand-rewrite to “revert”; use git if Ron asks
  (`.cursor/rules/git-revert.mdc`).
- Name the hardware vendor or original model. Touch `manual.pdf`.
- Edit canvases unless Ron asks.
- Reopen closed `R29` or `sigma-bounds` for these fails.

## Done when

- `R63`–`R68` closed in `docs/tech-issues.md`.
- `npm test` / `npm run lint` green. Smoke sanity-landed as needed.
- `roadmap.md` **Now** clears `g7-resolve`; next is **G8** pairing
  (or whatever Ron schedules). Update `validate-status.md` cursor.
