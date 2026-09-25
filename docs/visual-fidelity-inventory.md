# Visual fidelity inventory

Inventory of which visual/UI elements currently exist in the Casio fx-991ES
PLUS emulator, mapped against the roadmap’s “fix existing vs. add missing”
split.

**Source of truth** for the LCD audit. Principles:
[`principles.md`](principles.md). Scheduled `vis-*` work:
[`roadmap.md`](../roadmap.md). Defects: [`issues.md`](../issues.md).

Refreshed 24 Sep 2026 from the roadmap, tests (84), and a codebase pass. If
this file disagrees with `roadmap.md` on what is scheduled, follow the roadmap.

## Key source files

| Role | Path |
|------|------|
| Entry re-export | `src/App.tsx` → `Calculator.tsx` |
| Main shell: LCD, keypad overlay, state, routing | `src/Calculator.tsx` |
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

There is no separate `Display.tsx` component — the LCD is JSX inline in
`Calculator.tsx`, with formatting logic in `display.tsx`.

---

## Existing elements that are faithful

These are real baseline elements; treat them as starting points to audit, not
rebuild.

| Element | Location | Notes |
|---------|----------|-------|
| LCD shell + dual-line layout | `Calculator.tsx` | Input top-left, result bottom-right |
| Status annunciators (S, A, M, STO, RCL, STAT, D/R/G, FIX, SCI) | `Calculator.tsx` | Rendered and wired to real state |
| COMP caret + empty-slot boxes | `display.tsx` | `‸` → blinking bar; `⬚` dashed template slots |
| EQN / STAT editor carets | `eqn.tsx`, `stat.tsx` | Active cell shows a caret, not only a shaded box |
| MODE / SETUP / CLR menus | `Calculator.tsx` | Both SETUP pages render; Deg/Rad/Gra/Fix/Sci/Norm/ab/c/d/c/FREQ work |
| STAT type menu | `stat.tsx` | All 8 types selectable |
| hyp menu | `Calculator.tsx` | Overlays COMP input line; does not dump “hyp” text |
| EQN quadratic editor | `eqn.tsx` | a/b/c labels, cell caret, bottom-left entry |
| Result forms: fractions, mixed fractions | `display.tsx`, SETUP ab/c vs d/c | d/c and ab/c when applicable |
| Sci ×10ⁿ, ENG, S⇔D toggle | `display.tsx`, `format.ts` | Engineering notation and decimal ↔ fraction |
| Fix/Sci/Norm decimals | `format.ts` | Via `formatForDisplay` / `formatResultNumber` |
| DMS °′″ | `format.ts` | Distinct degree / minute / second glyphs |
| Syntax + Math ERROR | `Calculator.tsx` | ◄/► dismisses error and returns to expression |
| Variable ERROR / Can’t Solve | `Calculator.tsx` | SOLVE no-X / Newton miss; same ◀▶ / AC dismiss |
| SOLVE solve for x / x= / L-R= | `Calculator.tsx` | Confirm screen, then equation + x= + L-R= together |
| Keypad overlay | `Calculator.tsx`, `keys.ts` | Transparent buttons over faceplate PNG |
| ENG / hyp / Abs / Ran# / RanInt# | `Calculator.tsx`, `display.tsx` | No literal ENG/hyp dump; abs is `| |`; Ran# templates |
| Trig / hyp / `ln` / unclosed templates | `display.tsx` | Shared `paintTemplates` table; IR stems never reach the LCD (`vis-no-literal`) |
| ◀▶ + COMP ▲▼ | `Calculator.tsx` | Light from caret navigability and COMP history replay |

---

## Existing elements that need fixing

These already exist in code but are stubbed, mislabeled, or misbehaving.
Ids match [`issues.md`](../issues.md) and [`roadmap.md`](../roadmap.md).

| Id | Existing element | Current state | File |
|----|------------------|---------------|------|
| `ind-hardcoded` / `vis-indicators` | CMPLX, MAT, VCT, Disp | Rendered but hardcoded dim — never light up | `Calculator.tsx` |
| `ind-arrows` / `vis-indicators` | ▲/▼ arrows | COMP history replay and EQN result light; STAT editor row-nav does not | `Calculator.tsx` |
| `eqn-menu-fallthrough` / `vis-menus` | EQN types 1/2/4 | Menu lists all four; only type 3 (quadratic) works | `eqn.tsx`, `Calculator.tsx` |
| `dist-empty` / `vis-menus` | Distribution submenu | Menu label exists but opens empty submenu | `stat.tsx` |
| `lying-menus` / `vis-menus` | MODE 2/4/6/7/8 | Listed in MODE menu but silently fall back to COMP | `Calculator.tsx` |
| `surd-pi-form` / `vis-result` | Surd `n√m` result | Input template exists; no surd result form | `display.tsx` |
| `pol-rec-line` / `vis-result` | Pol/Rec dual-line r,θ | Input templates exist; returns single scalar | `evaluator.ts` |
| `err-jump` / `vis-errors` | Error ◀▶ | Dismisses only; no jump-to-token | `Calculator.tsx` |
| `lineio-display` / `comp-lineio` | MthIO / LineIO | SETUP shows options; not functional | `Calculator.tsx` |

---

## Genuinely missing (add-new, not fix-existing)

| Element | Notes |
|---------|-------|
| LCD history lines | No scrollable prior-calculation lines on LCD; ▲/▼ replaces single input line only. Side pane is an emulator extra. Live Current keys sit in a top strip. |
| Complex `a+bi` in COMP / CMPLX | EQN quadratic paints a+bi; CMPLX mode and COMP complex I/O are not implemented |
| Stack / Argument ERROR | Syntax / Math / Variable / Can’t Solve exist; Stack / Argument / Time Out do not |
| Error jump-to-token | ◄/► clears error state only |
| CMPLX / BASE-N / MATRIX / VECTOR / TABLE modes | Listed in MODE menu only; all fall back to COMP |
| Distribution menu body | No distribution UI beyond empty STAT submenu |
| LineIO editing | SETUP page 1 shows options; not functional |

---

## Per-element detail

### 1. LCD display

- **Dual-line (input + answer):** `#input-text` and `#result-text` in
  `Calculator.tsx`.
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
  Negative discriminant paints Casio-style `a+bi` / `a−bi` via `formatComplexPair`.

### 5. STAT mode

- Data editor: row index, X, optional Y, optional FREQ columns, caret.
- FREQ column gated on `statFrequencyEnabled` (SETUP page 2).
- Result and submenus work except Dist (empty). Recalling STAT vars jumps to
  COMP.

### 6. Result forms

| Form | Input | Result |
|------|--------|--------|
| Fractions (d/c) | `frac()` template | Yes |
| Mixed fractions (ab/c) | `mix()` template | Yes when SETUP ab/c |
| Surds (n√m) | `root(n,)` / `sqrt()` | No surd result form |
| π | SHIFT+×10ˣ inserts `π` | Decimal unless integer |
| Scientific ×10ⁿ | Raw `×10^` text | Yes via `SciNotation` |
| Complex a+bi | No (CMPLX unused) | EQN quadratic only (`formatComplexPair`) |
| Pol/Rec r,θ | `pol(‸,)` / `rec(‸,)` templates | Single scalar only |
| S⇔D | — | Yes in Norm mode when `showingResult` |
| ENG | — | Yes |
| DMS | ° ′ ″ | Yes |

### 7. Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Syntax ERROR | Yes | ◄/► clears `lcdError`, returns to expression |
| Math ERROR | Yes | Same |
| Variable ERROR | Yes | SOLVE with no X; same dismiss |
| Can’t Solve | Yes | Newton miss; same dismiss |
| Stack / Argument ERROR | No | — |
| Jump-to-token | No | — |

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

Most remaining visual-fidelity work is on elements that already exist —
STAT ▲▼ lighting, hardcoded-dim CMPLX/MAT/VCT/Disp, making listed menu
options honest or real, and jump-to-token errors. `vis-no-literal` has
landed (shared LCD/History template table). The pure “add missing” list is
shorter and mostly Phase 3 modes plus Dist / LineIO.

Natural result forms (`n√m`, p/q·π) and the full PDF regression suite land in
Phase 4. Pixel-perfect LCD font is out of scope until Phase 3 is done.
