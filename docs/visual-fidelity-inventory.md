# Visual fidelity inventory

Inventory of which visual/UI elements currently exist in Shevon, mapped
against the roadmap’s “fix existing vs. add missing” split.

**Source of truth** for the LCD audit. Principles:
[`principles.md`](principles.md). Scheduled `vis-*` work:
[`roadmap.md`](../roadmap.md). Honesty leftovers: [`issues.md`](../issues.md).
Landed-correctness review: [`docs/tech-issues.md`](tech-issues.md).

Refreshed 26 Sep 2026 after `R29` (∫ limits on the symbol + caret path).
If this file disagrees with `roadmap.md` on what is scheduled, follow the
roadmap.

## Key source files

| Role | Path |
|------|------|
| Entry re-export | `src/App.tsx` → `Calculator.tsx` |
| Shell compose (keypad overlay, history pane) | `src/Calculator.tsx` |
| LCD + status annunciators | `src/lcd.tsx` |
| PC keyboard + SHIFT/ALPHA flash | `src/keyboard.ts` |
| One calc state store | `src/useCalculatorState.ts` |
| Mode router (COMP / STAT / EQN / SETUP / CLR) | `src/modeRouter.ts` |
| Input/result formatting (`formatMath`, `toLaTeX`, `SciNotation`) | `src/display.tsx` |
| SETUP number formats, ENG, DMS | `src/format.ts` |
| Key hit-area coordinates | `src/keys.ts` |
| COMP cursor/insert/delete | `src/modes/comp.ts` |
| STAT screens + data editor | `src/modes/stat.tsx` |
| EQN screens + quadratic solver | `src/modes/eqn.tsx` |
| Expression evaluation | `src/evaluator.ts` |
| Mode/type definitions | `src/types.ts` |
| Live/history key chips and recipes | `src/historyKeys.tsx`, `src/historyOps.ts` |
| LCD/cursor/status CSS | `src/index.css` |
| Faceplate bitmap | `src/calculator_new.png` |

LCD paint lives in `lcd.tsx`. Formatting logic stays in `display.tsx`.

---

## Existing elements that are faithful

These are real baseline elements; treat them as starting points to audit, not
rebuild.

| Element | Location | Notes |
|---------|----------|-------|
| LCD shell + dual-line layout | `lcd.tsx` | Input top-left, result bottom-right |
| Status annunciators (S, A, M, STO, RCL, STAT, D/R/G, FIX, SCI) | `lcd.tsx` | Rendered and wired to real state |
| COMP caret + empty-slot boxes | `display.tsx` | `‸` → blinking bar; `⬚` dashed template slots |
| EQN / STAT editor carets | `eqn.tsx`, `stat.tsx` | Active cell shows a caret, not only a shaded box |
| MODE / SETUP / CLR menus | `lcd.tsx`, `modeRouter.ts` | Both SETUP pages render; Deg/Rad/Gra/Fix/Sci/Norm/ab/c/d/c/FREQ work |
| STAT type menu | `stat.tsx` | All 8 types selectable |
| STAT Edit menu | `stat.tsx` | From editor: SHIFT 1 → 1:Type 2:Data 3:Edit; Edit is 1:Ins 2:Del-A |
| hyp menu | `lcd.tsx` | Overlays COMP input line; does not dump “hyp” text |
| EQN quadratic editor | `eqn.tsx` | a/b/c labels, cell caret, bottom-left entry |
| Result forms: fractions, mixed fractions | `display.tsx`, SETUP ab/c vs d/c | d/c and ab/c when applicable |
| Sci ×10ⁿ, ENG, S⇔D toggle | `display.tsx`, `format.ts` | Engineering notation and decimal ↔ fraction |
| Fix/Sci/Norm decimals | `format.ts` | Via `formatForDisplay` / `formatResultNumber` |
| DMS °′″ | `format.ts` | Distinct degree / minute / second glyphs |
| Syntax + Math ERROR | `lcd.tsx`, `modeRouter.ts` | ◀▶ jumps caret to `CalcError.offset` (E-40); AC clears error + expression |
| Variable ERROR / Can’t Solve | `lcd.tsx`, `modeRouter.ts` | SOLVE no-X / Newton miss; same ◀▶ / AC dismiss |
| SOLVE solve for x / x= / L-R= | `lcd.tsx`, `modeRouter.ts` | Confirm screen, then equation + x= + L-R= together |
| Keypad overlay | `Calculator.tsx`, `keys.ts` | Transparent buttons over faceplate PNG |
| ENG / hyp / Abs / Ran# / RanInt# | `modeRouter.ts`, `display.tsx` | No literal ENG/hyp dump; abs is `| |`; Ran# templates |
| Trig / hyp / `ln` / unclosed templates | `display.tsx` | Shared `paintTemplates` table; IR stems never reach the LCD (`vis-no-literal`) |
| ×10ˣ entry | `display.tsx`, `keys.ts` | Condensed `×10` + superscript; caret jumps `×10^(` (`R28`) |
| ∫ template | `display.tsx`, `modes/comp.ts` | Limits on the ∫ glyph; ▶ integrand → lower → upper → after dx → before ∫; ◀ reverses that cycle; ▲/▼ only jump upper↔lower (`R29`) |
| ◀▶ + COMP ▲▼ | `lcd.tsx` | Light from caret navigability and COMP history replay |
| Pol/Rec pair result | `evaluator.ts`, `lcd.tsx`, `display.tsx` | Top-level `=` paints `r=…, θ=…` or bottom-right `x=…, y=…` (`debt-value`) |

---

## Existing elements that need fixing

These already exist in code but are stubbed, mislabeled, or misbehaving.
Ids match [`issues.md`](../issues.md) and [`roadmap.md`](../roadmap.md).

| Id | Existing element | Current state | File |
|----|------------------|---------------|------|
| `ind-hardcoded` / `vis-indicators` | CMPLX, MAT, VCT, Disp | Rendered but hardcoded dim — never light up | `lcd.tsx` |
| `ind-arrows` / `vis-indicators` | ▲/▼ arrows | COMP history replay and EQN result light; STAT editor row-nav does not | `lcd.tsx` |
| `eqn-menu-fallthrough` / `vis-menus` | EQN types 1/2/4 | Menu lists all four; only type 3 (quadratic) works | `eqn.tsx`, `lcd.tsx`, `modeRouter.ts` |
| `dist-empty` / `vis-menus` | Distribution submenu | Menu label exists but opens empty submenu | `stat.tsx` |
| `lying-menus` / `vis-menus` | MODE 2/4/6/7/8 | Listed in MODE menu but silently fall back to COMP | `lcd.tsx`, `modeRouter.ts` |
| `surd-pi-form` / `vis-result` | Surd `n√m` result | Input template exists; no surd result form | `display.tsx` |
| `vis-errors` | Stack / Argument ERROR | Syntax / Math jump landed; these screens still missing | `lcd.tsx` |
| `lineio-display` / `comp-lineio` | MthIO / LineIO | SETUP shows options; not functional | `lcd.tsx`, `modeRouter.ts` |
| `setup-page2` / `vis-menus` | SETUP page 2 | Unit: 1 ab/c 2 d/c 3 CMPLX 4 STAT 5 Disp 6 CONT. Shevon: 1–2 plus STAT as 3 | `lcd.tsx` |
| `prompt-prev-size` / `vis-elements` | SOLVE/CALC previous value | Bottom-right number is 0.7rem / faded; unit uses result size | `lcd.tsx` |

---

## Genuinely missing (add-new, not fix-existing)

| Element | Notes |
|---------|-------|
| LCD history lines | No scrollable prior-calculation lines on LCD; ▲/▼ replaces single input line only. Side pane is an emulator extra. Live Current keys sit in a top strip. |
| Complex `a+bi` in COMP / CMPLX | EQN quadratic paints a+bi; CMPLX mode and COMP complex I/O are not implemented |
| Stack / Argument ERROR | Syntax / Math / Variable / Can’t Solve / Time Out exist; Stack / Argument do not |
| CMPLX / BASE-N / MATRIX / VECTOR / TABLE modes | Listed in MODE menu only; all fall back to COMP |
| Distribution menu body | No distribution UI beyond empty STAT submenu |
| LineIO editing | SETUP page 1 shows options; not functional |

---

## Per-element detail

### 1. LCD display

- **Dual-line (input + answer):** `#input-text` and `#result-text` in
  `lcd.tsx`.
- **History on LCD:** No multi-line history stack. ▲/▼ replay one past entry
  into `currentInput`.
- **Sidebar history pane:** Separate off-device panel, not part of LCD
  faceplate. Live Current keys are a top-of-page strip, not on the LCD.

### 2. Status indicators

Status bar CSS: `index.css`.

| Indicator | Rendered | Active when |
|-----------|----------|-------------|
| S (SHIFT) | Yes | `isShift` |
| A (ALPHA) | Yes | `isAlpha` |
| M | Yes | `vars.M !== 0` |
| STO / RCL | Yes | `isSto` / `isRcl` |
| STAT | Yes | `statType !== null` |
| CMPLX / MAT / VCT | Yes (always dim) | Hardcoded `opacity-10` |
| D / R / G | Yes | `angleMode` |
| FIX / SCI | Yes | `displayFormat.kind` |
| Math | Yes (always active) | Hardcoded |
| ▲ / ▼ | Yes | EQN result scroll **and** COMP history replay |
| Disp | Yes (always dim) | Hardcoded; waits on multi-statement `:` (`comp-colon`) |
| ◀ / ▶ | Yes | COMP caret can still travel left / right |

### 3. Cursor / caret

| Context | Mechanism | Location |
|---------|-----------|----------|
| COMP | `‸` → blinking `.cursor` span | `display.tsx` |
| Template slots | `⬚` dashed `.empty-slot` | `display.tsx` |
| EQN editor | `.active-cell` + caret; bottom-left entry | `eqn.tsx` |
| STAT editor | Active cell caret | `stat.tsx` |

### 4. EQN mode

- Menu: `EqnMenuScreen` — options 1/2/4 display-only; only 3 (quadratic)
  implemented.
- Editor: `EqnQuadScreen` — a/b/c labels, 3-cell grid, caret, bottom-left
  entry via `EqnQuadEntry`.
- Results: label on input line, value on result line; ▲/▼ between roots.
  Negative discriminant paints hardware-style `a+bi` / `a−bi` via `formatComplexPair`.

### 5. STAT mode

- Data editor: three-row LCD window, row index, X, optional Y, optional FREQ
  columns, caret on row 1 at entry.
- FREQ column gated on `statFrequencyEnabled` (SETUP page 2).
- DEL deletes the current data line; SHIFT DEL (INS) inserts a blank line
  (on a blank window Ins stays three 0s).
- SHIFT 1 from the editor shows 1:Type 2:Data 3:Edit; Edit is 1:Ins 2:Del-A.
- Result and submenus work except Dist (empty). Recalling STAT vars jumps to
  COMP.

### 6. Result forms

| Form | Input | Result |
|------|--------|--------|
| Fractions (d/c) | `frac()` template | Yes |
| Mixed fractions (ab/c) | `mix()` template | Yes when SETUP ab/c |
| Surds (n√m) | `root(n,)` / `sqrt()` | No surd result form |
| π | SHIFT+×10ˣ inserts `π` | Decimal unless integer |
| Scientific ×10ⁿ | Boxed `×10^(` paints condensed `×10` + superscript | Yes via `SciNotation` |
| Complex a+bi | No (CMPLX unused) | EQN quadratic only (`formatComplexPair`) |
| Pol/Rec r,θ | `pol(‸` / `rec(‸` (comma typed) | Single line `r=…, θ=…` / bottom-right `x=…, y=…` |
| S⇔D | — | Yes in Norm mode when `showingResult` |
| ENG | — | Yes |
| DMS | ° ′ ″ | Yes |

### 7. Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Syntax ERROR | Yes | ◄/► jumps caret to `offset`, then returns to expression |
| Math ERROR | Yes | Same |
| Variable ERROR | Yes | SOLVE with no X; dismiss, no token jump |
| Can’t Solve | Yes | Newton miss; dismiss, no token jump |
| Stack / Argument ERROR | No | — |
| Jump-to-token | Yes | Syntax / Math only (`debt-source-map`) |

### 8. Keypad behavior

| Key | Dumps literal text? | Behavior |
|-----|---------------------|----------|
| ENG | No | Transforms shown result |
| hyp | No | Opens sinh/cosh/tanh menu |
| SHIFT+hyp (Abs) | No | Abs template with ⬚ slot |
| Ran# (SHIFT+.) | No | Function token, not a raw code fragment |
| RanInt# (ALPHA+.) | No | `RanInt(‸,)` template with ⬚ slots |
| sin / cos / tan / ln | No | Styled function name via the shared template table |

### 9. Current keys / History chips

Chips in the live strip and Show Keys rows use the **same color and
overlay size** as the faceplate keycap (`keys.ts`):

| Family | Keys | Chip |
|--------|------|------|
| Number pad | 0–9, `.`, `+`, `−`, `×`, `÷`, Ans, ×10ˣ, `=` | Gray 68×46, radius 7 |
| DEL / AC | DEL, AC | Lime 66×46; AC slightly stronger |
| Sci row | CALC, hyp, sin, `(`, `)`, √, x², … | Charcoal 57×33, radius 5 |
| SHIFT / ALPHA | SHIFT, ALPHA | Silver circles 41×40 / 43×42; yellow / pink legend |
| Chrome | MODE, ▲▼◀▶ | Silver; overlay width × height |

---

## Summary

Open visual holes on shipped COMP: `prompt-prev-size`.
STAT ▲▼ and dim CMPLX/MAT/VCT/Disp stay on `vis-indicators`. Menu
lies wait on the matching feature (`vis-menus`).

Natural result forms (`n√m`, p/q·π) are `p4-exact`. Pixel-perfect LCD
font waits until Phase 3 is done.
