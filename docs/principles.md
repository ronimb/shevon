# Design principles

These rules apply to every feature, mode, and phase. Agents must follow them
when implementing, reviewing, or claiming something is done.

The hardware manual `manual.pdf` is the **behavior spec**. Manual
page references (e.g. `E-16`) appear in code and tests.

---

## Naming

Do not name the hardware vendor or the original calculator model in
source, comments, docs, canvases, filenames, commit messages, or chat.
Say **the hardware**, **the unit**, **the manual**, or **Shevon**. The
local spec file is `manual.pdf` — do not delete, move, or rename it.
Golden tests live in `src/manual.golden.test.ts`.

---

## Match function behavior

Shevon is a hardware overlay emulator, not a generic scientific
calculator.

- Every key, menu, and mode must do what the hardware does — or be **explicitly
  disabled**. Never fake a plausible result.
- Never dump literal function text (`ENG`, `hyp`, `abs(`) onto the LCD where
  the unit shows a symbol, a template, or a menu.
- Numeric methods and result forms should match the unit to displayed
  precision (see Phase 1 numerics and Phase 4 exact forms in
  [`roadmap.md`](../roadmap.md)).
- Acceptance tests are the numbered sample operations in the manual.

## Visual fidelity

Not pixel-perfect mimicry. Browser fonts and HTML rendering are fine, and we
can use technical advantages (show more at once, a side history pane) as long
as the calculator face stays stylistically close to the hardware.

The bar for every screen:

1. **Elements** — every indicator, caption, label, and result form the unit
   shows is present.
2. **Placement / role** — those elements sit in the hardware’s position and
   play the same role (e.g. EQN quadratic: `a` / `b` / `c` labels; active
   number entry at the bottom-left).
3. **Behavior** — the same key sequence produces the same kind of result or
   error.

Use the manual figures and a photo as the **element and behavior checklist**,
not as a pixel reference. Pixel-exact LCD font is out of scope until after
Phase 3 (see roadmap).

Inventory: [`visual-fidelity-inventory.md`](visual-fidelity-inventory.md).
Cross-cutting work: `vis-*` items in [`roadmap.md`](../roadmap.md).

## Honesty over chrome

A MODE / SETUP / STAT / EQN menu row that cannot run must not silently fall
through to COMP. Prefer an explicit not-implemented path over a lie.

## Definition of done

A feature is done when it passes an **element + behavior** check against the
manual figure: same elements, same placement/role, same behavior.
Pixel-exactness is not required.

Do not claim a phase or feature complete without updating
[`roadmap.md`](../roadmap.md) (and [`issues.md`](../issues.md) or
[`docs/tech-issues.md`](tech-issues.md) if a defect closed).
