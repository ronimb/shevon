# Kickoff — `p4-packaging` (Pages / PWA / portable exe / icon)

**Landed 29 Sep 2026.** Do not re-open. Pages skipped; exe
verified. Next implementation is [`p4-tauri.md`](p4-tauri.md).
Historical kickoff text below is kept for regressions.

Copy everything below the line into a **new agent chat** only if
re-verifying packaging. One slice. Phase 2 is in. Do not start
Phase 3, LineIO, or `p4-exact`.

---

Follow `docs/principles.md` (especially **Naming**). Sources:
`roadmap.md` Phase 4 `p4-packaging`, `docs/coverage.md` Platform
Electron + Pages + PWA, `README.md` scripts. Update those files and
`roadmap.md` **Now** in the same change. Refresh canvases if the
story changed. Afterward run [`sanity-landed.md`](sanity-landed.md)
only as a COMP/STAT/EQN smoke — packaging must not regress the unit.

You are **verifying and finishing shipping**, not adding modes.
Scripts already exist (`deploy`, `build:exe`, Pages workflow).
`public/icons/` PNGs already exist — **reuse them**. Do not `Read`
`src/calculator_new.png` or those PNGs into the chat (provider 400).
Tab / manifest / Electron already use the local Shevon lettermark;
title is Shevon; portable exe is `dist-desktop/Shevon.exe`.

**Iterate with Ron.** Finish one must-do, stop, let him try that
surface, then take the next. Do not silently ship all four in one
push. Do not change calculator keys, modes, or EVAL.

## Must do

1. **Inventory first.** Confirm `npm run build`, `npm test`, and
   `npm run lint` stay green. List what is missing vs this kickoff
   (wired icon, CDN manifest, exe, Pages). Do not invent a second
   deploy stack. Skip a full re-inventory if those three are still
   green and `public/icons/` already has the PNGs.
2. **Real local icon.** Wire one Shevon icon into the tab, PWA
   manifest, and Electron/exe. No CDN. No hardware-vendor art.
   If `public/icons/icon.png` is already there, point
   `index.html`, `public/manifest.json`, and `electron-builder`
   `win.icon` at it and stop so Ron can check the tab. Only cut a
   new square from `src/calculator_new.png` if that file is
   missing. Measure with System.Drawing / file size — never `Read`
   the overlay or generated PNGs.
3. **PWA install is skipped.** Ron will not use Add to Home
   Screen. Do not wait on an install walk. Do not add a service
   worker to force Chrome’s install button. If the manifest still
   has a CDN icon or a generic name, point it at the local Shevon
   icon and `start_url` `./` — that is enough. Then go to the exe.
4. **Portable exe.** `npm run build:exe` produces a runnable
   portable `.exe` in `dist-desktop/` with that icon. Ron launches
   it. COMP `sin(30)` still 0.5.
5. **Pages.** Keep the existing workflow or `npm run deploy` — one
   path. Ron opens the live URL and confirms the unit loads. Do not
   force-push or change `manual.pdf`.

## Do not

- Start Phase 3 (`p3-*`), `p4-tauri`, `p4-exact`, `p4-samples`,
  LineIO, or `setup-page2` chrome.
- Change COMP / STAT / EQN behavior “while you’re in there.”
- Name the hardware vendor or original model (chrome, exe, commit,
  README).
- Delete, move, or gitignore-widen `manual.pdf`.
- Pull a third-party calculator icon from the web.
- `Read` `src/calculator_new.png` or `public/icons/*.png` (embeds
  the image; Cursor then 400s the rest of the chat).
- Ask Ron to install / Add to Home Screen. That walk is skipped.

## Files

- `public/manifest.json`, `index.html` — PWA / title / local icon
- `electron-main.cjs`, `package.json` `build` — exe + icon
- `public/icons/` (or equivalent) — local icon assets
- `.github/workflows/deploy.yml` — only if Pages is broken
- `README.md` — Status (Phase 2 closed; packaging)
- `docs/coverage.md` Platform row, `roadmap.md` `p4-packaging`

## Done when

- Ron has tried: local icon in the tab, portable exe launch, and
  Pages only if a live desktop URL is wanted. PWA install is not
  a gate.
- `npm test` / `npm run lint` still green. `sin(30)` still 0.5 in
  the exe (or Pages, if that surface is in).
- Coverage Platform row stays Partial until the exe (and Pages,
  if wanted) actually work. `roadmap.md` `p4-packaging` checked
  only then. **Now** empties (or names Phase 3) only if this
  slice is in.
