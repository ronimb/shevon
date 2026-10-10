# Unit pairing — status

Handoff for the next machine. This is the pairing cursor only.
Scheduled work stays in [`roadmap.md`](../../roadmap.md) **Now**.
Open leftovers stay in [`issues.md`](../../issues.md). Landed
`R*` stay in [`docs/tech-issues.md`](../tech-issues.md). The walk
itself is [`validate-unit.md`](validate-unit.md). G2 starter:
[`g2-pair.md`](g2-pair.md).

Logged 1 Oct 2026; re-check updated 10 Oct 2026. Pairing chat:
guide and scribe only. Ron runs the unit and Shevon. Do not drive
the browser unless he asks. One row at a time. No calculator code
in a pairing chat (except a tiny mid-sitting chrome tweak Ron
asked for — History text → `1rem`).

**Tested** means Ron walked it on the unit and Shevon.
**Untested** means no such walk yet.

## Cursor

**Re-check sitting done** (10 Oct 2026). `R38` closed in a
resolution chat (typed digits replace `A?` on the left; previous
bottom-right only).

**Next new sitting is G2** — open a **new** chat from
[`g2-pair.md`](g2-pair.md) (or Validate canvas **Start G2**).
Start at **G2.1** `a b/c`. G2–G13 are **untested**.

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

Open `R*`: _(none)_.

### G14 — emulator extras (30 Sep 2026)

| # | Walk | After the fix |
|---|------|----------------|
| 1 Hitboxes | pass. SHIFT / ALPHA hold | n/a |
| 2 Show keys | X is ALPHA then `)` | `show-keys-face` **re-check pass** |
| 3 Size / strip | scale + chrome | `show-keys-size` **re-check pass** |
| 4 History Load | `R26` pass | `hist-scroll` **re-check pass** at `1rem` |
| 5 Exe frame | pass | n/a |

## Untested

- Groups **G2–G13** — start at G2.1 via [`g2-pair.md`](g2-pair.md).

## Do not refile

`R30`–`R37` (except dropped `R36`), `show-keys-size`,
`show-keys-face`, `hist-scroll`, `surd-pi-form` / `p4-exact`,
`lying-menus`, `setup-page2`, `lineio-display`, `ind-arrows`,
`prompt-prev-size`, `R38`. Do not refile.
