# `show-keys-size` status

Handoff 1 Oct 2026. Slice is committed on `main`. Ron has not
signed the look yet.

## Landed in this slice

- Shared chip path (`renderKeyRow` in `src/Calculator.tsx`) zooms
  with the unit scale, clamped so a large window stays near full
  size and a tiny window stays readable. Live strip and History
  Show Keys use that same zoom.
- Numpad chips: darker cap, tighter radius, light legend in the
  upper part of the cap (`.mini-btn.num` / `.shape-numpad` in
  `src/index.css`). Both surfaces.
- Live strip: no “CURRENT KEYS” label, shorter gap above the chips.
  While the strip is open, **Hide keys** and **More** stay hidden
  until the top bar is hovered.
- History entry text is 12px. A long line uses a 2px overlay thumb
  (`.history-expr-thumb`), not a thick bar. History Load (`R26`)
  was not changed.
- SHIFT/ALPHA hold was not changed (`comp-keys` / G14.1).

Checked in the browser: 1280×720 chip zoom about 0.64 (matches the
face key); 1920×1080 zoom about 0.98 and the unit still fits.
`sin(30)` on the LCD is `1/2` (degree natural form of 0.5).
`npm test` 180 passed. `npm run lint` green.

## Docs

`roadmap.md` `show-keys-size` is checked. `issues.md`
`show-keys-size`, `show-keys-face`, and `hist-scroll` are closed.
**Now** is `p3-cmplx` (Phase 3; no kickoff file yet — the phase
section in `roadmap.md` is the spec). Next pairing sitting is
**G2** (`docs/prompts/validate-unit.md`).

## Still open for Ron

Accept chip size, numpad face, strip chrome, and History text /
scrollbar on the ~13" machine or a narrow window. If he rejects a
part, reopen that issue; do not start `p3-cmplx` in the same chat.

## Left untracked

- `src/calculator_old.png`
- `tmp_manual_scan.py`

Not part of this slice.
