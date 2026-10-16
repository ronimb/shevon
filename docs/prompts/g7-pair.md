# Kickoff — G7 pairing (calculus templates)

Copy everything below the line into a **new agent chat**. Pairing
only. Do not implement. Do not start Phase 3 or G15 unless Ron asks.

---

Follow [`validate-unit.md`](validate-unit.md) **G7** for the row
table, cadence, form rules, and **Template editing QA** (DEL empty
integrand / limits; no `int(` / `diff(` / `Σ(` leak; nested frac
in integrand). Cursor: [`validate-status.md`](validate-status.md).

Guide and scribe only. Ron presses unit and Shevon. Do not drive
the browser unless he asks.

**Cadence:** one case = one prompt (keys + what to compare on both
devices). Stop. Ron runs both; he reports **findings only** — not
matching results or “pass.” Silence / `ok` / `clear` / `next` →
pass that row. Never split unit vs Shevon into two prompts. Never
say “happy path.”

Start at **G7.1**. Finish G7, update `validate-status.md`, stop.
Log new fails as `R*`. No code.

Do not refile closed `R29` (∫ limits on glyph) or `sigma-bounds`
unless a *new* fail shows. After the sitting, supervisor writes
`g7-resolve` if any new `R*` need a fix slice.
