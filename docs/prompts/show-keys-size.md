# Kickoff — `show-keys-size` (scale Show keys chips)

Copy everything below the line into a **new agent chat**. One slice.
Run after `p4-tauri` (or when Ron pulls it forward). Before Phase 3.
Pairing confirm is validate-unit **G14** after G1.

---

Follow `docs/principles.md` (especially **Naming**). Sources:
`roadmap.md` Emulator extras `show-keys-size`, `issues.md`
`show-keys-size`, `src/historyKeys.tsx`, chip CSS (`.mini-btn` /
Current keys strip in `Calculator.tsx` / `index.css`). Update those
files in the same change. Refresh canvases if the story changed.
Afterward smoke [`sanity-landed.md`](sanity-landed.md) — do not
regress COMP / STAT / EQN.

You are **sizing the Show keys / Current history chips**, not
changing calculator modes or the History sequence contract.
Chips look fine on a large monitor (~23") and oversized on a ~13"
laptop (same Vite UI in Electron and Tauri). Scale with window /
DPI / available strip height so glyphs stay readable without
dominating the face. Live strip and History pane “Show Keys” must
match.

**Iterate with Ron** on the laptop (or a narrow window). Stop when
he says the strip looks right.

## Must do

1. Inventory current chip sizing (fixed px/rem vs faceplate overlay
   scale). Prefer one shared scale path for live strip + History
   Show Keys.
2. Make chips shrink on small viewports / short chrome strips; keep
   usable on large screens.
3. Ron checks Show keys on the ~13" machine (or resized window):
   strip usable, unit still fully visible, `sin(30)` still 0.5.
4. Close `issues.md` `show-keys-size` and check the roadmap id only
   after that check.

## Do not

- Start Phase 3, LineIO, `hist-letters`, or `p4-exact`.
- Change COMP / STAT / EQN EVAL or faceplate hitboxes.
- Name the hardware vendor or original model.
- Touch `manual.pdf`.
- `Read` overlay / icon PNGs into chat.

## Done when

- Ron accepts chip size on the small screen.
- `npm test` / `npm run lint` green.
- `roadmap.md` `show-keys-size` checked; issue closed; **Now**
  advances (Phase 3 or whatever Ron queued next).
