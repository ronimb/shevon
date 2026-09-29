---
name: verify-docs
description: >-
  Verify and validate all Shevon project documentation against the real
  repo status, consolidate duplicated facts into the correct source of
  truth, tighten each file’s role, and refresh canvases so they match
  markdown. Use when the user asks to verify docs, validate docs, verify
  and validate all project docs, audit documentation, fix doc drift, or
  consolidate docs/canvases.
---

# Verify and validate project docs

When Ron asks to **verify & validate** (or audit / consolidate) project
docs, follow this skill end-to-end. Prefer doc fixes over inventing a
new plan in chat. Do **not** implement calculator leftovers unless he
explicitly asks in the same message.

## Hard rules

- Markdown is the source of truth. Canvases under `canvases/` are
  **views** — if they disagree, fix the canvas (or the markdown if the
  markdown is wrong vs the repo).
- One queue: `roadmap.md` **Now**. One R-id catalog:
  `docs/tech-issues.md`. Never leave the same work item in two task
  files.
- Do not name the hardware vendor or original calculator model
  (`docs/principles.md` **Naming**).
- Do not delete, move, rename, or gitignore-widen `manual.pdf`.
- Do not write a second task list in the README, a canvas, or chat.

## Doc roles (tighten these; do not blur them)

| File | Owns | Must not become |
|------|------|-----------------|
| `roadmap.md` | Scheduled work: Now, phases, vis-*, leftovers, landed | Bug narrative; long how-to |
| `issues.md` | Honesty leftovers + leftover-linked bugs (with Associated id) | Copy of `R*` / `ti-*` |
| `docs/tech-issues.md` | Landed-correctness `R*` / `ti-*` | Honesty policy / menu lies |
| `backlog.md` | Unassigned ideas only | The Now queue |
| `docs/coverage.md` | Feature × manual status (Done/Partial/Missing) | Phase schedule |
| `docs/visual-fidelity-inventory.md` | LCD element audit | Full feature coverage table |
| `docs/principles.md` | Design rules | Task list |
| `README.md` | How to run; short Status pointer to Now | Duplicate full roadmap |
| `AGENTS.md` / `.cursor/rules/*.mdc` | Agent gates | Competing Now |
| `docs/prompts/<id>.md` | One-slice kickoff (or pairing) | Second roadmap |
| `docs/prompts/supervisor.md` | Oversight chat + snapshot (`triage.md` alias) | Implementation |

Historical kickoffs (`docs/prompts/ti-*.md`, `debt-*.md`, landed
`p2-*.md`) may stay for regressions — do not re-open them as Now.

## Workflow

Copy and track:

```
Verify-docs progress:
- [ ] 1. Inventory docs + canvases
- [ ] 2. Ground truth from repo
- [ ] 3. Match markdown to ground truth
- [ ] 4. Consolidate / dedupe
- [ ] 5. Refresh canvases
- [ ] 6. Report
```

### 1. Inventory

List and open (as needed):

- Root: `roadmap.md`, `issues.md`, `backlog.md`, `README.md`, `AGENTS.md`
- `docs/`: `principles.md`, `coverage.md`, `tech-issues.md`,
  `visual-fidelity-inventory.md`, `prompts/supervisor.md`, and any
  kickoff named in **Now**
- `canvases/*.canvas.tsx`
- `.cursor/rules/*.mdc` (must agree with `AGENTS.md` / principles)

### 2. Ground truth from the repo

Do not trust stale Status lines. Spot-check against code and git:

- **Now / packaging / modes:** `roadmap.md` vs what actually runs
  (MODE rows, `package.json` scripts, `dist-desktop/`, Pages workflow).
- **Coverage counts / Done rows:** sample against `src/` and tests
  (`npm test` count if the doc claims a number).
- **Open R-ids / issues:** still open in code or already fixed?
- **Kickoffs named in Now:** file exists; “Do not” / must-do still
  match the slice.
- **Triage snapshot:** if it disagrees with `roadmap.md` **Now**,
  the roadmap wins — update the snapshot.

### 3. Match markdown to ground truth

For each drift:

1. Fix the **owning** file (table above).
2. Update dependents that quote the same fact (Status blurb, triage
   snapshot, coverage Gap) — once, not three competing stories.
3. Prefer checkboxes / one-line status over repeating a paragraph.

### 4. Consolidate (minimize duplication)

Tighten roles; delete or shorten copies:

- Same bug in `issues.md` **and** `docs/tech-issues.md` → keep one
  (R-id → tech-issues; honesty → issues) with Associated id.
- Same “what’s next” in README, triage, roadmap, canvas → **Now**
  table wins; others get a one-line pointer.
- Kickoffs must not restate the whole roadmap — point at **Now** /
  Associated ids.
- Coverage vs visual inventory: behavior status stays in coverage;
  LCD element placement stays in the inventory.
- Remove obsolete “in progress” / wrong test counts / closed leftovers
  still listed as open.
- Do not merge distinct roles into one mega-file.

### 5. Refresh canvases

For every `canvases/*.canvas.tsx` that shows schedule, coverage,
tech-issues, packaging, or validate:

- Re-read the owning markdown after edits.
- Update stats, tables, callouts, and launch prompts so they match.
- Sync the IDE copy under
  `~/.cursor/projects/<workspace>/canvases/` when that file is the
  one Ron opens (same content as repo `canvases/` when both exist).
- Follow the canvas skill when editing `.canvas.tsx` (only
  `cursor/canvas` imports; no empty placeholder sections).
- Caption or secondary text may say “markdown wins if this disagrees.”

### 6. Report

Short reply:

1. What was wrong (drift / duplication).
2. What you fixed (files).
3. What you left (intentional parked items, known open R-ids).
4. Whether canvases were refreshed.

Do not implement features as part of this pass unless Ron asked.

## Out of scope for this skill

- Starting `p3-*`, `p4-tauri` host work, or leftover implementation
- Rewriting principles or Naming
- Touching `manual.pdf`
- Creating a new canvas “dashboard” that replaces `roadmap.md`
