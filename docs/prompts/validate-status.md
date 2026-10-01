# Unit pairing — status

Handoff for the next machine. This is the pairing cursor only.
Scheduled work stays in [`roadmap.md`](../../roadmap.md) **Now**.
Open leftovers stay in [`issues.md`](../../issues.md). Landed
`R*` stay in [`docs/tech-issues.md`](../tech-issues.md). The walk
itself is [`validate-unit.md`](validate-unit.md).

Logged 1 Oct 2026. Pairing chat: guide and scribe only. Ron runs
the unit and Shevon (`http://localhost:3000` or the exe). Do not
drive the browser unless he asks. One row at a time: name it, wait
for the unit, then Shevon, compare, AC, next. No calculator code
in a pairing chat.

**Tested** means Ron walked it on the unit and Shevon.
**Untested** means no such walk yet, or the fix landed in code
without a second walk.

## Cursor

**Next sitting is G2** (fractions and display), starting at **G2.1**
`a b/c`. Apply template editing QA on G2 rows 1–4 (and Rnd if a
template is open). G2–G13 are **untested**. Do not re-walk G1 or
G14 unless Ron asks for a re-check of a landed fix.

Implementation **Now** is Phase 3 (`p3-cmplx`). That is a different
chat. This pairing does not start it.

## Tested walks

### G1 — arithmetic and entry (29 Sep 2026)

Walked. Later code (`g1-resolve`) is in; that re-check is **untested**.

| # | Walk | After the fix |
|---|------|----------------|
| 1 Digits | pass — stacked 25/2. `R30` closed (not a bug) | n/a |
| 2 `+ − × ÷` | pass — 1 | n/a |
| 3 `( )` | pass — 8 | n/a |
| 4 Unary `(−)` | pass — −9 | n/a |
| 5 Ans | value pass (7). Caret fail logged `R32` | code closed; re-check untested |
| 6 DEL | pass — 13 | n/a |
| 7 AC | clear works. Idle `0` logged `R34` | code closed (blank); re-check untested |
| 8 `×10ˣ` | value pass (2000). Caret logged `R35`. `R36` glyph dropped — do not refile | caret code closed; re-check untested |
| 9 π | value pass. Serif glyph logged `R37` | code closed; re-check untested |
| 10 e | pass | n/a |
| 11 Implicit × | `2 sin 30` pass. Unit keeps `2π` — `surd-pi-form` / `p4-exact`, do not refile | n/a |
| 12 History ▲▼ | fail logged `R31` | code closed; re-check untested |

Open `R*`: none.

### G14 — emulator extras (30 Sep 2026)

Walked on Shevon. Resolution code landed the same day. A second
look at the chips, strip, and History scrollbar is **untested**.

| # | Walk | After the fix |
|---|------|----------------|
| 1 Hitboxes | pass. SHIFT / ALPHA hold is desired and current. Do not latch them | n/a |
| 2 Show keys | X is ALPHA then `)`. Numpad face fail logged `show-keys-face` | code closed; re-check untested |
| 3 Size / chrome | fail logged `show-keys-size` (scale, no “CURRENT KEYS”, Hide keys / More until hover) | code closed; re-check untested |
| 4 History Load | pass (`R26`). Text and scrollbar fail logged `hist-scroll` | code closed; re-check untested |
| 5 Exe chrome | pass — frameless, chrome off the face, Pin, `sin(30)` → 0.5 | n/a |

## Untested

- Groups **G2–G13** in [`validate-unit.md`](validate-unit.md). Start at G2.1.
- Re-check of `g1-resolve` (`R31`, `R32`, `R34`, `R35`, `R37`,
  `prompt-prev-size`).
- Re-check of `show-keys-size` / `show-keys-face` / `hist-scroll`.

## Do not refile

`R30`–`R37` (except dropped `R36`), `show-keys-size`,
`show-keys-face`, `hist-scroll`, `surd-pi-form` / `p4-exact`,
`lying-menus`, `setup-page2`, `lineio-display`, `ind-arrows`,
`prompt-prev-size`.
