# Backlog

Unassigned feature ideas — things we may want that are **not yet on the
roadmap**. This file is not the task list.

| If you need… | Go here |
|--------------|---------|
| Scheduled work (phases, Now, vis-*) | [`roadmap.md`](roadmap.md) |
| Open bugs | [`issues.md`](issues.md) |
| Design rules | [`docs/principles.md`](docs/principles.md) |

When an idea gets a phase, action id, or a “do this next”, **move it** to
[`roadmap.md`](roadmap.md) (or [`issues.md`](issues.md) if it is a defect)
and delete it from here. Do not leave the same item in two files.

---

## Engine / COMP edges

- Natural-display **height and nesting limits** from E-8 (templates currently
  nest without Casio’s caps).
- **Omitted-× priority** (Casio ranks it 7th) vs our rewrite-then-parse
  implicit multiply (`2π`, `2sin`, `)(`).
- Confirm **percent-of** semantics on `+` / `−` (SHIFT `(` inserts `%` → `/100`).
- Casio **ignores consecutive `x²`**; we do not.
- Internal **15-digit** vs displayed values for π and e.

## STAT extras

- On quadratic regression, Casio shows **A B C m1 m2 n**, not r. We expose r
  like the linear types.
- **STO / M+** from inside the STAT editor (blocked on the hardware in ways we
  have not modeled).

## LCD extras (not on the unit as we show them)

- Multi-line **history stack on the LCD** itself (today ▲/▼ replays one past
  COMP line; the side pane is a separate emulator extra). Distinct from the
  landed **Current history** top strip in [`roadmap.md`](roadmap.md)
  Emulator extras (remaining work is the A–F / M letter-shortcut audit).

## Architecture

(The `Calculator.tsx` shell split landed as `debt-shell`. Do not re-open
it unless a regression shows up.)

## Diagnostics

- **Time Out Error** for slow ∫ / d/dx (Casio). Related to `comp-range` but
  not scheduled as its own action.
- **COMP-only** rule for integration (reject ∫ outside COMP).

---

Ideas that are already decided **out of scope** (hardware contrast, battery,
auto power-off, pixel-perfect LCD font before Phase 3) live under
[`roadmap.md`](roadmap.md) **Out of scope** — do not re-add them here.
