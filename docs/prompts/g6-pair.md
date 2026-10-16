# Kickoff — G6 pairing (historical)

**Sitting done** 16 Oct 2026. Resolve landed
([`g6-resolve.md`](g6-resolve.md), `R60`–`R62` closed). Do not
restart G6. Do not start Phase 3 or G7 unless Ron asks.

---

Copy everything below the line into a **new agent chat** only if
re-walking. Pairing only. Do not implement.

---

Follow [`validate-unit.md`](validate-unit.md) **G6** for the row
table, cadence, form rules, and template editing QA. Cursor:
[`validate-status.md`](validate-status.md).

Guide and scribe only. Ron presses unit and Shevon. Do not drive
the browser unless he asks.

**Cadence:** one case = one prompt (keys + what to compare on both
devices). Stop. Ron runs both; he reports **findings only** — not
matching results or “pass.” Silence / `ok` / `clear` / `next` →
pass that row. Never split unit vs Shevon into two prompts. Never
say “happy path.”

Start at **G6.1**. Finish G6, update `validate-status.md`, stop.
Log new fails as `R*`. No code.

Do not refile closed `R6` (n! reject) unless a *new* fail shows.
Factorial above 69 is `fact-max` / `comp-range` — log only if not
already open. Already logged: **`R60`** (DEL at infix P/C),
**`R61`** (Abs bars too thick when stretched over frac), **`R62`**
(RanInt# empty form: unit is `RanInt#(` only; Shevon paints two
placeholder boxes and a comma that DEL leaves). Fix slice:
[`g6-resolve.md`](g6-resolve.md).
