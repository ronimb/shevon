/**
 * After `tauri build`, copy the release Windows exe to
 * dist-desktop/Shevon.exe (daily portable path).
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join('dist-desktop');
const OUT_EXE = path.join(OUT_DIR, 'Shevon.exe');

function candidates() {
  const list = [
    path.join('src-tauri', 'target', 'release', 'shevon.exe'),
    path.join('src-tauri', 'target', 'release', 'Shevon.exe'),
  ];
  const cargoTarget = process.env.CARGO_TARGET_DIR;
  if (cargoTarget) {
    list.unshift(
      path.join(cargoTarget, 'release', 'shevon.exe'),
      path.join(cargoTarget, 'release', 'Shevon.exe'),
    );
  }
  return list;
}

function walkFind(root, depth, found) {
  if (depth < 0 || !fs.existsSync(root)) return;
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(root, ent.name);
    if (ent.isFile() && ent.name.toLowerCase() === 'shevon.exe' && full.includes(`${path.sep}release${path.sep}`)) {
      found.push(full);
    } else if (ent.isDirectory() && ent.name !== 'node_modules' && ent.name !== '.git') {
      walkFind(full, depth - 1, found);
    }
  }
}

function pickSource() {
  for (const p of candidates()) {
    if (fs.existsSync(p)) return p;
  }
  const found = [];
  const localApp = process.env.LOCALAPPDATA;
  if (localApp) {
    walkFind(path.join(localApp, 'Temp', 'cursor-sandbox-cache'), 8, found);
  }
  walkFind(path.join('src-tauri', 'target'), 4, found);
  if (found.length === 0) return null;
  found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return found[0];
}

const src = pickSource();
if (!src) {
  console.error('copy-tauri-exe: could not find release shevon.exe');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.copyFileSync(src, OUT_EXE);
const mb = (fs.statSync(OUT_EXE).size / (1024 * 1024)).toFixed(1);
console.log(`copy-tauri-exe: ${src} → ${OUT_EXE} (${mb} MB)`);
