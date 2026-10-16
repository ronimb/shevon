---
name: verify-docs
description: >-
  Verify and validate all Shevon project documentation against the real
  repo status, consolidate duplicated facts into the correct source of
  truth, tighten each file’s role, and optionally refresh canvases.
  Use when the user asks to verify docs, validate docs, verify and
  validate all project docs, audit documentation, fix doc drift, or
  consolidate docs/canvases.
---

# Verify and validate project docs

Prefer doc fixes over inventing a new plan. Do **not** implement
calculator leftovers unless Ron asks in the same message. Do **not**
touch calculator `src/` unless he explicitly includes code.

Doc map: [`docs/README.md`](../../../docs/README.md).

## Hard rules

- Markdown is the source of truth. Canvases are **optional** — see
  [`canvases/README.md`](../../../canvases/README.md).
- One queue: `roadmap.md` **Now**. One `R*` catalog:
  `docs/tech-issues.md`.
- Naming: `docs/principles.md`. Never touch `manual.pdf` wrongly
  (protected-files rule).
- No second task list in README, canvas, or chat.

## Doc roles

See table in `.cursor/rules/docs.mdc` / `docs/README.md`. Do not blur
roles.

## Workflow

```
Verify-docs progress:
- [ ] 1. Inventory (docs/README + prompts/README + canvases/README)
- [ ] 2. Ground truth (Now, open R*, kickoff exists)
- [ ] 3. Match markdown to ground truth
- [ ] 4. Consolidate / dedupe
- [ ] 5. Canvases — skip unless Ron asked or they still contradict md
- [ ] 6. Report
```

### Ground truth

- **Now** vs kickoff file on disk
- Open `R*` still open?
- Supervisor snapshot vs **Now** (roadmap wins)
- README Status is a **one-line pointer** to Now — not a second queue
- Historical kickoffs marked historical; not linked as Now

### Consolidate

- Same “what’s next” → only in `roadmap.md` **Now**; others point
- Pair progress → `validate-status.md` only
- Stale handoff logs → historical stub (one short page)
- Pair kickoffs: short; cadence lives in `validate-unit.md`

### Canvases

**Default: skip.** If refreshing: keep stubs that only open `.md`
files; do not rebuild dashboards. Never delete `manual.pdf`.

### Report

What was wrong; what you fixed; what you left; whether canvases
changed.
