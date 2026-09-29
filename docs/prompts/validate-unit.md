# Kickoff — unit pairing (form + function)

Copy everything below the line into a **new agent chat**. This chat is
**pairing / verification only**. Do not implement leftovers, Phase 3,
`p4-tauri`, LineIO, or packaging here.

One group per sitting is fine. Finish the open group before starting
the next. Do not overlap groups — each function lives in exactly one.

---

Follow `docs/principles.md`. Sources: `manual.pdf` (the spec),
[`docs/coverage.md`](../coverage.md),
[`docs/visual-fidelity-inventory.md`](../visual-fidelity-inventory.md),
[`issues.md`](../../issues.md),
[`docs/tech-issues.md`](../tech-issues.md).

Ron has the **unit**. The agent drives **Shevon**
(`dist-desktop/Shevon.exe` after `git pull`, or
`npm install` + `npm run dev` → http://localhost:3000). Walk
faceplate keys unless a line says PC keyboard. `manual.pdf` is
gitignored — Ron must have a local copy. G1 already logged
`R30` / `R31`; start at **G2** unless re-checking G1.

For **every** item: check **form** (elements, placement/role, no
literal `ENG` / `hyp` / `abs(` dump) **and** **function** (same key
sequence → same result or error as the unit, to displayed precision).
Pixel-perfect LCD font is out of scope.

Log a new fail once: landed-correctness → `docs/tech-issues.md`
(`R*`); honesty leftover → `issues.md` with an Associated id. Never
both. Do not refile a known leftover listed in the group.

AC between items. Degree unless the line says Rad/Gra. Known session
FIX from an earlier walk is not a packaging bug — reset SETUP if a
format surprises you.

## Do not

- Implement or “quickly fix” in this chat.
- Start Phase 3, `p4-exact`, `p4-tauri`, or LineIO.
- Treat MODE 2/4/6/7/8 fallthrough, SETUP page 2 numbering, LineIO
  chrome, STAT ▲▼ lights, or CALC previous-value size as new work
  (`lying-menus`, `setup-page2`, `lineio-display`, `ind-arrows`,
  `prompt-prev-size`).
- Name the hardware vendor or original model.
- Touch `manual.pdf`.

## Done when (the sitting)

- Each item in the groups you walked is **pass** or **fail** with one
  unit value and one Shevon value (or a form note).
- No calculator code changed.

---

## G1 — Arithmetic and entry

Digits, operators, Ans, scientific entry, replay. Not fractions.

| # | Function | Form | Function (unit = Shevon) |
|---|---------|------|--------------------------|
| 1 | Digits + decimal | Entry bottom-left / input line | `12.5` `=` → 12.5 |
| 2 | `+ − × ÷` | Operators as symbols, not words | `7−3×2` `=` → 1 |
| 3 | `( )` | Parens on the line | `(7−3)×2` `=` → 8 |
| 4 | Unary `(−)` | Minus as negate, not subtract | `(−)` `3` `x²` `=` → −9 (`R15`) |
| 5 | `=` then Ans | Next line can use Ans | `5` `=` then `+` `2` `=` → 7 |
| 6 | DEL | Deletes last token / slot | Type `12`, DEL, `3` `=` → 13 |
| 7 | AC | Clears line; idle result `0` (`R24`) | AC → 0 |
| 8 | `×10ˣ` | Condensed `×10` + superscript; caret in `×10^(` (`R28`) | `2` `×10ˣ` `3` `=` → 2000 |
| 9 | π | SHIFT `×10ˣ` is the π symbol, not “pi” | `2` π `=` matches the unit |
| 10 | e | ALPHA `×10ˣ` is e | e `=` matches the unit |
| 11 | Implicit multiply | `2π`, `2sin` look like the unit | `2` π `=` and `2` sin `30` `=` |
| 12 | COMP history ▲▼ | Replay one past line; result underneath | Two COMP lines, ▲ shows the older |

## G2 — Fractions and display

Templates and result formats. Not powers.

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | `a b/c` | Stacked frac template, not `frac(` | `2` `a b/c` `3` `+` `1` `a b/c` `2` `=` → 7/6 or mixed |
| 2 | Mixed fraction | SHIFT `a b/c` mixed template | Enter a mixed value; `=` |
| 3 | S⇔D | Toggles fraction ↔ decimal | After 7/6, S⇔D → decimal and back |
| 4 | SETUP ab/c vs d/c | Page 2 items **1** / **2** on Shevon | Same value mixed vs improper |
| 5 | Fix | FIX indicator; digit count | SETUP Fix 3; `2÷3` `=` → 0.667 |
| 6 | Sci | SCI indicator | SETUP Sci 3; a wide number matches the unit |
| 7 | Norm 1 / 2 | FIX/SCI off | SETUP Norm; small/large switch vs the unit |
| 8 | ENG / SHIFT ENG | Result exponent steps by 3; not the letters ENG | After a result, ENG then SHIFT ENG |
| 9 | `%` | SHIFT `(`; not a percent template | `200+10%` `=` → 200.1 (`R17`) |
| 10 | Rnd | `Rnd(` template | Under Fix 3, Rnd of a long value matches the unit |
| 11 | ° ′ ″ | Sexagesimal glyphs, not decimals only | Enter DMS; °′″ key toggles |

## G3 — Powers and roots

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | x² | Superscript ² | `5` x² `=` → 25 |
| 2 | x³ | SHIFT x² → ³ | `3` SHIFT x² `=` → 27 |
| 3 | xⁿ | `^( )` / box, caret inside | `2` xⁿ `8` `=` → 256 |
| 4 | After `=` xⁿ | `Ans^(‸)` (`R9`) | `9` `=` then xⁿ `2` `=` → 81 |
| 5 | √ | Radical template | √ `9` `=` → 3 |
| 6 | ³√ | SHIFT √ | ³√ `8` `=` → 2 |
| 7 | ⁿ√ | SHIFT xⁿ | ³√-style nth root of 32 → 2 (root 5) |
| 8 | x⁻¹ | Superscript −1 | `4` x⁻¹ `=` → 1/4 or 0.25 |
| 9 | Odd root of negative | Real, not Math ERROR (`R5`) | ³√ `(−)8` `=` → −2 |

## G4 — Logs and exponentials

π / e already walked in G1. log(a,b) LineIO comma form is `comp-lineio` — skip.

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | log | log template, not `log10(` | log `100` `=` → 2 |
| 2 | ln | ln template | ln `e` `=` → 1 |
| 3 | log□ | log_b template (base box) | log base 2 of 8 `=` → 3 |
| 4 | 10^ | SHIFT log; 10^ template | 10^ `3` `=` → 1000 |
| 5 | e^ | SHIFT ln; e^ template | e^ `0` `=` → 1 |

## G5 — Trigonometry and hyperbolic

Abs lives here (SHIFT hyp). °′″ already walked in G2. DRG conversions
(SHIFT DRG) are Missing — honesty in G13, not here.

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | Deg | D indicator | SETUP 3; sin `30` `=` → 0.5 |
| 2 | Rad | R indicator | SETUP 4; sin of π/6 `=` → 0.5 |
| 3 | Gra | G indicator | SETUP 5; sin `50` `=` → 0.5 (unit) |
| 4 | sin / cos / tan | sin( cos( tan( templates | Deg: cos `60` `=` → 0.5; tan `45` `=` → 1 |
| 5 | sin⁻¹ cos⁻¹ tan⁻¹ | Inverse templates, not `asin(` | Deg: sin⁻¹ `0.5` `=` → 30 |
| 6 | tan poles | Math ERROR, not a huge number (`R1`) | Deg: tan `90` `=` |
| 7 | hyp menu | Overlay menu; not the letters hyp | SHIFT or key → sinh/cosh/tanh rows |
| 8 | sinh cosh tanh | After hyp pick, templates | Pick one pair and match the unit |
| 9 | sinh⁻¹ cosh⁻¹ tanh⁻¹ | Inverse hyp templates | One inverse vs the unit |
| 10 | Abs | `| |` template, not `abs(` | Abs `(−)7` `=` → 7 |

## G6 — Combinatorics and random

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | x! | After SHIFT x⁻¹; not `!` dumped as text if the unit uses a postfix | `5` x! `=` → 120 |
| 2 | n! reject | Math ERROR on 1.5 and −1 (`R6`) | Two tries |
| 3 | nPr | SHIFT × wraps | `5` nPr `2` `=` → 20 |
| 4 | nCr | SHIFT ÷ wraps | `5` nCr `2` `=` → 10 |
| 5 | nPr / nCr reject | Non-integer / negative → Math ERROR | One bad nCr |
| 6 | Ran# | Ran# template | Two presses; values in [0,1) |
| 7 | RanInt# | RanInt template | RanInt#(1,6) is an integer 1–6 |

Factorial above 69 is `fact-max` / `comp-range` — if 70! works here and
errors on the unit, log only if not already open.

## G7 — Calculus templates

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | ∫ paint | Limits on the ∫ glyph (`R29`) | Insert ∫; do not dump `int(` |
| 2 | ∫ caret | ▶ integrand → lower → upper → after dx → before ∫; ◀ reverses; ▲/▼ upper↔lower only | Walk once on an empty template |
| 3 | ∫ value | Same sample as the unit (manual E-15 style) | Match displayed result or Time Out |
| 4 | d/dx | Derivative template, not `diff(` | d/dx of X² at 3 → 6 |
| 5 | Σ | Σ template | Σ of X from 1 to 5 → 15 |

Σ ±1e10 / nest bans are `sigma-bounds` — do not refile.

## G8 — Polar and rectangular

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | Pol | SHIFT `+`; `r=…, θ=…` on `=` (`debt-value`) | Deg: Pol(1,1) matches the unit |
| 2 | Rec | SHIFT `−`; bottom-right `x=…, y=…` | Rec of that r,θ back to 1, 1 |
| 3 | Writes X,Y | RCL X / Y after Pol/Rec (`R16`) | Same letters as the unit |

## G9 — Memory

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | STO | Standby then letter; `5→C` if no `=` first | `5` STO ALPHA C |
| 2 | RCL | Recall standby | RCL C → 5 |
| 3 | A–F | ALPHA on (−) / °′″ / hyp / sin / cos / tan | Store and recall two letters |
| 4 | X / Y | `)` is X; S⇔D is Y (ALPHA) | STO X, RCL X |
| 5 | M+ | M indicator lights | `4` M+ ; M on; RCL M → 4 |
| 6 | M− | SHIFT M+ | `1` M− ; RCL M → 3 |
| 7 | CLR Memory | SHIFT 9 → 2 | Letters / M / Ans cleared as on the unit |
| 8 | CLR Setup | SHIFT 9 → 1 | Angle / Fix back to defaults as on the unit |
| 9 | CLR All | SHIFT 9 → 3 | Full reset vs the unit |

STAT fit letters must not clobber COMP A/B (`R3`) — that walk is G11.

## G10 — CALC and SOLVE

Previous-value **size** is `prompt-prev-size` (known). Still check it
is present and the **value** matches.

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | CALC letters | `A?` (and friends); previous value bottom-right | `3A+B` CALC; A=5 B=10 → 25 |
| 2 | CALC not stems | cos(30) CALC does **not** prompt C? | |
| 3 | CALC re-prompt | CALC after `=` asks again | Same 3A+B |
| 4 | CALC assignment | `Y=X²+X+3` stores Y, not Newton | Matches E-19 |
| 5 | SOLVE confirm | “solve for x” then equation + x= + L−R= | `Y=X+10`, Y=12 → x=2 |
| 6 | SOLVE Continue? | Continue works | |
| 7 | Variable ERROR | SHIFT CALC on `2+2` | |
| 8 | Can’t Solve | SHIFT CALC on `abs(X)+1=0` | |
| 9 | Empty vs 0 | Prompt `0` stores 0; empty keeps previous (`R7`) | |

## G11 — STAT

FREQ ON via SETUP page 2 **3** on Shevon (unit uses **4** — `setup-page2`).

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | Type menu | MODE 3; eight types listed | Each type **opens** an editor (not COMP) |
| 2 | 1-VAR editor | Grid, caret, bottom-left entry | Two X values; SHIFT 1 Var `x̄` / `n` match the unit |
| 3 | A+BX | X,Y columns | Two points; A, B, r match |
| 4 | _+CX² | Quadratic editor | Two/three points; A B C vs unit (r extra is backlog) |
| 5 | ln / e / A·B^X / A·X^B / 1/X | Editor for that type | One short fit; one recall matches |
| 6 | FREQ | Weight column; first digit **replaces** (`R14`) | X=2 FREQ=5 → n=5, x̄=2 |
| 7 | DEL line | Deletes the row, not one digit | |
| 8 | Ins / Del-A | SHIFT 1 → Edit | Ins a row; Del-A clears data |
| 9 | Sum / Var / MinMax | SHIFT 1 menus insert symbols | One Sum, one MinMax vs the unit |
| 10 | Reg + hats | A B r; x̂ ŷ | Invalid hat → Math ERROR (`R18`) |
| 11 | Dist | 1-VAR only: P( Q( R( `'t` | E-25 Fix 3: `3't` / `P(t)` → −0.762 / 0.223 |
| 12 | Dist hidden | On A+BX, Dist is not a 1-VAR list | |
| 13 | Stay in STAT | Recall stays STAT; STAT lit (`p2-stat-mode`) | |
| 14 | Overlays | CALC / hyp / SOLVE do not cover the grid (`R12`) | |
| 15 | AC from STAT | COMP; STAT off (`R13`) | |

STAT ▲▼ lights (`ind-arrows`) — note only.

## G12 — EQN

| # | Function | Form | Function |
|---|---------|------|----------|
| 1 | EQN menu | MODE 5; types 1–4 | Each type opens its editor |
| 2 | 2-unk | an/bn/cn; bottom-left; ▲▼ X,Y | 1,2,3 / 2,3,4 → X=−1 Y=2 |
| 3 | 3-unk | an/bn/cn/dn; X,Y,Z | E-28 sample → 1, 2, 3 |
| 4 | Quadratic | a/b/c labels; caret; real and a+bi | a=1 b=0 c=−1 real; a=1 b=0 c=1 a+bi |
| 5 | Cubic | a/b/c/d; X1 X2 X3 | 1, −2, −1, 2 → −1, 2, 1 |
| 6 | Singular / a=0 | Math ERROR (`R19`) | 2-unk singular; cubic a=0 |
| 7 | Overlays / AC | No CALC/hyp over editor; AC clears (`R12` `R13`) | |

Exact √ / surd results are `p4-exact` — decimal vs unit exact form is
not a new bug.

## G13 — Honesty (do not implement)

These must **not** silently look like COMP success. Known policy:
leave the lie until the feature ships, unless you see a **new** lie.

| # | What | Expected tonight |
|---|------|------------------|
| 1 | MODE 2 CMPLX | Listed; does not run CMPLX (`lying-menus`) |
| 2 | MODE 4 BASE-N | Same |
| 3 | MODE 6 MATRIX | Same |
| 4 | MODE 7 TABLE | Same |
| 5 | MODE 8 VECTOR | Same |
| 6 | SETUP page 2 | Shevon: 1 ab/c 2 d/c 3 STAT. Unit: 1–6 including CMPLX Disp CONT (`setup-page2`) |
| 7 | MthIO / LineIO | Listed; no input-mode change (`lineio-display`) |
| 8 | SHIFT 7 CONST | No 01–40 catalog |
| 9 | SHIFT 8 CONV | No conversions |
| 10 | SHIFT DRG | No ° r g menu (`comp-drg`) |

## G14 — Emulator extras (optional, not vs the unit)

Do not score these against the hardware face.

| # | What | Check |
|---|------|--------|
| 1 | Overlay hitboxes | Keys land on the art |
| 2 | Show keys strip | Physical-key chips; X is ALPHA `)` |
| 3 | History pane Load | Loads COMP; clears overlays (`R26`) |
| 4 | Exe chrome | Frameless; Show keys / History off the face; Pin; `sin(30)` → 0.5 |

---

## How to run the evening

1. Open this file and the unit. Start Shevon.
2. Pick **one** group (G1–G13). Tell the agent the group id.
3. Walk every row. Agent records a three-column log: item, form
   pass/fail, function (unit → Shevon).
4. Stop at the end of the group. Next group is a new sitting or the
   same chat with “G2 next”.
5. Launch from [Validate](../../canvases/validate.canvas.tsx) if you
   want a group-scoped chat.
