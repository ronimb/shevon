# Kickoff — G2 pairing (fractions and display)

Copy everything below the line into a **new agent chat**. This is
**pairing / verification only**. Do not implement leftovers, Phase 3,
or fix mid-sitting.

---

## Context (read first)

**Program goal:** polish the daily exe on the **existing** featureset
(COMP + STAT + EQN + emulator extras already in). Later: Phase 3
modes with the same pairing treatment. Phase 3 is parked / low
priority — do not start it.

**Just closed (do not continue those chats):**

1. [Validate unit documentation](4fbb9cb3-f9d5-4048-a8bd-e98650315fcc)
   — G14 + G1 **re-check sitting done** (10 Oct 2026). Passes:
   `show-keys-face`, `show-keys-size`, `hist-scroll` (History text
   `1rem`), `R31`/`R32`/`R34`/`R35`/`R37`, CALC value `3A+B` → 25.
   Logged new fail **`R38`** (CALC/SOLVE entry layout).
2. [Resolve R38](9aacae11-a4cf-46ce-a525-879a23bf52f2) — **`R38`
   closed** in code (`src/lcd.tsx`): typed digits replace `A?`/`B?`
   on the left; previous value stays bottom-right only. Golden +
   docs updated. Optional later re-check of R38 only if Ron asks;
   do **not** start with it.

**Cursor:** [`validate-status.md`](validate-status.md). Open `R*`:
none. **Now** queue has no Phase 3 ids — pairing-driven fixes only
after this sitting.

**Shevon:** Ron runs the unit and Shevon (`http://localhost:3000` or
the exe). Prefer the Vite UI for fresh LCD paint unless he says
otherwise. Do not rebuild the exe unless he asks.

Follow [`validate-unit.md`](validate-unit.md) for cadence, form
rules, template editing QA, and logging. Sources:
`docs/principles.md`, `manual.pdf`, `docs/coverage.md`,
`docs/visual-fidelity-inventory.md`, `issues.md`,
`docs/tech-issues.md`.

You are a **guide and scribe** only. Do **not** open, lock, click,
CDP, or drive Shevon unless Ron explicitly asks.

### This sitting

Walk **G2 only** (fractions and display), starting at **G2.1**
`a b/c`. Finish the group, then stop.

| # | Function | Form | Function |
|---|----------|------|----------|
| 1 | `a b/c` | Stacked frac template, not `frac(` | `2` `a b/c` `3` `+` `1` `a b/c` `2` `=` → 7/6 or mixed |
| 2 | Mixed fraction | SHIFT `a b/c` mixed template | Enter a mixed value; `=` |
| 3 | Frac ▲ / ▼ | Caret moves num ↔ den (not COMP history) | Fill num; ▼ to den; ▲ back; match unit |
| 4 | Frac DEL empty num | Den filled, num empty; DEL in num — no `,n)` / `frac(` leak | e.g. enter den `2`, caret in empty num, DEL; LCD stays clean vs unit |
| 5 | S⇔D | Toggles fraction ↔ decimal | After 7/6, S⇔D → decimal and back |
| 6 | SETUP ab/c vs d/c | Page 2 items **1** / **2** on Shevon | Same value mixed vs improper |
| 7 | Fix | FIX indicator; digit count | SETUP Fix 3; `2÷3` `=` → 0.667 |
| 8 | Sci | SCI indicator | SETUP Sci 3; a wide number matches the unit |
| 9 | Norm 1 / 2 | FIX/SCI off | SETUP Norm; small/large switch vs the unit |
| 10 | ENG / SHIFT ENG | Result exponent steps by 3; not the letters ENG | After a result, ENG then SHIFT ENG |
| 11 | `%` | SHIFT `(`; not a percent template | `200+10%` `=` → 200.1 (`R17` closed) |
| 12 | Rnd | `Rnd(` template; DEL empty arg — no `Rnd(` dump | Under Fix 3, Rnd of a long value matches the unit |
| 13 | ° ′ ″ | Sexagesimal glyphs, not decimals only | Enter DMS; °′″ key toggles |

Apply **Template editing QA** on rows 1–4 (and Rnd if a template
is open): caret ▲▼, DEL empty box, no IR leak (`frac(`, `,n)`, etc.).

Do **not** re-walk G1 or G14. Do not start G3. Do not fix mid-sitting.

### Workflow

1. One case = one prompt (keys + what to compare on both). Stop.
2. Ron runs unit and Shevon; replies with **findings only** (not
   matching results / “pass”). Silence / `ok` / `clear` / `next` →
   pass that row.
3. Log findings to `docs/tech-issues.md` (`R*`) or `issues.md`
   (honesty / extras). Never both for the same defect. Update
   `validate-status.md` when the sitting ends.
4. AC both. Next case the same way.
5. End with the list of new ids. **No calculator code.**

### Do not refile

`R30`–`R38` (except dropped `R36`), `show-keys-size`,
`show-keys-face`, `hist-scroll`, `surd-pi-form` / `p4-exact`,
`lying-menus`, `setup-page2`, `lineio-display`, `ind-arrows`,
`prompt-prev-size`. See [`validate-status.md`](validate-status.md).
