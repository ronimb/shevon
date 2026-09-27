# Kickoff — `p4-tauri` (small Windows exe)

Copy everything below the line into a **new agent chat**. One slice.
Do not start this until `p4-packaging` is checked in `roadmap.md`.
Do not start Phase 3 leftovers, LineIO, or `p4-exact` here.

---

Follow `docs/principles.md` (especially **Naming**). Sources:
`roadmap.md` Phase 4 `p4-tauri`, `docs/coverage.md` Platform.
Update those files and `roadmap.md` **Now** in the same change.
Refresh canvases if the story changed. Afterward run
[`sanity-landed.md`](sanity-landed.md) as a COMP/STAT/EQN smoke —
the wrapper must not regress the unit.

You are **replacing the desktop shell**, not the calculator.
`p4-packaging` already ships a ~100 MB Electron portable
(`dist-desktop/Shevon.exe`). That size is Chromium. Ron will not
keep that as the daily exe. Target: a Windows `.exe` that uses
WebView2 (Tauri) and stays in the tens of MB.

**Iterate with Ron.** Inventory first, then one working Tauri
window, then port the three desktop APIs, then stop so he can
launch it. Do not change calculator keys, modes, or EVAL.

## Must do

1. **Inventory.** Confirm `npm test` / `npm run lint` stay green.
   List the Electron-only files (`electron-main.cjs`,
   `electron-preload.cjs`, `package.json` `build`,
   `window.shevonDesktop` in `src/Calculator.tsx`). Do not invent
   a second web stack — keep Vite `dist/`.
2. **Tauri host.** Add the Rust/Tauri side. Load the same
   production `dist/` the Electron exe used. Title **Shevon**.
   Same local icon (`public/icons/icon.png`). No hardware-vendor
   name or art.
3. **Desktop APIs.** Port the existing calls only:
   History widen, always-on-top, bring-to-front shortcut.
   Frameless chrome stays above the unit (Show keys / History
   never on the face).
4. **Ron launches.** Produce a Windows exe. He runs `sin(30)`
   (still 0.5) and a short STAT / EQN look. WebView2 is not
   Chromium — fix layout only if the unit actually breaks.
5. **Docs.** Coverage Platform row records the small exe.
   `p4-packaging` stays the Electron slice (historical).
   Check `p4-tauri` only after Ron has launched it.

## Do not

- Start this while `p4-packaging` is still Now.
- Start Phase 3 (`p3-*`), `p4-exact`, `p4-samples`, LineIO, or
  `setup-page2` chrome.
- Change COMP / STAT / EQN “while you’re in there.”
- Name the hardware vendor or original model.
- Delete, move, or gitignore-widen `manual.pdf`.
- `Read` `src/calculator_new.png` or `public/icons/*.png`.
- Keep shipping the 100 MB Electron portable as the answer.

## Done when

- Ron has launched a Tauri/WebView2 exe that is much smaller
  than `Shevon.exe` (~100 MB).
- `sin(30)` is 0.5. `npm test` / `npm run lint` still green.
- `roadmap.md` `p4-tauri` is checked. Coverage names the small
  exe. Electron may remain as a fallback script, but it is not
  the daily wrapper.
