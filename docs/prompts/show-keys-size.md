# Kickoff — G14 resolution (`show-keys-size`)

Copy everything below the line into a **new agent chat**. One slice.
This is the **issue-resolution** chat after the G14 pairing sitting
in [Validate unit documentation](4fbb9cb3-f9d5-4048-a8bd-e98650315fcc).
Not a validation sitting. Before Phase 3. Do not start Phase 3,
LineIO, or `p4-exact`.

---

Follow `docs/principles.md` (especially **Naming**). Sources:
`roadmap.md` Emulator extras `show-keys-size`, `issues.md`
`show-keys-size`, `show-keys-face`, and `hist-scroll`,
`src/historyKeys.tsx`, chip CSS (`.mini-btn`), Current keys strip
and History pane in `Calculator.tsx` / `index.css`. Update those
files in the same change. Refresh canvases if the story changed.
Afterward smoke [`sanity-landed.md`](sanity-landed.md) — do not
regress COMP / STAT / EQN.

G14 sitting (30 Sep 2026) logged these. Close all three. G14.1
passed: SHIFT and ALPHA hold (active while pressed, release
clears) is the desired behavior and the current behavior. Do not
change it. G14.5 exe chrome passed.

## Must do

1. **`show-keys-size`** — Chips are oversized on a ~13" laptop (fine
   on ~23"). Same Vite UI in Electron and Tauri. Scale with window /
   DPI / available strip height so glyphs stay readable without
   dominating the face. Apply the **same** scale to:
   - the live Show keys strip, and
   - History pane Show Keys chips.
   Large screens must stay usable, not tiny.
   G14.3: tighten the live strip’s vertical chrome. Shrink the empty
   band above the chips. Drop the “CURRENT KEYS” label. While the
   strip is open, hide **Hide keys** and **More** until hover.
2. **`show-keys-face`** (G14.2) — Numpad chips must tighten toward
   the faceplate key art. Digit `6`: chip today is a wide light-gray
   rounded rect with a bold black digit centered; the face key is
   darker, tighter radius, light digit in the upper part of the cap.
   Same family for the other number-pad chips. Do this on both
   surfaces, not only the live strip.
3. **`hist-scroll`** (G14.4) — History pane entry text is a bit
   large. Shrink it so a scrollbar is rare. When one is required,
   use a thin overlay, not the thick light bar that sits on the
   expression (seen under `sinh(` on entry #1). History Load behavior
   (`R26`) stays.
4. Prefer one shared chip path for live strip + History Show Keys.
5. Ron checks both chip surfaces and the History list on the ~13"
   machine (or a narrow window): size acceptable, numpad chips
   closer to the face, strip chrome tighter, scrollbar rare/thin,
   unit still fully visible, `sin(30)` still 0.5.
6. Close `issues.md` `show-keys-size`, `show-keys-face`, and
   `hist-scroll`, and check the roadmap id, only after that check.

## Do not

- Implement inside a validate-unit chat.
- Start Phase 3, LineIO, `hist-letters`, `comp-keys`, or `p4-exact`.
  Do not change SHIFT/ALPHA hold.
- Change COMP / STAT / EQN EVAL, the History sequence contract, or
  faceplate hitboxes.
- Name the hardware vendor or original model.
- Touch `manual.pdf`.
- `Read` overlay / icon / unit PNGs into chat (provider 400 risk).

## Done when

- Ron accepts chip size, chip face, strip chrome, and History text /
  scrollbar.
- `npm test` / `npm run lint` green.
- `roadmap.md` `show-keys-size` checked; the three issues closed;
  **Now** advances to Phase 3 (or whatever remains).
