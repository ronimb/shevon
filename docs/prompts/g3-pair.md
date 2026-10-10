# Kickoff — G3 pairing (powers and roots)

Copy everything below the line into a **new agent chat**. This is
**pairing / verification only**. Do not implement leftovers, Phase 3,
or fix mid-sitting.

---

## Context

**Program goal:** polish the daily exe on COMP + STAT + EQN.
Phase 3 parked.

**G2** walked and resolved
([g2-resolve](4d4bba9a-944f-40b3-ab42-79ece793603f)); re-check
passed `R39`–`R43` + `setup-page2` (including empty-slot shrink).
Do not refile those. Do not start `r39-slot` — dropped.

**Cursor:** [`validate-status.md`](validate-status.md). Follow
[`validate-unit.md`](validate-unit.md) for cadence and template QA.

You are a **guide and scribe** only. Ron presses the **unit** and
**Shevon**. Do not drive the browser unless he asks.

### This sitting

Walk **G3 only** (powers and roots), starting at **G3.1** x².
Finish the group, then stop.

| # | Function | Form | Function |
|---|----------|------|----------|
| 1 | x² | Superscript ² | `5` x² `=` → 25 |
| 2 | x³ | SHIFT x² → ³ | `3` SHIFT x² `=` → 27 |
| 3 | xⁿ | `^( )` / box, caret inside | `2` xⁿ `8` `=` → 256 |
| 4 | After `=` xⁿ | `Ans^(‸)` (`R9`) | `9` `=` then xⁿ `2` `=` → 81 |
| 5 | √ | Radical template | √ `9` `=` → 3 |
| 6 | ³√ | SHIFT √ | ³√ `8` `=` → 2 |
| 7 | ⁿ√ | SHIFT xⁿ | nth root of 32 → 2 (root 5) |
| 8 | x⁻¹ | Superscript −1 | `4` x⁻¹ `=` → 1/4 or 0.25 |
| 9 | Odd root of negative | Real, not Math ERROR (`R5`) | ³√ `(−)8` `=` → −2 |
| 10 | √ DEL empty | Open √, DEL empty radicand — no `sqrt(` leak | Match unit |

Template editing QA on √ / xⁿ / ⁿ√. Do not start G4. No calculator code.

### Workflow

1. Name one row. Stop.
2. Unit report, then Shevon report.
3. Log new fails as `R*` (next free after open ids) or `issues.md`.
   Update `validate-status.md` at end.
4. AC both. Next row.
5. End with new ids. **No code.**

### Do not refile

See [`validate-status.md`](validate-status.md) — includes `R30`–`R43`
(except dropped `R36`), `setup-page2`, `surd-pi-form` / `p4-exact`, etc.
`R5` / `R9` notes in the G3 table are historical closed behavior —
do not refile if already matching.
