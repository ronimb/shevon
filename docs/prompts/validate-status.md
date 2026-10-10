# Unit pairing — status

Handoff for the next machine. This is the pairing cursor only.
Scheduled work stays in [`roadmap.md`](../../roadmap.md) **Now**.
Open leftovers stay in [`issues.md`](../../issues.md). Landed
`R*` stay in [`docs/tech-issues.md`](../tech-issues.md). The walk
itself is [`validate-unit.md`](validate-unit.md).

Logged 1 Oct 2026; G2–G4 walks 10 Oct 2026; `g4-resolve` done.
Pairing chat: guide and scribe only. Ron runs the unit and Shevon.
Do not drive the browser unless he asks. One row at a time. No
calculator code in a pairing chat.

**Tested** means Ron walked it on the unit and Shevon.
**Untested** means no such walk yet.

## Cursor

**G4 pairing + resolve + re-check done** (10 Oct 2026).
`R49`–`R54` closed in `g4-resolve`; re-check pass (Ron).

**Next:** G5 pairing — [`g5-pair.md`](g5-pair.md). **G15** nested
untested — schedule separately. Do not start Phase 3.
Closed chats:
[re-check](4fbb9cb3-f9d5-4048-a8bd-e98650315fcc),
[R38 resolve](9aacae11-a4cf-46ce-a525-879a23bf52f2),
[G2 pair](f2cb3982-4abe-4a32-9ec3-3a2966947df0),
[g2-resolve](4d4bba9a-944f-40b3-ab42-79ece793603f),
[G3 pair](b29225fa-f226-40e0-a6b3-52cbad938732),
[g3-resolve](52d1a0ee-c8b6-4764-93fc-132516030a23),
[G4 pair](db788c9e-e8de-401f-8e63-7b766be15180).

## Re-check results (10 Oct 2026)

| Id | Result |
|----|--------|
| `show-keys-face` | **pass** |
| `show-keys-size` | **pass** |
| `hist-scroll` | **pass** after History entry text set to `1rem` (was 0.75rem; original before fix was 1.1em) |
| `R32` / `R35` caret | **pass** |
| `R34` AC blank | **pass** |
| `R37` π serif | **pass** |
| `R31` history ▲▼ | **pass** |
| CALC value `3A+B` | **pass** → 25 |
| CALC entry layout | **fail** → **`R38`** (closed: typed digits replace `A?` on left; previous bottom-right only) |

## Tested walks

### G1 — arithmetic and entry (29 Sep 2026)

Walked. `g1-resolve` re-check **passed** 10 Oct 2026. Layout find
`R38` closed in a resolution chat.

| # | Walk | After the fix |
|---|------|----------------|
| 1 Digits | pass — stacked 25/2. `R30` closed | n/a |
| 2 `+ − × ÷` | pass — 1 | n/a |
| 3 `( )` | pass — 8 | n/a |
| 4 Unary `(−)` | pass — −9 | n/a |
| 5 Ans | value pass. Caret `R32` | **re-check pass** |
| 6 DEL | pass — 13 | n/a |
| 7 AC | clear works. `R34` | **re-check pass** (blank) |
| 8 `×10ˣ` | value pass. Caret `R35`. `R36` dropped | **re-check pass** (caret) |
| 9 π | value pass. `R37` | **re-check pass** |
| 10 e | pass | n/a |
| 11 Implicit × | `2 sin 30` pass. `2π` exact = `surd-pi-form` | n/a |
| 12 History ▲▼ | `R31` | **re-check pass** |

### G2 — fractions and display (10 Oct 2026)

| # | Walk | Notes |
|---|------|-------|
| 1 `a b/c` | function **pass**. Form `R39` → **re-check pass** (single box, clear of frac bar) | was concentric / oversized |
| 2 Mixed | function **pass**. Form **fail** `R40` → **closed in code** | was caret, no whole box |
| 3 Frac ▲/▼ | **pass** | num ↔ den |
| 4 Frac DEL empty num | **pass** | both → integer `2`; no leak |
| 5 S⇔D | **pass** | |
| 6 SETUP ab/c vs d/c | d/c **pass**. ab/c `R41` + `setup-page2` → **closed in code** | was nested stack / 3-row menu |
| 7 Fix | **pass** | `0.667`; SETUP page 1 items OK. `▼ Disp` → `setup-page1-disp` **closed** |
| 8 Sci | **pass** | |
| 9 Norm 1/2 | **pass** | |
| 10 ENG / SHIFT ENG | stepping **pass**. Hold `R42` → **closed in code** | was clear after first shifted key |
| 11 `%` | **pass** | `200.1` (`R17` closed) |
| 12 Rnd | **pass** | Fix 3: `Rnd(10÷3)×3` → 9.999; empty DEL clean |
| 13 ° ′ ″ | `R43` → **closed in code** | was decimal-first after `=` |

Open `R*` after `g2-resolve` re-check: none (before G3).

### G3 — powers and roots (10 Oct 2026)

| # | Walk | Notes |
|---|------|-------|
| 1 x² | **pass** | `5` x² `=` → 25 |
| 2 x³ | **pass** | `3` SHIFT x² `=` → 27 |
| 3 xⁿ | value **pass** (256). DEL empty **fail** → **`R44`** → **closed in code** | unit clears template |
| 4 After `=` xⁿ | **pass** | `Ans^(‸)` → 81 (`R9` still good) |
| 5 √ | value **pass** (3). Empty box → **`R45`** → **closed** (caret-tall, writing line) | DEL empty clean |
| 6 ³√ | value **pass** (2). Same empty-box → **`R45`** | |
| 7 ⁿ√ | value **pass** (5th root of 32 → 2). Box **`R45`**. Ans → **`R46`** → **closed** | Ans one object |
| 8 x⁻¹ | form OK. Unit `1/4`. Math ERROR → **`R47`** → **closed in code** | |
| 9 Odd root of − | **pass** → −2 | `R5` still good |
| 10 √ DEL empty | **pass** | no `sqrt(` leak; matches unit |

Open `R*` after `g3-resolve` / radical paint: none.

### G4 — logs and exponentials (10 Oct 2026)

Function assumed pass unless Ron called a mismatch. Values matched;
all new fails are form.

| # | Walk | Notes |
|---|------|-------|
| 1 log | function **pass**. Form **fail** → **`R49`**. DEL empty clears both | empty box on Shevon only |
| 2 ln | function **pass**. Form **`R49`** + **`R50`** | e bold/italic on unit |
| 3 log□ | function **pass**. Form **`R51`** | unit closes parens |
| 4 10^ | function **pass**. Form **`R52`** | condensed `10` (~one digit wide) |
| 5 e^ | function / hygiene **pass**. Form **`R50`** | e in e^ same as R50 |
| 6 log of frac | function / hygiene **pass**. Form **`R53`** | tall parens — **global** |
| 7 10^ of frac | function **pass** (assumed). Form **`R54`** (+ `R52`) | drop `10` so frac exponent sits clear |

Open `R*` after G4 sitting: **`R49`–`R54`** → **closed** in
`g4-resolve`; **re-check pass** (Ron, 10 Oct 2026).

### G14 — emulator extras (30 Sep 2026)

| # | Walk | After the fix |
|---|------|----------------|
| 1 Hitboxes | pass. SHIFT / ALPHA hold | n/a |
| 2 Show keys | X is ALPHA then `)` | `show-keys-face` **re-check pass** |
| 3 Size / strip | scale + chrome | `show-keys-size` **re-check pass** |
| 4 History Load | `R26` pass | `hist-scroll` **re-check pass** at `1rem` |
| 5 Exe frame | pass | n/a |

## Untested

- **G15** nested COMP templates ([`g15-nested.md`](g15-nested.md)).
- **G5.11–12**, **G7.6–7** (nested frac in those groups — walk
  with the group).
- Groups **G5–G13** (full). G4 done.

## Do not refile

`R30`–`R43` (except dropped `R36`), `R5` / `R9` (closed behavior
confirmed on G3), `show-keys-size`, `show-keys-face`, `hist-scroll`,
`surd-pi-form` / `p4-exact`, `lying-menus`, `setup-page2` (closed),
`setup-page1-disp` (closed in `g3-resolve`), `lineio-display`,
`ind-arrows`, `prompt-prev-size`. `R44`–`R54` closed — do not refile.
