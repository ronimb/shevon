# Agent instructions

Shevon is a scientific calculator emulator. Follow the design principles and
the markdown sources of truth. Do not invent a competing plan in chat or on a
canvas. Do not name the hardware vendor or the original calculator model
(see [`docs/principles.md`](docs/principles.md) **Naming**). Do not
delete, move, or rename `manual.pdf` or any file Ron did not ask to
change (`.cursor/rules/protected-files.mdc`).

## Design principles (always)

Read [`docs/principles.md`](docs/principles.md) before implementing or
reviewing UI or calculator behavior.

- **Match function behavior** to the official manual
  (`manual.pdf`). Never fake a result. Never dump literal
  function text where the hardware shows a symbol or a menu.
- **Visual fidelity** means every hardware element is present, in the
  hardware’s position/role, and behaves the same. Pixel-perfect mimicry is
  not required.
- **Honesty:** menu items that cannot run must not silently fall through to
  COMP.
- **Done** means element + behavior parity vs the manual figure.

## Where work lives

| File | Source of truth for |
|------|---------------------|
| [`roadmap.md`](roadmap.md) | Scheduled work (Now, phases, vis-*, COMP leftovers, landed) |
| [`issues.md`](issues.md) | Honesty / leftover bugs (cite the phase/action id when one exists) |
| [`docs/tech-issues.md`](docs/tech-issues.md) | Landed-correctness review (`R*` / `ti-*`) |
| [`backlog.md`](backlog.md) | Unassigned feature ideas only |
| [`docs/coverage.md`](docs/coverage.md) | Feature-by-feature hardware coverage |
| [`docs/visual-fidelity-inventory.md`](docs/visual-fidelity-inventory.md) | LCD element audit |
| [`docs/prompts/tech-debt.md`](docs/prompts/tech-debt.md) | Engine debt A–C (landed; historical) |
| [`docs/prompts/triage.md`](docs/prompts/triage.md) | Triage / oversight chats (not an implementation slice) |

Canvases under `canvases/` are **views**. Refresh them from the markdown when
the story changed. If a canvas disagrees with a markdown file, the markdown
wins.

When you add, finish, defer, or close work, update the matching `.md` file in
the same change. New unscheduled ideas go in `backlog.md`. Honesty leftovers
go in `issues.md`. Landed-correctness review items go in
`docs/tech-issues.md` — do not copy the same R-id into both files.

**Triage / oversight** chats follow [`docs/prompts/triage.md`](docs/prompts/triage.md).
Do not implement leftovers in those chats.

Do not write a second task list in the README, a canvas, or chat.
