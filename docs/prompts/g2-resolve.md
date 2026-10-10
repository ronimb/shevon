# Kickoff — `g2-resolve` (G2 form fails R39–R43)

Copy everything below the line into a **new agent chat**. One slice.
This is the **issue-resolution** chat after the G2 pairing sitting
([G2 pair](f2cb3982-4abe-4a32-9ec3-3a2966947df0)) — not a validation
sitting. Do not start Phase 3, LineIO, `p4-exact`, or G3 pairing.

---

Follow `docs/principles.md` (especially **Naming** and visual
fidelity). Sources: [`docs/tech-issues.md`](../tech-issues.md) open
`R39`–`R43`, [`issues.md`](../../issues.md) `setup-page2` (menu paint
only — see below), `roadmap.md` **Now** `g2-resolve`,
[`docs/visual-fidelity-inventory.md`](../visual-fidelity-inventory.md),
[`validate-status.md`](validate-status.md) G2 table.
Update tech-issues / issues / roadmap **Now** in the same change.
Refresh canvases if the story changed. Afterward smoke
[`sanity-landed.md`](sanity-landed.md).

You are closing **G2 pairing fails**. Match the **unit** (form +
behavior). Values that already matched in G2 stay matched.

Program goal: polish the daily exe on COMP + STAT + EQN. Phase 3
stays parked.

## Must do

Cluster template paint first, then mixed result, then SHIFT hold,
then DMS result order.

1. **`R39` (empty template slot)** — Empty input square is a
   **single** empty slot on the unit. Shevon must not paint two
   concentric squares (inner + outer). Affects `a b/c` and other
   templates that reuse the same empty-slot paint.
2. **`R40` (mixed whole empty box)** — On empty mixed fraction
   (SHIFT `a b/c`), the unit shows an empty box for the whole (`a`)
   slot. Shevon already places the caret there but must also paint
   that box. Num/den empty slots share `R39` paint.
3. **`R41` (ab/c mixed result)** — For improper 5/3 under SETUP
   **ab/c**, unit shows mixed `1⅔` (whole beside stacked frac).
   Shevon must not paint a nested equal-bar stack
   (`1 / (2/3)` / three-level look). **d/c** → improper `5/3`
   already matches — keep it.
4. **`R42` (SHIFT hold)** — While SHIFT is held, status stays
   active until **release**. SHIFT ENG then another ENG while still
   held must stay shifted. Do not clear SHIFT after the first
   shifted key. Same rule family as ALPHA hold (desired hold, not
   latch).
5. **`R43` (DMS after `=`)** — After
   `2` °′″ `30` °′″ `0` °′″ `=`, unit shows sexagesimal first
   (`2°30′0″`). Shevon must show that first, not decimal `2.5`
   with °′″ revealing DMS later. Keep unit S⇔D path under Norm 1:
   DMS → `5/2` → `2.5`.
6. **Goldens / focused tests** for empty-slot paint, mixed whole
   box, ab/c mixed result, SHIFT hold across two shifted keys, and
   DMS-first after `=`. Do not `Read` large unit PNGs into chat.
7. **`setup-page2` (menu paint only, optional if time)** — G2.6
   re-confirmed: SETUP page 2 should show the unit’s six rows
   (1:ab/c 2:d/c 3:CMPLX 4:STAT 5:Disp 6:CONT) even when CMPLX /
   Disp / CONT stay stubbed / not-implemented. Do **not** implement
   those modes. STAT FREQ stays on the live STAT entry. Skip this
   item only if Ron says defer; otherwise prefer landing it with
   this slice.

## Do not

- Implement inside a validate / G2-pair chat; this file is
  resolution only.
- Start Phase 3 (`p3-*`), G3 pairing, `p4-exact`, LineIO,
  `hist-letters`, or `comp-sep` Disp behavior.
- Change EVAL for rows that already passed (frac values, Fix/Sci,
  ENG stepping, `%` → 200.1, Rnd).
- Refile closed `R30`–`R38` or dropped `R36`.
- Name the hardware vendor or original model.
- Touch `manual.pdf`.
- `Read` overlay / icon / unit PNGs into chat (provider 400 risk).

## Files (likely)

- `src/display.tsx` / `src/index.css` — empty slot, mixed frac paint
- `src/lcd.tsx` / result formatting — ab/c mixed vs nested stack; DMS
  after `=`
- `src/modes/comp.ts` or shift-state handling — SHIFT hold (`R42`)
- SETUP page-2 menu list (wherever MODE/SETUP menus are defined)
- `src/manual.golden.test.ts`
- `docs/tech-issues.md`, `issues.md` (`setup-page2` if painted),
  `roadmap.md`, [`validate-status.md`](validate-status.md)

## Done when

- `R39`–`R43` checked closed in `docs/tech-issues.md`.
- `setup-page2` updated or explicitly deferred with a one-line note
  in `issues.md`.
- `npm test` / `npm run lint` green. `sin(30)` still 0.5.
- `roadmap.md` **Now** clears `g2-resolve` (queue empty or next
  pairing-driven id only).
- Pairing re-check of these rows is **untested** until a later
  validate sitting — do not start G3 here.
