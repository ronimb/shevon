# Kickoff — STAT / remaining EQN post-pass

Copy everything below the line into a **new agent chat**. This chat is
**pairing / verification only**. Do not implement leftovers, Dist,
stay-in-STAT, CALC E-19, or the `R17` revert here.

---

Follow `docs/principles.md`. Sources: [`docs/tech-issues.md`](../tech-issues.md)
`R14` `R3` `R18` `R12` `R13` `R25` `R19` `R26` `R27`,
[`sanity-landed.md`](sanity-landed.md), manual E-22–25 / E-28.
Ron stopped the solo pass at STAT. Walk these with him on
http://localhost:3000. Log fails to `docs/tech-issues.md` (landed
correctness) or `issues.md` (honesty leftover) — never both. Do not
treat empty Dist, EQN 1/2/4 fallthrough, or CALC ≠ E-19 as new bugs.

## Must do

Walk each block. AC between blocks. Degree. Use **faceplate keys**
unless a line says PC keyboard.

### FREQ ON (`R14`)

FREQ is a SETUP switch, not a STAT type. It adds a weight column so
one X (or X,Y) row can count more than once.

1. SHIFT MODE (SETUP). ▼ to page 2. On **Shevon** press `3` (STAT)
   then `1` (ON). (The unit’s page 2 puts STAT on **4**; that numbering
   gap is `setup-page2`, not this test.)
2. MODE `3` `1` (1-VAR). Editor: X column, then a **FREQ** column.
   New rows default FREQ `1`.
3. Put a number in X (e.g. `2`). ▶ to FREQ. Cell shows `1`. Type `5`.
   Cell must become **`5`**, not `15`.
4. SHIFT `1` → Var → `x̄`. Mean must use weight 5 (one row X=2, FREQ=5
   → `x̄` = 2, `n` = 5).
5. DEL on a data row still deletes the **line**, not one digit.

FREQ OFF (SETUP page 2 → STAT → `2`) hides the column; each row counts 1.

### STAT memory (`R3`)

1. MODE `1`. `7` STO ALPHA (−) (letter A).
2. MODE `3` `2` (A+BX). Enter two points, e.g. (1,2) and (2,4).
3. MODE `1`. RCL A → **7**, not the fit intercept (0).

STAT recall jumping to COMP is `stat-jump-comp` / `p2-stat-mode` — known.

### Invalid x̂ / ŷ (`R18`)

Hat symbols come from SHIFT `1` → Reg while a type is selected.

1. A+BX with (1,5) and (2,5) — horizontal, slope 0. Recall `x̂` of 5
   → Math ERROR, not `0`.
2. 1/X type with (1,1) and (2,0.5). Recall `ŷ` of 0 → Math ERROR.

### Overlays / keys in STAT (`R12`, `R13`, `R25`)

1. In the STAT grid: CALC, hyp, SHIFT CALC must **not** paint `A?` /
   hyp / “solve for x” over the table.
2. In STAT, x^n / x² / frac / nPr / nCr must not edit hidden COMP.
3. AC from STAT → COMP, STAT indicator **off**, no leftover overlay.

### EQN (`R19`, `R12`, `R13`)

1. MODE `5`, then PC or overlay `3` — quadratic editor (`R27` closed).
   1/2/4 fallthrough is `eqn-menu-fallthrough`.
2. a=0, b=2, c=−4, `=` → Math ERROR (`R19`). Same for 0,0,0.
3. In the editor: CALC / hyp / SHIFT CALC do not overlay (`R12`).
4. AC from EQN clears hyp / prompt / solve / lcdError (`R13`).

### History (`R26`)

Load a COMP line from the History pane → COMP, line visible, overlays
cleared.

## Do not

- Implement Dist, stay-in-STAT, CALC E-19, LineIO, packaging, or `R17`.
- Disable lying MODE/EQN rows.
- Mark `R14` / `R3` / `R18` done from memory — only after this walk
  and the matching `.md` checkboxes.

## Done when

- Each id above is pass / fail with one observed result.
- No calculator code changed in this chat.
