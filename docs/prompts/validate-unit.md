# Kickoff — unit pairing (form + function)

Copy everything below the line into a **new agent chat**. This chat is
**pairing / verification only**. Do not implement leftovers, Phase 3,
`p4-tauri`, LineIO, or packaging here.

One group per sitting is fine. Finish the open group before starting
the next. Do not overlap groups — each function lives in exactly one.

### Workflow (persisted — two phases)

Do **not** collapse these into one chat.

1. **Validation session** (this kickoff) — walk one group with Ron.
   Guide + scribe only. Log new fails to `docs/tech-issues.md`
   (`R*`) or `issues.md` (honesty / extras, with Associated id).
   Never both for the same defect. **No calculator code changes.**
2. **Issue resolution** (separate chat) — after the sitting (or after
   a cluster of related fails), supervisor routes fixes into
   `roadmap.md` **Now** or a one-id kickoff. Implementation chat
   copies that kickoff, lands the fix, runs
   [`sanity-landed.md`](sanity-landed.md) when required, closes the
   matching `R*` / issue row.
3. **Re-check** (optional next validation sitting) — re-walk only the
   rows that failed, or continue the next group. Do not start fixing
   mid-group because a fail showed up.

Order for the current program: finish **G1** → resolution chat
[`g1-resolve.md`](g1-resolve.md) (`R31` `R32` `R34`–`R37` +
`prompt-prev-size`) → validation sitting **G14** /
implementation `show-keys-size` → resume **G2**–G13. Pairing never
jumps the queue; fixes never land inside pairing.

---

Follow `docs/principles.md`. Sources: `manual.pdf` (the spec),
[`docs/coverage.md`](../coverage.md),
[`docs/visual-fidelity-inventory.md`](../visual-fidelity-inventory.md),
[`issues.md`](../../issues.md),
[`docs/tech-issues.md`](../tech-issues.md).

Ron has the **unit** and runs **Shevon** (exe or
`http://localhost:3000`). The agent is a **guide and scribe**:
name the next row, tell Ron exactly what to press and what to
compare, wait for his reports, log pass/fail. `manual.pdf` is
gitignored — Ron must have a local copy. G1 already logged `R30` / `R31`; start at **G2** unless re-checking
G1. (`R30` closed on re-check — unit also paints 25/2.) After **G1
wraps**, the next pairing sitting walks **G14** (Show keys size —
`show-keys-size`) before continuing G2–G13. That chrome fix is
scheduled after `p4-tauri` and **before Phase 3**.

### Default: guide only (no browser driving)

Do **not** open, lock, click, CDP, or script Shevon in the browser
(or the exe). Do not spend tokens mapping hitboxes or pressing keys.
Ron does both devices. The agent only coaches and records.

**Exception:** drive Shevon in the browser only if Ron explicitly
asks in that chat (e.g. “you drive Shevon” / “press it for me”).
Even then, follow **Cadence** — never before his unit report for
that row.

### Cadence (mandatory — one item at a time)

1. Agent names the row (group + #), the key sequence, and what to
   check for form. **Stop.**
2. Ron runs it on the **unit** and reports form + result (or error).
3. Agent tells Ron the same sequence on **Shevon** (unless he already
   did both). Ron reports Shevon form + result.
4. Compare: form pass/fail + unit value → Shevon value. Log if new.
5. AC on both. Next row.

Never batch rows, never “pre-drive” Shevon, never score a row from
Shevon alone or from memory of the manual. No unit report → do not
ask for (or drive) Shevon for that row.

For **every** item: check **form** (elements, placement/role,
glyphs/templates, chrome) **and** **function** (same key sequence →
same result or error as the unit, to displayed precision).

### Form includes visuals (log them)

**Form is not only “is it a π / not the letters pi.”** When Ron (or
the photo) shows a **noticeable** visual mismatch vs the unit, treat
it as a form **fail** and log an `R*` — even if the value is right
and the symbol class is right. Examples that **must** be logged:

- Glyph shape / weight (classic serif π vs straight-edged π — `R37`)
- Caret visible when the unit hides it (`R32`, `R35`)
- Idle / AC result chrome (blank vs painted `0` — `R34`)
- Stacked vs flat, wrong slot boxes, wrong indicator lit

Ask for form notes every row (symbol look, caret, empty slots,
result chrome), not only the numeric answer.

**Out of scope (do not file):** true pixel-perfect LCD *typeface*
mimicry — matching the hardware’s exact font raster, anti-aliasing,
or sub-pixel spacing across the whole display. That is roadmap
“pixel-perfect LCD font” (after Phase 3). Do **not** use that
carve-out to skip a glyph/template/chrome difference Ron can see
side-by-side. When unsure: **log the `R*`** and note
`vis-elements` / `vis-result` / `vis-indicators` in the text. Never
rewrite the kickoff row to say “font polish, out of scope” instead
of filing.

### Template editing QA (every stacked / boxed template)

Whenever a row uses a template (`a b/c`, mixed, √, xⁿ, ∫, log□,
hyp, …), also verify edit hygiene — not only a happy-path `=`:

1. **No IR / code leak on the LCD** — never show stems or tails such
   as `frac(`, `mix(`, `sqrt(`, `int(`, `,2)`, bare `,`, or a dangling
   `)`. Paint must stay stacked/boxed glyphs (or empty ⬚ slots).
2. **DEL / Backspace on an empty slot** — e.g. denominator filled,
   numerator empty, caret in numerator: DEL must not leave a leak;
   match the unit (usually unwrap / promote the other part, or clear
   the template cleanly).
3. **▲ / ▼ inside the template** — move between numerator and
   denominator (and whole/num/den on mixed) the way the unit does;
   do not jump to COMP history unless the caret is outside the
   template.
4. **Partial fill then DEL** — delete the last digit of a slot, then
   DEL again on the empty slot; still no leak.

If a happy-path row already passed but edit hygiene fails, log a new
`R*` (landed-correctness). Do not call it “known” under closed
`ir-leak` / `ascii-tokens` unless the exact sequence is already open.

Log a new fail once: landed-correctness → `docs/tech-issues.md`
(`R*`); honesty leftover → `issues.md` with an Associated id. Never
both. Do not refile a known leftover listed in the group.

AC between items. Degree unless the line says Rad/Gra. Known session
FIX from an earlier walk is not a packaging bug — reset SETUP if a
format surprises you.

## Do not

- Implement or “quickly fix” in this chat.
- Start Phase 3, `p4-exact`, `p4-tauri`, or LineIO.
- Open the browser / lock the tab / CDP / click calculator keys
  unless Ron explicitly asked you to drive Shevon.
- Press Shevon (when driving) before Ron’s unit report for that row.
- Dismiss Ron’s visual / glyph / chrome notes as “pixel-perfect font
  out of scope” without logging an `R*` (see **Form includes
  visuals**).
- Treat MODE 2/4/6/7/8 fallthrough, SETUP page 2 numbering, LineIO
  chrome, STAT ▲▼ lights, or CALC previous-value size as new work
  (`lying-menus`, `setup-page2`, `lineio-display`, `ind-arrows`,
  `prompt-prev-size`) — those are already parked; still log if the
  walk finds a *different* visual fail.
- Name the hardware vendor or original model.
- Touch `manual.pdf`.

## Done when (the sitting)

- Each item in the groups you walked is **pass** or **fail** with one
  **unit** value (from Ron) and one Shevon value (from Ron, or from
  the agent only if he asked it to drive), plus a **form** note
  (glyph / caret / chrome) when anything looked different.
- Every walked row had a hardware report before Shevon was scored.
- Template rows include edit-hygiene notes (DEL / ▲▼ / no IR leak)
  when the group uses templates.
- Noticeable visual mismatches Ron reported are logged as `R*` (not
  waved off as font polish).
- End-of-sitting summary lists **new** `R*` / issue ids logged this
  group (for the supervisor / resolution chats). No fixes landed here.
- No calculator code changed. No unsolicited browser automation.

---

## G1 — Arithmetic and entry

Digits, operators, Ans, scientific entry, replay. Not fractions.

| # | Function | Form | Function (unit = Shevon) |
|---|---------|------|--------------------------|
| 1 | Digits + decimal | Entry bottom-left / input line | `12.5` `=` → stacked 25/2 (MathIO; S⇔D → 12.5) |
| 2 | `+ − × ÷` | Operators as symbols, not words | `7−3×2` `=` → 1 |
| 3 | `( )` | Parens on the line | `(7−3)×2` `=` → 8 |
| 4 | Unary `(−)` | Minus as negate, not subtract | `(−)` `3` `x²` `=` → −9 (`R15`) |
| 5 | `=` then Ans | Next line can use Ans; unit hides caret after `+` (`R32`) | `5` `=` then `+` `2` `=` → 7 |
| 6 | DEL | Deletes last token / slot | Type `12`, DEL, `3` `=` → 13 |
| 7 | AC | Clears line; unit: no result (`R34`); Shevon still paints 0 | AC clears; compare result chrome |
| 8 | `×10ˣ` | Condensed `×10` + superscript; caret hidden after `=` (`R35`). Glyph detail `R36` dropped — do not refile | `2` `×10ˣ` `3` `=` → 2000 |
| 9 | π | SHIFT `×10ˣ` is the π symbol, not “pi”; classic serif vs straight (`R37`) | `2` π `=` matches the unit |
| 10 | e | ALPHA `×10ˣ` is e | e `=` matches the unit |
| 11 | Implicit multiply | `2π`, `2sin` look like the unit | `2` π `=` (unit keeps `2π` — `surd-pi-form` / `p4-exact`, do not refile) and `2` sin `30` `=` |
| 12 | COMP history ▲▼ | Replay past line + result; no caret (`R31`) | Two+ COMP lines; unit: one ▲ to older; ▼ keeps expression↔result |

## G2 — Fractions and display

Templates and result formats. Not powers. Apply **Template editing
QA** on rows 1–4 (and Rnd if you open a template).

| # | Function | Form | Function |
|---|---------|------|----------|
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
| 11 | `%` | SHIFT `(`; not a percent template | `200+10%` `=` → 200.1 (`R17`) |
| 12 | Rnd | `Rnd(` template; DEL empty arg — no `Rnd(` dump | Under Fix 3, Rnd of a long value matches the unit |
| 13 | ° ′ ″ | Sexagesimal glyphs, not decimals only | Enter DMS; °′″ key toggles |

## G3 — Powers and roots

Apply **Template editing QA** on √ / xⁿ / ⁿ√ (DEL empty box, no
`sqrt(` / `pwr(` / `root(` leak).

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
| 10 | √ DEL empty | Open √, DEL with empty radicand — no `sqrt(` leak | Match unit unwrap/clear |

## G4 — Logs and exponentials

π / e already walked in G1. log(a,b) LineIO comma form is `comp-lineio` — skip.
Apply **Template editing QA** (DEL empty arg / base box; no `log10(`
/ `ln(` / `log_b(` leak).

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
Apply **Template editing QA** on open sin/hyp/Abs (DEL empty;
no `sin(` / `abs(` / `hyp` letter dump).

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

Apply **Template editing QA** (DEL empty integrand / limit; no
`int(` / `diff(` / `Σ(` leak).

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

## G14 — Emulator extras (optional vs the unit; do this sitting after G1)

Not scored against the hardware face. **After G1 wraps, walk this
group next** (before G2) so `show-keys-size` is confirmed on the
laptop; the fix slice is queued before Phase 3.

| # | What | Check |
|---|------|--------|
| 1 | Overlay hitboxes | Keys land on the art |
| 2 | Show keys strip | Physical-key chips; X is ALPHA `)` |
| 3 | Show keys size | On ~13" (or a narrow window): chips readable but not huge; strip does not dominate the face. Issue `show-keys-size`. Pass if already scaled; fail + keep issue open if oversized |
| 4 | History pane Load | Loads COMP; clears overlays (`R26`) |
| 5 | Exe chrome | Frameless; Show keys / History off the face; Pin; `sin(30)` → 0.5 |

---

## How to run the evening

1. Open this file, the **unit**, and Shevon (exe or `:3000`).
2. Pick **one** group. After G1 is done, next sitting is **G14**
   (Show keys size), then resume **G2**–G13. Tell the agent the
   group id.
3. For each row, follow **Cadence**: agent coaches; you report unit
   then Shevon (G14 is Shevon-only — still one row at a time). Agent
   records item, form pass/fail, function (unit → Shevon). Keep the
   agent off the browser unless you ask.
4. Stop at the end of the group. Agent lists new `R*` / issue ids.
   **Do not** open a fix chat mid-group. Resolution is a later
   sitting / kickoff (see **Workflow** above).
5. Next group is a new sitting or the same chat with “G14 next” /
   “G2 next”. Launch from
   [Validate](../../canvases/validate.canvas.tsx) if you want a
   group-scoped chat.
