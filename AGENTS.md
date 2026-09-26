# Agent instructions

Shevon is a Casio fx-991ES PLUS emulator. Follow the design principles and
the markdown sources of truth. Do not invent a competing plan in chat or on a
canvas.

## Design principles (always)

Read [`docs/principles.md`](docs/principles.md) before implementing or
reviewing UI or calculator behavior.

- **Match function behavior** to the official manual
  (`fx-570_991ES_PLUS_EN.pdf`). Never fake a result. Never dump literal
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
| [`issues.md`](issues.md) | Open bugs (cite the phase/action id when one exists) |
| [`backlog.md`](backlog.md) | Unassigned feature ideas only |
| [`docs/coverage.md`](docs/coverage.md) | Feature-by-feature Casio coverage |
| [`docs/visual-fidelity-inventory.md`](docs/visual-fidelity-inventory.md) | LCD element audit |
| [`docs/prompts/tech-debt.md`](docs/prompts/tech-debt.md) | Engine debt A–C (landed; historical) |
| [`docs/prompts/phase-2.md`](docs/prompts/phase-2.md) | Remaining Phase 2 leftovers (one slice per chat) |

Canvases under `canvases/` are **views**. Refresh them from the markdown when
the story changed. If a canvas disagrees with a markdown file, the markdown
wins.

When you add, finish, defer, or close work, update the matching `.md` file in
the same change. New unscheduled ideas go in `backlog.md`. Defects go in
`issues.md`.

Do not write a second task list in the README, a canvas, or chat.
