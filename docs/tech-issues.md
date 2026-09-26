# Tech issues — landed correctness

Source of truth for review ids `R1`–`R29` and slices `ti-*`.
Not Phase 2 leftovers and not honesty-policy lies. Do not copy an
R-id into [`issues.md`](../issues.md).

| If you need… | Go here |
|--------------|---------|
| Queue (what to implement next) | [`roadmap.md`](../roadmap.md) **Now** |
| Honesty leftovers | [`issues.md`](../issues.md) |
| STAT / EQN pairing (no code) | [`sanity-stat.md`](prompts/sanity-stat.md) |

Status: `[ ]` open · `[x]` done.

---

## Open

None. Next scheduled work is `p2-calc`.

---

## Landed program (`ti-stat` … `ti-edges`)

Closed 26 Sep 2026. `R17` reopened after a hardware check, then
closed as ÷100 (`r17-percent`). Kickoffs stay under
`docs/prompts/ti-*.md` / `r17-percent.md` for regressions.

| Slice | Ids |
|-------|-----|
| `ti-stat` | R14, R3, R18 |
| `ti-numerics` | R1, R5, R6, R20 |
| `ti-store` | R4, R7 |
| `ti-parse` | R2, R8 |
| `ti-keys` | R9, R10, R11, R25 |
| `ti-escape` | R12, R13, R26 |
| `ti-edges` | R15, R16, R19, R21–R24 |
| `r17-percent` | R17 |
| `r28-exp` | R28 |
| `r29-int` | R29 |

### High (closed)

- [x] `R1` — tan poles only special-cased 90°. Now every odd quarter-turn is Math ERROR.
- [x] `R2` — `XY` / `AB` multiply (not one ident).
- [x] `R3` — STAT fit letters do not clobber STO A/B/C/R/N on a COMP line.
- [x] `R4` — STO evals Ans as a value; errors do not write the letter.
- [x] `R5` — odd roots of negatives are real (`root(3,-8)` = −2).
- [x] `R6` — n! / nCr / nPr reject non-integers and negatives.
- [x] `R7` — prompt `0` stores 0; empty keeps previous. Chrome size is `prompt-prev-size`.
- [x] `R8` — SOLVE does not prompt letters inside `Ans` / `nCr` / stems.
- [x] `R9` — after `=`, x^n is `Ans^(‸)` (SHIFT: `root(Ans,‸)`); COMP-only.
- [x] `R10` — x² / cube after `=` always clear SHIFT.
- [x] `R11` — caret jumps `pol(` `rec(` `^(`.
- [x] `R12` — CALC / SOLVE / hyp do not overlay STAT / EQN.
- [x] `R13` — AC from STAT/EQN clears overlays; STAT AC turns STAT off.
- [x] `R14` — first digit replaces a STAT cell (FREQ `1` → `5`).

### Medium (closed)

- [x] `R15` — `(−) 3 x²` is −9; packed `(−3)²` is 9.
- [x] `R16` — Pol/Rec write X,Y via `setVars`.
- [x] `R17` — `%` is ÷100 on every path (`200+10%` = 200.1, not 220).
- [x] `R18` — invalid x̂/ŷ is Math ERROR, not 0.
- [x] `R19` — quadratic `a=0` is Math ERROR.
- [x] `R20` — `0^0` and lone `!` are Math ERROR.
- [x] `R21` — `|x| < 1e-15` uses Norm sci; exact 0 stays `0`.
- [x] `R22` — singular ∫ is Time Out (entry path landed as `R29`).
- [x] `R23` — persisted Ans / vars / angle are validated.
- [x] `R24` — result line blank while typing; idle/AC still `0`.
- [x] `R25` — frac / nPr / nCr COMP-only.
- [x] `R26` — History Load enters COMP and clears overlays.
- [x] `R27` — EQN PC `3` reported dead, then worked. Closed as not reproduced.
- [x] `R28` — ×10ˣ paints condensed `×10`; caret jumps `×10^(`; `2×10^(3)` = 2000.
- [x] `R29` — ∫ limits sit on the symbol. Caret starts in the
      integrand. ▶: integrand → lower → upper → after dx → before ∫
      (then wraps). ◀ reverses: integrand → before ∫ → after dx →
      upper → lower → integrand. ▲ from integrand (or lower) is
      upper and stops; ▼ from integrand (or upper) is lower and
      stops. Logged from the unit walk in [shevon overseer](f793dcae-c828-449a-a68d-fe9ad83dfbd2).

---

## Not this file

`lying-menus`, `eqn-menu-fallthrough`, `dist-empty`, `lineio-display`,
`setup-page2`, `calc-ux`, `stat-jump-comp`, `fact-max`, `sigma-bounds`,
`ind-hardcoded`, `ind-arrows`, `surd-pi-form`, `prompt-prev-size`,
`comp-keys`, `hist-letters`, `shift-ac-mem`.
