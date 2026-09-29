# `p4-tauri` agent work log

Private to the **p4-tauri** implementation chat. Do **not** merge
findings into `issues.md` or `docs/tech-issues.md` until cutover /
Ron asks — avoids collisions with other agents.

## Status: **complete** (29 Sep 2026)

Ron signed Phase E. Phase F cutover applied.

| Phase | Result |
|-------|--------|
| A Prerequisites | pass |
| B Edge WebView2 gate | pass (Ron) |
| C Minimal Tauri host | pass (~10 MB) |
| D Desktop APIs | pass (Pin/Close/More/shortcut) |
| E Full verification | pass (Ron) |
| F Docs + cutover | pass |

### Cutover

- Daily: `npm run build:exe` → Tauri → `dist-desktop/Shevon.exe` (~10.1 MB)
- Fallback: `npm run build:exe:electron` → `Shevon-electron.exe`
- Fat Electron exe untracked from git index (`git rm --cached`)
- Now queue → `show-keys-size`

### Size

| Artifact | MB |
|----------|-----|
| Tauri `Shevon.exe` | ~10.1 |
| Electron (legacy) | ~95 |

## Issues found (this slice only)

- Rust missing at start — installed via winget rustup
- Cargo target under cursor sandbox cache — `scripts/copy-tauri-exe.mjs` copies to `dist-desktop/`
- Identifier `.app` warning — use `com.shevon.desktop`
- Phase C missing Pin/Close — fixed in D via `isDesktopApp`

## Decisions

- Soft cutover after Phase E (Ron). Electron kept as fallback script only.
