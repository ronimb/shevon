# Unit pairing — status

**Pairing cursor only** — not the queue. Queue: [`roadmap.md`](../../roadmap.md)
**Now**. Tables/cadence: [`validate-unit.md`](validate-unit.md).
Doc map: [`../README.md`](../README.md).

Ron runs unit + Shevon. Agent: findings only; no code; no browser
drive unless asked.

**Tested** = walked on unit and Shevon. **Untested** = not yet.

## Cursor

**G8 resolve done** (17 Oct 2026). **`R69`–`R73` closed.**
**Now:** nothing scheduled. Do not start G9, G15, or Phase 3
unless Ron asks.

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

### G5 — trigonometry and hyperbolic (15 Oct 2026)

Function **pass** unless noted. Form fails logged. No IR leak on
empty DEL for walked templates.

| # | Walk | Notes |
|---|------|-------|
| 1 Deg | function **pass** (`sin 30` → 0.5). Form **fail** → **`R57`** | empty `sin(` placeholder box on Shevon only |
| 2 Rad | **pass** (`sin` of π/6 → 0.5) | **`R57`** only |
| 3 Gra | **pass** (`sin 50` → 0.5) | **`R57`** only |
| 4 sin / cos / tan | **pass** (`cos 60` → 0.5; `tan 45` → 1) | **`R57`** extended to cos/tan |
| 5 inverses | **pass** (`sin⁻¹ 0.5` → 30) | **`R57`** covers inverses |
| 6 tan poles | **pass** — Math ERROR (`R1`) | |
| 7 hyp menu | **pass** — overlay, not letters `hyp` | |
| 8 sinh… | **pass** (`sinh 0` → 0); no leak | **`R57`** extended to hyp |
| 9 hyp inverses | **pass** (`sinh⁻¹ 0` → 0); no leak | **`R57`** |
| 10 Abs | function **pass** (`Abs (−)7` → 7). Form **fail** → **`R59`** | Abs bars do not stretch for tall frac |
| 11 sin of frac | **pass** (form + value) | nested under sin; **`R57`** on empty |
| 12 Abs of frac | function **pass**; form **`R59`** | already logged on G5.10 |

Open `R*` after G5 sitting: **`R57`**, **`R59`** (plus interim
**`R55`** / **`R56`** / **`R58`**) → **closed** in `g5-resolve`
(15 Oct 2026).

### G6 — combinatorics and random (16 Oct 2026)

Function **pass** unless noted. `R6` (n! / nCr reject) still
good — not refiled. `fact-max` not walked.

| # | Walk | Notes |
|---|------|-------|
| 1 x! | **pass** | `5` x! → 120 |
| 2 n! reject | **pass** | `1.5!` and `(−)1!` Math ERROR |
| 3 nPr | function **pass** (`5` nPr `2` → 20). DEL **`R60`** → **closed in code** | caret at P erased the operator |
| 4 nCr | function **pass**. **`R60`** → **closed in code** | `5` nCr `2` → 10; same DEL on C |
| 5 nPr / nCr reject | **pass** | `5` nCr `1.5` Math ERROR |
| 6 Ran# | **pass** | two results in [0, 1); no leak |
| 7 RanInt# | function **pass** (not reported). Form **`R62`** → **closed in code** | empty form is `RanInt#(` only. DEL does not leave a comma |

Open `R*` after `g6-resolve`: none. **`R60`** / **`R61`** /
**`R62`** closed 16 Oct 2026. **`R61`** was the Abs bar-weight
follow-up (not a G6 row).

### G7 — calculus templates (17 Oct 2026)

Function **pass** unless noted (findings only; a clear row is
pass). `R29` and `sigma-bounds` not refiled.

| # | Walk | Notes |
|---|------|-------|
| 1 ∫ paint | form **`R64` closed**. DEL **`R63` closed** | limits column to the right of ∫, edge-aligned; one DEL clears empty ∫ |
| 2 ∫ caret | **pass** | |
| 3 ∫ value | **pass** | ∫ of X² from 0 to 1 |
| 4 d/dx | value **pass**. DEL **`R66` closed**. Size **`R67` closed** | one DEL clears empty d/dx; shared tall template |
| 5 Σ | function **pass**. Form **`R68` closed** | tall template; bounds above/below; parens; no prefilled `10` |
| 6 ∫ fraction | **pass** | 1/X from 1 to e |
| 7 d/dx quotient | **pass** | 1/X at 2 |

Open `R*` after `g7-resolve`: none. **`R63`–`R68`** closed
17 Oct 2026. **`R65`** was the overlay flash (not a G7 row).

### G8 — polar and rectangular (17 Oct 2026)

Function **pass** unless noted (findings only; a clear row is
pass). `R16` and `debt-value` not refiled.

| # | Walk | Notes |
|---|------|-------|
| 1 Pol | function **pass**. Form **`R70` closed**, **`R71` closed** | no argument boxes; result at normal size |
| 2 Rec | placeholders **`R70` closed**. Form **`R72` closed** | square-root argument shares the writing line |
| 3 Writes X,Y | **pass** | RCL X / Y match the unit |

Open `R*` from this sitting: none. **`R69`–`R73`** closed
17 Oct 2026 (`g8-resolve`).

### G14 — emulator extras (30 Sep 2026)

| # | Walk | After the fix |
|---|------|----------------|
| 1 Hitboxes | pass. SHIFT / ALPHA hold | n/a |
| 2 Show keys | X is ALPHA then `)` | `show-keys-face` **re-check pass** |
| 3 Size / strip | scale + chrome | `show-keys-size` **re-check pass** |
| 4 History Load | `R26` pass | `hist-scroll` **re-check pass** at `1rem` |
| 5 Exe frame | pass | n/a |

## Untested

- **G9–G13** (full). **G15** nested ([`g15-nested.md`](g15-nested.md)).
  G8 walked and resolved 17 Oct 2026. **Now** is empty, not G9.

## Do not refile

`R30`–`R43` (except dropped `R36`), `R5` / `R9`, `show-keys-size`,
`show-keys-face`, `hist-scroll`, `surd-pi-form` / `p4-exact`,
`lying-menus`, `setup-page2`, `setup-page1-disp`, `lineio-display`,
`ind-arrows`, `prompt-prev-size`, closed `R29`, `sigma-bounds`.
`R44`–`R73` closed. `R16` and `debt-value` (G8.3 / dual-line
Pol/Rec) checked 17 Oct 2026 — do not refile.
