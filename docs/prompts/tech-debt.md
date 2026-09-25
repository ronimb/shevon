# Tech-debt program — index

One slice per **new agent chat**. Do not mix slices. Markdown is the source
of truth: `roadmap.md` **Now**.

| Order | Id | Prompt to copy | After |
|-------|----|----------------|-------|
| 0 | (landed) | `p2-solve` / `CalcError` | — |
| A | (landed) | `debt-source-map` | — |
| B | (landed) | `debt-shell` | — |
| C | (landed) | `debt-value` | — |
| — | sanity | [`sanity-landed.md`](sanity-landed.md) | after every slice |

Then remaining Phase 2 (`p2-edit` …), then `p4-packaging`. Phase 3 stays
gated. LineIO / 99-byte / `:` are **not** this program.

Copy **only** the slice file (everything below its line) into the new chat.

Rules for every slice: one chat, one id, update `roadmap.md` / `issues.md`
in the same change, then run `sanity-landed.md`. Do not invent a parallel
plan. Chat markdown links often do nothing on Windows — use Ctrl+P or the
tech-debt canvas buttons.
---

Follow `docs/principles.md` and `roadmap.md` Now. Slices A–C have landed.
Do not start remaining Phase 2, packaging, or Phase 3 from a debt chat.
