# Documentation map

**Markdown is the only source of truth.** Agents and Ron read these
files — not canvases — for queue, pairing, and bugs.

| When you need… | Open |
|----------------|------|
| What to do **next** | [`../roadmap.md`](../roadmap.md) **Now** |
| Design rules / Naming | [`principles.md`](principles.md) |
| Open honesty leftovers | [`../issues.md`](../issues.md) |
| Open / closed `R*` | [`tech-issues.md`](tech-issues.md) |
| Ideas not scheduled | [`../backlog.md`](../backlog.md) |
| Feature vs manual | [`coverage.md`](coverage.md) |
| LCD chrome audit | [`visual-fidelity-inventory.md`](visual-fidelity-inventory.md) |
| Agent gates | [`../AGENTS.md`](../AGENTS.md) |

## Pairing (form + function)

| Role | File |
|------|------|
| Cadence + all group tables (G1–G15) | [`prompts/validate-unit.md`](prompts/validate-unit.md) |
| Cursor (tested / next / do-not-refile) | [`prompts/validate-status.md`](prompts/validate-status.md) |
| **This sitting** kickoff | Named in `roadmap.md` **Now** (none scheduled) |
| After sitting → fix | Separate `*-resolve.md` when supervisor writes it |

Ron runs unit + Shevon. Agent: one case = one prompt; **findings only**.

## Agent chat types

| Chat | Kickoff | May change code? |
|------|---------|------------------|
| Supervisor / triage | [`prompts/supervisor.md`](prompts/supervisor.md) | Docs only |
| Pairing | `prompts/<group>-pair.md` or validate-unit | **No** |
| Resolve / slice | `prompts/<id>.md` named in **Now** | Yes |
| Doc audit | [`.cursor/skills/verify-docs/SKILL.md`](../.cursor/skills/verify-docs/SKILL.md) | Docs / optional canvases |

## Historical (do not re-open as Now)

Landed kickoffs under `prompts/` (`g1-resolve` … `g8-resolve`,
`g2-pair` … `g8-pair`, `p2-*`, `ti-*`, `debt-*`, `show-keys-size`,
…). Keep for regressions. Status: **landed** or **historical** in
the file header.

Stale handoff logs (not the queue):

- [`show-keys-size-status.md`](show-keys-size-status.md)
- [`p4-tauri-agent-log.md`](p4-tauri-agent-log.md)

## Canvases

[`../canvases/README.md`](../canvases/README.md) — **optional**, often
unusable in the IDE. Agents must **not** update canvases on ordinary
handoffs. Prefer this map + the table above.

## One fact, one home

- Queue → `roadmap.md` only (README / supervisor point at **Now**).
- Each `R*` → `tech-issues.md` only (not also `issues.md`).
- Pairing progress → `validate-status.md` (not a second table in chat).
