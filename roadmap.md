# Roadmap

Detailed plan for Shevon. This file is the
**source of truth for scheduled work**.


| If you need…                                      | Go here                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Design rules (visual fidelity, behavior matching) | `[docs/principles.md](docs/principles.md)`                               |
| Open bugs (honesty / leftovers)                   | `[issues.md](issues.md)`                                                 |
| Landed-correctness review (`R*` / `ti-*`)         | `[docs/tech-issues.md](docs/tech-issues.md)`                             |
| Ideas not yet assigned to a phase                 | `[backlog.md](backlog.md)`                                               |
| Feature-by-feature hardware map                   | `[docs/coverage.md](docs/coverage.md)`                                   |
| LCD element audit                                 | `[docs/visual-fidelity-inventory.md](docs/visual-fidelity-inventory.md)` |
| Triage / oversight (no implementation)            | `[docs/prompts/supervisor.md](docs/prompts/supervisor.md)`               |
| Packaging slice (view)                            | `[canvases/packaging.canvas.tsx](canvases/packaging.canvas.tsx)`         |
| Unit pairing (form + function, no code)           | `[docs/prompts/validate-unit.md](docs/prompts/validate-unit.md)`         |


Canvases (`canvases/*.canvas.tsx`) are **views**. If a canvas disagrees with
this file, this file wins — refresh the canvas in the same change when the
phase story changed.

Status: `[ ]` open · `[x]` done (leave done items here until the next phase
wrap-up, then move them to **Landed**).

---



## Now

Daily-driver bar: COMP + STAT + EQN. One slice per chat. Phase 2
slices are closed. `p4-packaging` and `p4-tauri` are in (Pages
skipped; WebView2 daily exe verified). Phase 3 is unblocked but
not Now — `show-keys-size` before Phase 3.
Lying MODE rows wait for the matching feature. LineIO / 99-byte /
`:` / `hist-letters` stay parked.

Catalog of landed-correctness ids: `[docs/tech-issues.md](docs/tech-issues.md)`.
Honesty leftovers: `[issues.md](issues.md)`. After every slice: `[sanity-landed.md](docs/prompts/sanity-landed.md)`.
STAT / EQN pairing (no code): `[sanity-stat.md](docs/prompts/sanity-stat.md)`.
Unit pairing (no code): `[validate-unit.md](docs/prompts/validate-unit.md)`
— walk and log only; fixes are separate resolution chats after the
sitting.
Triage (no code): `[supervisor.md](docs/prompts/supervisor.md)`
([`triage.md`](docs/prompts/triage.md) is an alias).

### Queue


| Order | Id               | What                                              | Kickoff                                       |
| ----- | ---------------- | ------------------------------------------------- | --------------------------------------------- |
| 1     | `show-keys-size` | Scale Show keys / Current history chips for small screens | [`show-keys-size.md`](docs/prompts/show-keys-size.md) |


`ti-stat` … `ti-edges`, `R17` (`r17-percent`), `R28` (`r28-exp`),
`R29` (`r29-int`), and `g1-resolve` (`R31`–`R32`, `R34`–`R37` +
`prompt-prev-size`) are in **Landed**. `R27` closed (PC `3` works).
`R30` / `R33` closed earlier this sitting (not bugs / frac ▲▼).

Engine debt A–C historical: `[tech-debt.md](docs/prompts/tech-debt.md)`.

---



## Cross-cutting — visual fidelity

Applies to **every** phase. Principles:
`[docs/principles.md](docs/principles.md)`.

- [ ] `vis-elements` — Missing or misplaced chrome on shipped screens.
  ```
  Open: (none from prompt-prev-size — closed with g1-resolve). EQN a/b/c,
  carets, and ∫ limits on the symbol (`R29`) landed.
  ```
- [ ] `vis-indicators` — Light status indicators from real state. ◀▶ and the
  ```
  COMP-history ▲▼ now light (Now slice); STAT ▲▼ and Disp still pending;
  CMPLX, MAT, VCT when those modes ship. (S/A/M/STO/RCL/STAT/D/R/G/FIX/SCI
  already work.)
  ```
- [ ] `vis-menus` — Fix with the matching feature, not as a standalone pass.
  ```
  MODE 2/4/6/7/8 → Phase 3. EQN 1–4 landed (`p2-eqn-linear`,
  `p2-eqn-cubic`). Dist P( Q( R( `'t` landed (`p2-dist`).
  ```
- [ ] `vis-result` — Same result forms as the unit: S⇔D fraction/surd/π,
  ```
  complex a+bi, ×10ⁿ. Dual-line Pol/Rec r,θ landed with `debt-value`.
  Fractions, mixed fractions, sci, ENG, and DMS °′″ already work.
  ```
- [ ] `vis-errors` — Math / Syntax ERROR E-40 ◀▶ jump-to-token landed
  ```
  (`debt-source-map`). Stack / Argument ERROR screens still missing —
  do not add them until a mode needs them.
  ```
- [x] `vis-no-literal` — Never show literal function text where the hardware
  ```
  shows a symbol or opens a menu. ENG/hyp dumps are gone; trig/hyp/`ln` now
  paint styled names and unclosed templates no longer leak IR stems (one
  shared table in `src/display.tsx` for the LCD and History). Faceplate
  ×10ˣ paints condensed `×10` plus a normal-width superscript (`R28` /
  `R36`); π uses serif `.math-pi` (`R37`).
  ```
- [ ] `vis-checklist` — Definition of done per feature: element + behavior
  ```
  parity vs the manual figure. Pixel-exactness not required.
  ```

`vis-cursor` (COMP / EQN / STAT carets) and EQN quadratic placement (`a`/`b`/`c`,
bottom-left entry) have landed — do not re-open unless a regression shows up.

---



## Phase 0 — Cursor-ready foundation

**Status: landed.** Goal was a repo that is understandable, testable, and
honest about what it is.

See **Landed**. (`p0-console` is closed.)

---



## Phase 1 — Make COMP and SETUP honest

**Status: landed.** Goal: every COMP faceplate key does the hardware thing, or is
explicitly disabled — never dump the letters ENG or hyp onto the LCD.

See **Landed**. Remaining COMP gaps that did not block Phase 1 are listed under
**COMP leftovers** below.

---



## Phase 2 — Finish STAT and EQN

**Status: landed.** Ron’s 27 Sep 2026 walk was clear except
`setup-page2` (already on `issues.md` / `vis-menus`).
`p4-packaging` and `p4-tauri` are in; Phase 3 is unblocked. **Now** is
`show-keys-size`.

- [x] `p2-freq` — SETUP STAT FREQ ON/OFF; editor row limits 80 / 40 / 26.
- [x] `p2-solve` — SOLVE: prompt remaining variables, “solve for x”, then
  ```
  equation + `x=` + `L-R=` on one screen; Continue to retry. Typed
  `CalcError` so Variable ERROR / Can’t Solve are real kinds.
  Issue: `solve-errors`.
  Kickoff prompt: `[docs/prompts/p2-solve-errors.md](docs/prompts/p2-solve-errors.md)`.
  ```
- [x] `p2-edit` — STAT Edit Ins and Del-A; DEL deletes a line in the editor
  ```
  (SHIFT 1 → 3 Edit → Ins / Del-A; SHIFT DEL also inserts). Issue: `stat-del`.
  ```
- [x] `p2-calc` — Unshifted CALC (E-19): prompt only real memory letters,
  ```
  previous-value / bottom-left entry, recalc after `=`, equalities as
  the figure shows (`Y=X²+X+3` stores Y; not Newton). Do not implement
  SETUP LineIO. Issue: `calc-ux`.
  Kickoff: `[docs/prompts/p2-calc.md](docs/prompts/p2-calc.md)`.
  (Was COMP leftover `comp-calc`.)
  ```
- [x] `p2-dist` — 1-VAR Dist: P( Q( R( and normalized variate `'t`
  ```
  (E-25). Hidden on paired-variable types. Recall stays in STAT
  (`p2-stat-mode`).
  Issue: `dist-empty`.
  Kickoff: `[docs/prompts/p2-dist.md](docs/prompts/p2-dist.md)`.
  ```
- [x] `p2-stat-mode` — Stay in STAT when recalling variables instead of
  ```
  silently jumping to COMP. SHIFT 1 Sum / Var / MinMax / Reg / Dist
  land on the STAT calc line (`STAT_CALC`); STAT stays lit; `=` uses
  the current STAT data. CALC / SOLVE / hyp still do not overlay
  (`R12`). AC from STAT still turns STAT off (`R13`).
  Issue: `stat-jump-comp`.
  Kickoff: `[docs/prompts/p2-stat-mode.md](docs/prompts/p2-stat-mode.md)`.
  ```
- [x] `p2-eqn-linear` — EQN 2-unknown and 3-unknown linear systems.
  ```
  MODE 5 → 1 / 2 open Coefficient Editors (an/bn/cn[/dn], row
  numbers, bottom-left entry). E-28 samples: X=−1 Y=2 and
  X=1 Y=2 Z=3. Singular / no unique solution is Math ERROR
  (same class as quadratic a=0, R19).
  Kickoff: `[docs/prompts/p2-eqn-linear.md](docs/prompts/p2-eqn-linear.md)`.
  ```
- [x] `p2-eqn-cubic` — EQN cubic. MODE 5 → 4 opens a/b/c/d
  ```
  Coefficient Editor; E-28 Ex.5 x³−2x²−x+2=0 → X1=−1,
  X2=2, X3=1 via ▲/▼; a=0 is Math ERROR (R19). Complex
  a+bi uses the same paint as quadratic. Exact surd form
  stays `p4-exact`.
  Kickoff: `[docs/prompts/p2-eqn-cubic.md](docs/prompts/p2-eqn-cubic.md)`.
  ```

---



## Phase 3 — Remaining hardware modes

**Status: not started.** One mode per slice, with manual sample operations as
tests before done. Packaging gate is clear; Phase 3 waits until
`show-keys-size` leaves **Now**.

- [ ] `p3-cmplx` — CMPLX: i, ∠, a+bi / r∠θ, arg, Conjg, `'r∠θ` / `'a+bi`.
- [ ] `p3-basen` — BASE-N: bases, d/h/b/o prefixes, logic ops, 16/32-bit ranges.
- [ ] `p3-matrix` — MATRIX: Dim/Data, MatA/B/C/Ans, det, Trn, inverse, Abs, powers.
- [ ] `p3-vector` — VECTOR: 2D/3D, dot, cross, Abs, VctAns.
- [ ] `p3-table` — TABLE: f(x), Start/End/Step, Insufficient MEM at >30 rows.
- [ ] `p3-const` — CONST 01–40 (CODATA 2007) and CONV 01–40 (NIST SP 811).

Lying MODE rows stay until the matching `p3-*` feature ships (`vis-menus`
policy). Do not add a separate not-implemented pass.

---



## Phase 4 — Fidelity and packaging

**Status: packaging + Tauri landed.** `p4-exact` /
`p4-samples` wait. Phase 3 is unblocked and does not wait on
packaging.

- [ ] `p4-exact` — Natural result forms: n√m, p/q π, mixed fractions — not just
  ```
  continued-fraction decimals. (Mixed/improper via SETUP ab/c vs d/c already
  exist; surd and π forms do not.)
  ```
- [ ] `p4-samples` — Automate every numbered sample operation in the PDF as a
  ```
  regression suite.
  ```
- [x] `p4-packaging` — Tab / manifest / `win.icon` use a full-bleed
  ```
  Shevon lettermark (`scripts/make-icons.ps1`). PWA install
  skipped. Portable `dist-desktop/Shevon.exe` (frameless;
  History widen; Pin; Keyboard bring-to-front). Ron verified
  launch; `sin(30)` still 0.5. Pages skipped (no live desktop
  URL wanted). ~100 MB Electron shell replaced by `p4-tauri`.
  ```
- [x] `p4-tauri` — Electron → Tauri / WebView2 soft cutover (29 Sep
  ```
  2026). Daily `build:exe` → ~10 MB `dist-desktop/Shevon.exe`;
  Electron fallback `build:exe:electron` → `Shevon-electron.exe`.
  Same Vite `dist/`; desktop APIs (History widen, Pin,
  bring-to-front). Phase E matrix signed by Ron. Plan:
  [`p4-tauri.md`](docs/prompts/p4-tauri.md).
  ```

---



## Emulator extras (scheduled, not Now)

**History sequence contract** (live Current history *and* saved History pane):
sequences log the **physical faceplate keys** that produce the expression,
including SHIFT/ALPHA. Overlay clicks and `reconstructSequence` (used on `=`)
must emit the same vocabulary for the same token. Chips use the same glyphs
as the keycaps (`sin`, `x^□`, `)`, `S⇔D`), not logical letters.

- Example: typing `x` inserts variable X and logs `ALPHA`, `)` — the key that
wears the red X. Same for `y` → `ALPHA`, `S⇔D`. Digits are one chip each
(`6`, `0`, not `60`).
- If ALPHA/SHIFT is already latched (Alt/Shift held, or overlay toggle), do
not duplicate the modifier in the log.
- Corrections (DEL, overwrite) do not appear; Show Keys is the **final**
recipe, same as `reconstructSequence`.

- [x] Keyboard `x` / `y` insert X / Y; live sequence and `reconstructSequence`
  both log `ALPHA`, `)` / `ALPHA`, `S⇔D`. Show Keys chips match keycaps.
- [x] **Current history** — live key strip **across the top** of the page
  (not in the History pane). Same chips as Show Keys; SHIFT/ALPHA are
  circular like the faceplate. Hidden by default; Show keys toggle.
  Opening the strip or History pane rescales the unit so it stays fully
  visible. AC clears the LCD and the strip. Records calculations **and**
  non-calc operations (STO letter, MODE, SETUP, CLR, M+/M−).
- [ ] `show-keys-size` — Chip glyphs too large on ~13" laptops (fine on
  ```
  ~23"). Same UI in Electron and Tauri. Scale with window / DPI.
  **Before Phase 3.** Pairing confirms in validate-unit **G14** after
  G1 wraps. Issue: `show-keys-size`.
  Kickoff: `[docs/prompts/show-keys-size.md](docs/prompts/show-keys-size.md)`.
  ```
- [ ] Remaining letter shortcuts (and SHIFT/ALPHA overlays for A–F / M)
  audited against this contract.
- [ ] `shift-ac-mem` — SHIFT AC clears memory with a visible
  indication. Hardware SHIFT AC is OFF (skip). Today: SHIFT 9 →
  2. Kickoff: `[docs/prompts/shift-ac-mem.md](docs/prompts/shift-ac-mem.md)`.

Related defects: `[issues.md](issues.md)` `hist-letters`, `comp-keys`,
`shift-ac-mem`, `show-keys-size`.

---



## COMP leftovers

Not a new phase. Pull into the current phase when they block honesty.
Coverage detail: `[docs/coverage.md](docs/coverage.md)`.

- [ ] `comp-lineio` — SETUP MthIO / LineIO (currently display-only), overwrite
  ```
  cursor, SHIFT DEL (INS) wrap-as-argument. Issue: `lineio-display`.
  ```
- [ ] `comp-colon` — Multi-statements `:` (ALPHA CALC) and Disp indicator.
- [ ] `comp-drg` — SHIFT DRG `° r g` conversions (1G menu).
- [ ] `comp-bytes` — 99-byte input limit and cursor-k warning at 10 bytes left.
- [ ] `comp-sep` — SETUP Dot / Comma result decimal separator.
- [x] `comp-calc` — Pulled into Phase 2 as `p2-calc`. Leave this line until
  ```
  wrap-up. Do not implement SETUP LineIO here (`comp-lineio`).
  ```
- [ ] `comp-range` — Per-function ranges from E-38–39; factorial max 69;
  ```
  Σ ±1e10 bounds; nested Pol/∫/d/dx/Σ ban.
  ```
- [ ] `comp-keys` — PC keyboard: remaining letter keys steal typing; Shift is
  ```
  hold vs overlay toggle. `x`/`y` now insert X/Y (see History sequence
  contract).
  ```

---



## Out of scope until later

- Contrast, battery, auto power-off (hardware; skip).
- Pixel-perfect LCD font (not before Phase 3 is done).
- Re-implementing Phase 0 / Phase 1 (see **Landed**).

---



## Landed

Do not re-open these unless a regression shows up.

**Phase 0** — App split, typed AST (no `new Function`), golden tests, README,
AI Studio deps gone, `calculator_new.png` committed. Remaining `console.log`
is the hitbox-calibration CSS dump, not expression logging.

**Phase 1** — SETUP Fix/Sci/Norm + FIX/SCI indicators, hyp menu + Abs,
Ran#/RanInt#, ENG, sexagesimal °′″, Rnd(, Gauss–Kronrod ∫, central-diff d/dx,
LCD ▲/▼ history replay, Math/Syntax ERROR dismiss, SHIFT 9 CLR.

**Phase 2 started** — STAT FREQ ON/OFF with 80/40/26 row caps; EQN quadratic
editor a/b/c labels, cell caret, bottom-left entry; STAT editor caret;
quadratic complex roots as a+bi. STAT Edit (E-23): DEL deletes the line,
Ins / Del-A from the editor SHIFT 1 menu (`p2-edit`). EQN 2-unk / 3-unk
Coefficient Editors + E-28 samples (`p2-eqn-linear`); cubic a/b/c/d
+ E-28 Ex.5 (`p2-eqn-cubic`).

**Packaging** — `p4-packaging` (29 Sep 2026): local Shevon
lettermark, PWA install and Pages skipped. `p4-tauri` (29 Sep
2026): WebView2 daily `Shevon.exe` (~10 MB); Electron fallback
`build:exe:electron`.

**Visual** — COMP / EQN / STAT carets (`vis-cursor`); ENG/hyp/Abs/Ran# no
longer dump raw ASCII. `vis-no-literal`: shared LCD/History template table so
trig/hyp/`ln` paint styled names and unclosed templates never leak IR stems
(`ir-leak`, `ascii-tokens`). Faceplate ×10ˣ paints condensed `×10` plus a
normal-width exponent (`R28` / `R36`); π uses serif `.math-pi` (`R37`).
∫ limits sit on the symbol (`R29`).
`vis-indicators`: ◀▶ + COMP-history ▲▼ light. SOLVE/CALC previous value is
normal result size (`prompt-prev-size`). Caret hidden after `=` / Ans-op /
history replay; AC idle result blank (`g1-resolve` / `R31`–`R32` /
`R34`–`R35`).

**SOLVE** — E-20/E-21/E-41: Variable ERROR, Can’t Solve, initial-X prompt,
X= result, L−R residual, Continue (`p2-solve`). LCD errors are one
`lcdError` (`CalcError`), not Syntax/Math booleans.

**CALC** — E-19 unshifted CALC (`p2-calc`): memory letters only (not
stems / IR); `A?` + previous value; CALC after `=` re-prompts; assignment
`Y=X²+X+3` evaluates the right side and stores Y. Not SOLVE / Newton.
Not SETUP LineIO.

**STAT Dist** — E-25 1-VAR P( Q( R( `'t` (`p2-dist`). SHIFT 1 → 5 Dist
inserts the hardware rows; `'t` is (X−x̄)/σx; P/Q/R are the standard-normal
areas on the figure. Hidden on paired-variable types.

**STAT recall** — SHIFT 1 Sum / Var / MinMax / Reg / Dist stay in STAT
(`p2-stat-mode`). The symbol lands on the STAT calc line; STAT stays
lit; `=` uses the current STAT data. CALC / SOLVE / hyp do not overlay
(`R12`). AC from STAT still turns STAT off (`R13`).

**Tests** — golden (manual samples + Phase 1/2 + vis-no-literal +
history/keys + SOLVE + E-19 CALC + E-40 offset/jump + STAT Edit + E-25 Dist + stay-in-STAT + `ti-stat` +
`ti-numerics` + `ti-store` + `ti-parse` + `ti-keys` + `ti-escape` +
`ti-edges` + `r17-percent` + `r28-exp` + `r29-int` + `g1-resolve` + E-28 linear + E-28 cubic) + parser (implicit
multiply) = 181 (29 Sep 2026).

**ti-stat** — STAT editor first keystroke replaces the cell (FREQ `1` → `5`);
`evaluateExpression` does not overlay A/B/C/R/N on user memory; invalid
x̂/ŷ is Math ERROR. STAT `n` / `r` / `stat_*` still resolve.

**ti-numerics** — tan poles at every odd quarter-turn are Math ERROR;
odd roots of negatives are real (`root(3,-8)` = −2); factorial / nCr /
nPr reject non-integers and negatives; `0^0` and a lone `!` are Math
ERROR. Factorial max stays 170 (`fact-max`).

**ti-store** — STO evaluates `Ans` as a numeric env binding (huge Ans
is not `"1e+21"` text); a failing operand does not write the letter.
CALC/SOLVE `commitPromptValue` stores typed `0`; empty keeps previous.

**ti-parse** — Adjacent memory letters multiply (`XY` is X×Y, `AB` is
A×B). SOLVE does not prompt letters inside `Ans` / `nCr` / function
stems. Unshifted CALC E-19 is `p2-calc`.

**ti-keys** — After `=`, x^n is `Ans^(‸)` (SHIFT: `root(Ans,‸)`);
x² / cube always clear SHIFT. Caret jumps `pol(` `rec(` `^(`.
frac / nPr / nCr / x^n / x² write the COMP line only in COMP.

**ti-escape** — CALC / SOLVE / hyp run only on a COMP calc line (STAT
recall stays in STAT). AC from STAT enters COMP with STAT off
and overlays cleared; EQN AC stays in the editor and still clears hyp /
prompt / SOLVE / `lcdError`. History Load enters COMP and drops overlays.

**ti-edges** — `(−) 3 x²` is −9 (postfix x² above prefix `(−)`);
Pol/Rec write X,Y via `setVars`; EQN a=0 is Math ERROR; `|x| < 1e-15`
uses Norm sci; singular ∫ is Time Out; persisted Ans/vars/angle are
validated; the result line is blank while typing and after AC (no idle
`0` — `R34` refined the earlier R24 idle-0 note).

**r17-percent** — `%` is ÷100 on every path (`200+10%` = 200.1,
`200-10%` = 199.9). Not percent-of.

**r29-int** — ∫ limits sit on the symbol (upper above, lower below).
▶: integrand → lower → upper → after dx → before ∫ (wraps).
◀ reverses: integrand → before ∫ → after dx → upper → lower →
integrand. ▲ from integrand/lower → upper and stops; ▼ from
integrand/upper → lower and stops. `int(sqr(x),0,1)` is still 1/3.

**g1-resolve** — COMP caret hidden after `=` / Ans-operator continue /
history replay (`R32` / `R35` / `R31`); first history ▲ skips the
on-screen latest; ▼ restores matching result; ×10ˣ exponent
normal-width (`R36`); serif π (`R37`); CALC/SOLVE prev value normal
size (`prompt-prev-size`).

**debt-source-map** — IR rewrite carries original offsets onto AST nodes and
`CalcError.offset`. Syntax / Math ERROR ◀▶ jumps to the fault token. Implicit
multiply is token-level in the parser (`log10(100)` stays 2). Helper bag is
typed.

**debt-shell** — `Calculator.tsx` composes `lcd.tsx`, `keyboard.ts`,
`useCalculatorState`, and `modeRouter.ts`. One store for `vars` / `ans` /
history. STAT recall lives in `modes/stat.tsx` and stays in STAT.

**debt-value** — `evaluateExpression` returns `CalcValue` (`real` |
`complex` | `pair`). EQN a+bi uses `complex`. Top-level Pol/Rec is a
`pair` (`r=…, θ=…` / bottom-right `x=…, y=…`). Reserved `integer` /
`matrix` kinds exist for later modes. Surd/π stay `p4-exact`.

---



## How to use this file

When you pick up, finish, defer, or add **scheduled** work, edit this file in
that same change. New ideas with no phase go in `[backlog.md](backlog.md)`.
Honesty / leftover defects go in `[issues.md](issues.md)`, with a phase or
action id when one exists. Landed-correctness review items (`R*`, `ti-*`) go in
`[docs/tech-issues.md](docs/tech-issues.md)`. Triage /
oversight chats follow `[docs/prompts/supervisor.md](docs/prompts/supervisor.md)`
(`triage.md` is an alias) and do not implement leftovers.