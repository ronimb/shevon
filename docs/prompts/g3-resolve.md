# Kickoff — `g3-resolve` (G3 fails R44–R47 + setup-page1-disp)

Copy everything below the line into a **new agent chat**. One slice.
Resolution only — not pairing. Do not start Phase 3, G4 pairing,
LineIO, or `p4-exact`.

---

Follow `docs/principles.md` (**Naming**, visual fidelity). Sources:
[`docs/tech-issues.md`](../tech-issues.md) open `R44`–`R47`,
[`issues.md`](../../issues.md) `setup-page1-disp`,
`roadmap.md` **Now** `g3-resolve`,
[`validate-status.md`](validate-status.md) G3 table,
pairing chat [G3 validate walk](b29225fa-f226-40e0-a6b3-52cbad938732).
Update tech-issues / issues / roadmap **Now** in the same change.
Smoke [`sanity-landed.md`](sanity-landed.md).

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
parked.

## Must do

1. **`R44`** — Empty power (`xⁿ`) then DEL: unit clears the
   template; Shevon must not leave `,)` (or other IR) on the LCD.
2. **`R45`** — Empty radical radicand box vertical position: match
   the unit for √ / ³√ / ⁿ√ (value paths already OK).
3. **`R46`** — Arrow navigation: `Ans` is one token on the unit,
   not three letters to step through. Fix caret walk on COMP
   (seen on nth-root edit; apply wherever Ans is traversed).
4. **`R47`** — Reciprocal key (`x⁻¹`): `4` then reciprocal `=` must
   match the unit (stacked `1/4`), not Math ERROR. Superscript −1
   paint already OK.
5. **`setup-page1-disp`** — SETUP page 1 bottom `▼ Disp` cue: Ron
   flagged redundant. Match the unit; remove Shevon-only /
   duplicate Disp chrome on page 1. Do not invent a selectable
   Disp item there. Page-2 `5:Disp` stays stubbed (`comp-sep`).
6. Goldens / focused tests for each. Do not `Read` large PNGs.

## Do not

- Start G4 pairing or Phase 3.
- Change EVAL for G3 rows that already passed (squares, cubes,
  powers value, roots value, odd root of negative).
- Refile closed `R30`–`R43` / dropped `R36`.
- Name the hardware vendor or original model. Touch `manual.pdf`.

## Done when

- `R44`–`R47` closed in `docs/tech-issues.md`.
- `setup-page1-disp` closed or explicitly deferred in `issues.md`.
- `npm test` / `npm run lint` green. `sin(30)` still 0.5.
- `roadmap.md` **Now** clears `g3-resolve`.
