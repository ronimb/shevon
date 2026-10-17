# Agent instructions

Shevon is a scientific calculator emulator. **Do not invent a second
plan** in chat or on a canvas. Doc map:
[`docs/README.md`](docs/README.md).

## Always

- Design: [`docs/principles.md`](docs/principles.md) (**Naming** —
  never name the hardware vendor or original model).
- Queue: [`roadmap.md`](roadmap.md) **Now** only.
- `R*` catalog: [`docs/tech-issues.md`](docs/tech-issues.md) only
  (honesty leftovers → [`issues.md`](issues.md)).
- Protected: do not delete/move/rename `manual.pdf` or files Ron did
  not ask to change (`.cursor/rules/protected-files.mdc`).
- Revert = **git** restore/revert (`.cursor/rules/git-revert.mdc`),
  not hand-rewrite.

## Chat type → kickoff

| Chat | Follow |
|------|--------|
| Supervisor / triage / “what’s next” | [`docs/prompts/supervisor.md`](docs/prompts/supervisor.md) — **no** leftover implementation |
| Pairing | Kickoff named in **Now** (e.g. `g6-pair.md`); cadence in [`validate-unit.md`](docs/prompts/validate-unit.md) — **findings only**, no code |
| Implementation | One slice: kickoff named in **Now** |
| Verify / consolidate docs | [`.cursor/skills/verify-docs/SKILL.md`](.cursor/skills/verify-docs/SKILL.md) |

## Dev server

Ron owns `npm run dev` in a **user** terminal (Terminal → New
Terminal) or an external shell — not an agent terminal. Agents must
**not** start a long-lived Vite/Tauri/Electron process and leave it
running. To free port 3000 without hunting chats: `npm run stop:dev`.
Prefer editing only under `docs/` / prompts when Ron is using the
app — Vite ignores those paths; avoid touching `src/` / `*.css` /
`index.html` unless the slice needs it (those still HMR).

## Canvases

Optional and often unusable. **Do not edit** on handoffs. See
[`canvases/README.md`](canvases/README.md). Markdown wins.

## After a change

Update the **owning** `.md` in the same change (`roadmap` / `issues` /
`tech-issues` / `validate-status` / coverage as appropriate). New
ideas → `backlog.md`. Do not duplicate the queue in README or chat.
