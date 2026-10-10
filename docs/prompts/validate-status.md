# Unit pairing — status

Handoff for the next machine. This is the pairing cursor only.
Scheduled work stays in [`roadmap.md`](../../roadmap.md) **Now**.
Open leftovers stay in [`issues.md`](../../issues.md). Landed
`R*` stay in [`docs/tech-issues.md`](../tech-issues.md). The walk
itself is [`validate-unit.md`](validate-unit.md).

Logged 1 Oct 2026; G2 walk 10 Oct 2026. Pairing chat:
guide and scribe only. Ron runs the unit and Shevon. Do not drive
the browser unless he asks. One row at a time. No calculator code
in a pairing chat.

**Tested** means Ron walked it on the unit and Shevon.
**Untested** means no such walk yet.

## Cursor

**G2 sitting done** (10 Oct 2026). `g2-resolve` closed `R39`–`R43`
and `setup-page2` in code. Re-check (10 Oct 2026): **pass** R40,
R41, setup-page2, R42, R43, smoke. **R39** still open — empty
boxes too large / overlap the fraction bar (size tweak pending
re-verify).

**Next pairing sitting:** G3 — powers and roots — **new** chat from
[`validate-unit.md`](validate-unit.md). Do not start Phase 3.
**Now** queue empty (pairing-driven only). Closed chats:
[re-check](4fbb9cb3-f9d5-4048-a8bd-e98650315fcc),
[R38 resolve](9aacae11-a4cf-46ce-a525-879a23bf52f2),
[G2 pair](f2cb3982-4abe-4a32-9ec3-3a2966947df0).
`g2-resolve` closed in code 10 Oct 2026.

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
| 1 `a b/c` | function **pass**. Form **fail** `R39` → **closed in code** (`g2-resolve`; re-check untested) | was concentric squares |
| 2 Mixed | function **pass**. Form **fail** `R40` → **closed in code** | was caret, no whole box |
| 3 Frac ▲/▼ | **pass** | num ↔ den |
| 4 Frac DEL empty num | **pass** | both → integer `2`; no leak |
| 5 S⇔D | **pass** | |
| 6 SETUP ab/c vs d/c | d/c **pass**. ab/c `R41` + `setup-page2` → **closed in code** | was nested stack / 3-row menu |
| 7 Fix | **pass** | `0.667`; SETUP page 1 items OK; Disp▼ page cue on unit |
| 8 Sci | **pass** | |
| 9 Norm 1/2 | **pass** | |
| 10 ENG / SHIFT ENG | stepping **pass**. Hold `R42` → **closed in code** | was clear after first shifted key |
| 11 `%` | **pass** | `200.1` (`R17` closed) |
| 12 Rnd | **pass** | Fix 3: `Rnd(10÷3)×3` → 9.999; empty DEL clean |
| 13 ° ′ ″ | `R43` → **closed in code** | was decimal-first after `=` |

Open `R*` after `g2-resolve`: none. Re-check of G2 form rows still untested.

### G14 — emulator extras (30 Sep 2026)

| # | Walk | After the fix |
|---|------|----------------|
| 1 Hitboxes | pass. SHIFT / ALPHA hold | n/a |
| 2 Show keys | X is ALPHA then `)` | `show-keys-face` **re-check pass** |
| 3 Size / strip | scale + chrome | `show-keys-size` **re-check pass** |
| 4 History Load | `R26` pass | `hist-scroll` **re-check pass** at `1rem` |
| 5 Exe frame | pass | n/a |

## Untested

- Groups **G3–G13**.

## Do not refile

`R30`–`R43` (except dropped `R36`), `show-keys-size`,
`show-keys-face`, `hist-scroll`, `surd-pi-form` / `p4-exact`,
`lying-menus`, `setup-page2` (closed), `lineio-display`,
`ind-arrows`, `prompt-prev-size`. Do not refile.
