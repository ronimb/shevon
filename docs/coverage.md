# Casio fx-991ES PLUS coverage

Feature-by-feature map of the official user guide against the emulator.
**Source of truth** for coverage status. The coverage canvas is a view of
this file — refresh it when statuses change.

Status is about **behavior**, not whether a menu label exists.

| Status | Meaning |
|--------|---------|
| Done | User can perform the Casio operation from the overlay keys and get a plausible result |
| Partial | Menu, evaluator helper, or a subset exists, but the Casio procedure is incomplete or wrong |
| Missing | MODE/SETUP row is decorative, or the key is a no-op / literal text dump |

Scheduled work: [`roadmap.md`](../roadmap.md). Defects: [`issues.md`](../issues.md).
Refreshed 25 Sep 2026 from the roadmap (`debt-value` landed), tests, and a code pass.

---

## Summary

| Status | Count |
|--------|------:|
| Done | 37 |
| Partial | 15 |
| Missing | 24 |
| **Total** | **76** |

COMP, STAT, and EQN carry almost all of the working product. CMPLX, BASE-N,
MATRIX, TABLE, VECTOR, CONST, and CONV are menu chrome only.

---

## Modes

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| COMP | E-5 N1 | Done | Default `calcMode`; full expression path | Several COMP leftovers still open |
| CMPLX | E-5 N2 | Missing | Menu row only; CMPLX indicator always dim | No i, ∠, arg, Conjg, or polar/rect format |
| STAT | E-5 N3, E-22 | Partial | Type menu, editor, Sum/Var/MinMax/Reg, FREQ | Dist, Ins/Del-A, STAT stays active on recall |
| BASE-N | E-5 N4, E-26 | Missing | Menu row; selecting 4 returns to COMP | DEC/HEX/BIN/OCT, and/or/xor/xnor, Not, Neg |
| EQN | E-5 N5, E-28 | Partial | Menu shown; quadratic editor + real and complex roots | 2-unk, 3-unk, cubic |
| MATRIX | E-5 N6, E-29 | Missing | Menu row only | MatA/B/C, Dim, det, Trn, inverse, MatAns |
| TABLE | E-5 N7, E-32 | Missing | Menu row only | f(x), Start/End/Step, 30-row cap, Insufficient MEM |
| VECTOR | E-5 N8, E-33 | Missing | Menu row only | VctA/B/C, dot, cross, Abs, VctAns |

## Setup

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| MthIO / LineIO | E-5 1/2 | Partial | Always Math indicator; natural HTML input | LineIO, overwrite cursor, INS toggle |
| Deg / Rad / Gra | E-6 3/4/5 | Done | SETUP 3–5; D/R/G status; trig uses `angleMode` | — |
| Fix / Sci / Norm | E-6 6/7/8 | Done | Digit count, rounding, Norm 1 vs 2; FIX/SCI indicators | — |
| Display digits | E-38 | Done | Driven by Fix/Sci/Norm (Norm 1 uses 1e-2) | — |
| ab/c vs d/c | E-6 c1/c2 | Done | SETUP page 2; mixed vs improper results | — |
| STAT FREQ ON/OFF | E-6 c4 | Done | SETUP page 2; 80/40/26 row caps | — |
| Dot / Comma | E-6 c5 | Missing | Always dot | Result decimal separator |
| Contrast | E-3, E-6 c6 | Missing | Not applicable to photo LCD | Skip (roadmap out of scope) |

## Input

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| Natural templates | E-8 | Done | frac, mix, sqrt, pwr, int, diff, Σ, log_b, abs… | Height/nesting limits not enforced (backlog) |
| INS wrap-as-argument | E-9 | Partial | frac/nPr/root wrap preceding operand | No general SHIFT DEL (INS) for arbitrary functions |
| 99-byte input limit | E-7 | Missing | Unlimited string | Cursor-k warning at 10 bytes remaining |
| Implicit multiply | E-7 | Partial | Regex after rewrite: 2π, 2sin, )( | Edge cases vs Casio priority (omitted × is 7th) |
| Priority sequence | E-8 | Partial | Parser `**` / `*` / `+` after template rewrite | Unary minus vs x², metric/STAT postfix, AND/OR |
| Percent | E-11 SHIFT ( | Done | SHIFT ( inserts % → /100 | Confirm Casio percent-of semantics on +/− (backlog) |
| Sexagesimal ° ′ ″ | E-11 | Done | Input and result use ° ′ ″; °′″ key toggle | — |
| Multi-statements : | E-11 ALPHA 7 | Missing | ALPHA CALC inserts = | Colon chain + Disp indicator |
| Engineering notation | E-11 ENG | Done | ENG / SHIFT ENG shift the displayed result | — |
| Calculation history replay | E-12 | Done | LCD ▲/▼ replay; live Current keys strip; side pane extra | Remaining A–F / M keyboard-shortcut audit (`hist-letters`) |

## Memory

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| Ans | E-12 | Done | `ans` state; persisted localStorage | — |
| Variables A–F, X, Y | E-13 | Done | ALPHA + keys; STO/RCL; persisted | RCL A/B/C NaN overlay fixed; `5` STO letter without `=` shows `5→C` |
| Independent M | E-13 | Done | M+ / SHIFT M−; M indicator | — |
| CLR Setup / Memory / All | E-2, E-13 | Done | SHIFT 9 CLR menu: 1:Setup 2:Memory 3:All | — |

## Functions

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| π and e | E-13 | Done | SHIFT EXP → π; ALPHA EXP → e | Display vs 15-digit internal values (backlog) |
| sin cos tan + inverse | E-13 | Done | Keys + SHIFT; angleMode conversion | Input-range Math ERROR from E-38 |
| Hyperbolic menu | E-13 hyp | Done | Overlay menu; evaluator sinh…atanh | — |
| Abs | E-15 SHIFT hyp | Done | SHIFT hyp inserts Abs template | — |
| ° r g conversions | E-14 SHIFT DRG | Missing | None | 1G(DRG′) menu |
| 10^ and e^ | E-14 | Done | SHIFT log / SHIFT ln templates | — |
| log, log_b, ln | E-14 | Done | log10, log_b, ln templates | LineIO log(a,b) comma form |
| x² x³ x^ √ ³√ x⁻¹ | E-14 | Done | sqr, cube, ^, sqrt, root, SHIFT x⁻¹ | Consecutive x² ignored on Casio (backlog) |
| ∫ integration | E-14, E-15 | Done | Adaptive Gauss–Kronrod (G7–K15) | Time Out Error; COMP-only rule (backlog) |
| d/dx derivative | E-14 | Done | Central difference + Richardson | Time Out |
| Σ summation | E-14 | Partial | Integer loop; end capped at start+1000 | ±1e10 bounds; nested Pol/∫/d/dx/Σ ban |
| Pol / Rec | E-14 | Done | SHIFT + / −; writes X,Y; `Pol(` / `Rec(` (no built-in comma); `=` paints `r=…, θ=…` or bottom-right `x=…, y=…` | Nested Pol/Rec still a scalar (primary r or X) |
| x! | E-15 | Done | SHIFT x⁻¹; factorial() | Casio max 69; we allow 170 |
| Ran# / RanInt# | E-15 | Done | SHIFT . and ALPHA . wired; templates | — |
| nPr / nCr | E-18 | Done | SHIFT × / ÷ wrap operand | Range checks from E-39 |
| Rnd | E-15 | Done | Respects current Fix/Sci/Norm | — |

## CALC / SOLVE

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| CALC | E-19 | Partial | Prompts every A–F/M/X/Y in the expression | Casio CALC UX, equalities, Linear input during prompt |
| SOLVE | E-20 SHIFT CALC | Done | Prompts other letters; “solve for x”; Newton 40 steps; equation + x= + L-R=; Continue; Variable ERROR / Can’t Solve | Unshifted CALC UX is `comp-calc` |

## STAT

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| Eight calculation types | E-22 | Done | 1-VAR through 1/X; linear transforms + quadratic Cramer's | Quadratic r vs Casio A B C m1 m2 n (backlog) |
| Stat Editor | E-23 | Partial | Grid, caret, FREQ, = advances cell, row caps | Ins; Del-A; DEL should delete the line |
| FREQ column | E-23 | Done | SETUP STAT ON; 80/40/26 caps | — |
| Sum / Var / MinMax | E-23 | Done | SHIFT 1 STAT menu; inserts symbols | On Casio you recall while STAT stays active |
| Reg + estimates | E-24 | Done | A B r C; __yhat __xhat __xhat1/2 | Quadratic r not shown (Casio uses A B C m1 m2 n) |
| Normal Dist P Q R 't | E-25 | Missing | Dist appears on STAT_RESULT; submenu empty | Standard normal probabilities |

## EQN

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| 2-unknown linear | E-28 1 | Missing | Menu text only | Coefficient editor + X,Y solutions |
| 3-unknown linear | E-28 2 | Missing | Menu text only | X,Y,Z |
| Quadratic | E-28 3 | Done | a,b,c labels; caret; bottom-left entry; real and a+bi roots; ▲▼ | Exact √ form of complex roots is `p4-exact` |
| Cubic | E-28 4 | Missing | Menu text only | Up to three real/complex roots |

## CMPLX / BASE-N / MATRIX / TABLE / VECTOR / Constants

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| a+bi and r∠θ I/O | E-18 | Missing | i / ∠ unused | Full CMPLX mode |
| arg / Conjg / format cmds | E-19 | Missing | None | SHIFT 2 CMPLX menu |
| DEC HEX BIN OCT | E-26 | Missing | None | 16-bit bin / 32-bit others; integer-only |
| Logic and Neg | E-27 | Missing | None | and or xor xnor Not Neg; d/h/b/o prefixes |
| MatA/B/C up to 3×3 | E-29 | Missing | None | Editor, scalar, det, Trn, inverse, Abs, powers |
| f(x) number table | E-32 | Missing | None | Start End Step; X overwritten; Insufficient MEM |
| 2D/3D VctA/B/C | E-33 | Missing | None | Add, scalar, dot, cross, Abs, angle example |
| 40 scientific constants | E-35 SHIFT 7 | Missing | None | CODATA 2007 two-digit catalog |
| 40 metric conversions | E-37 SHIFT 8 | Missing | None | NIST SP 811 pairs; banned in BASE-N and TABLE |

## Errors

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| Math ERROR / Syntax ERROR | E-40 | Partial | LCD strings; NaN/Infinity → Math ERROR; ◀▶ jumps to `CalcError.offset` | AC already clears the expression; Stack / Argument screens still missing |
| Stack / Argument / Dimension | E-40 | Missing | None | Needed once MATRIX/VECTOR/deep nests exist |
| Variable / Can’t Solve / Time Out | E-41 | Partial | Variable ERROR and Can’t Solve via `CalcError` | Time Out for slow ∫ / d/dx (backlog) |
| Calculation range ±1×10^99 | E-38 | Partial | Overflow beyond ±10¹⁰⁰ raises Math ERROR | Per-function ranges from E-38–39; factorial 69 |

## Platform (emulator extras)

| Feature | Manual | Status | In the emulator | Gap |
|---------|--------|--------|-----------------|-----|
| Photo overlay + hitboxes | — | Done | Absolute keys; triple-click calibration; `calculator_new.png` | — |
| PC keyboard | — | Partial | Enter, arrows, Shift/Alt, comma (SHIFT )), S/C/T/L/R/Q/A, X/Y vars | Letter keys steal typing; Shift hold vs overlay toggle |
| History / LaTeX pane | — | Done | 50 items, Load, physical-key Show Keys; STO / MODE / SETUP actions | Not Casio behavior; keep as extra. Live Current keys strip is on top |
| Electron + Pages + PWA | — | Partial | Scripts and workflow present | Verify portable exe, Pages deploy, and PWA install end-to-end |
| Tests | E-16 examples | Partial | Golden + parser + CalcValue (101 after debt-value) | Remaining numbered sample operations in the PDF |

---

## COMP key map (already wired)

SHIFT and ALPHA are latched toggles on the overlay (momentary hold on the PC
keyboard). After a shifted function the emulator usually clears SHIFT. Closing
parentheses of sin/log-style functions can be omitted at `=` the same way Casio
does.

| Key | Normal | SHIFT | ALPHA |
|-----|--------|-------|-------|
| CALC (top-left) | CALC prompts | SOLVE for X | inserts = |
| ∫ | int(f, a, b, x) | d/dx template | — |
| x⁻¹ | ^-1 | x! | — |
| log□ | log_b | Σ (defaults 0..10) | — |
| a b/c | frac wrap | mixed fraction | — |
| √ | sqrt | cube root | — |
| x² | ² | ³ | — |
| xⁿ | ^( ) or pwr | nth root | — |
| log / ln | log10 / ln | 10^ / e^ | — |
| (-) °′″ hyp | unary − / °′″ / hyp menu | Abs | A / B / C |
| sin cos tan | trig( | inverse | D / E / F |
| RCL | recall standby | STO standby | — |
| ENG | engineering-shift result | SHIFT ENG other direction | — |
| ( ) | ( ) | %  , | ) is also X |
| S⇔D | fraction ↔ decimal | — | Y |
| M+ | add to M | M− | M |
| × ÷ | multiply divide | nPr nCr | — |
| + − | add subtract | Pol Rec | — |
| ×10ˣ | scientific exp | π | e |
| MODE | mode menu | SETUP | — |
| 1 (in STAT) | digit | STAT result menu | — |

## Evaluator internals

Internal form is a string with a `‸` cursor. Templates look like `frac(1,2)`,
`int(ln(X),1,e,x)`, `Σ(X+1,x,1,5)`. The evaluator lowers the template IR to a
canonical form, `src/parser.ts` tokenizes and parses it into a typed AST, and
the evaluator walks that AST — no `new Function`, no code generation.

Integration is adaptive Gauss–Kronrod (G7–K15). Differentiation is a central
difference with Richardson extrapolation. STAT regressions for non-linear
types are linearized with log/reciprocal transforms. Quadratic STAT uses
Cramer's rule on the 3×3 normal equations.

Results use a 10-digit budget or scientific mantissa×10^n. S⇔D shows a
fraction only when the value is an exact p/q (not a nearby guess). Surd/π
forms are `p4-exact`. π÷6 will not show as (1/6)π until then.
