/**
 * Kill whatever is listening on the Vite dev port (3000).
 * Use when the server was started in an agent terminal you can't find.
 */
import { execSync } from 'node:child_process';

const PORT = process.env.PORT || '3000';

function pidsOnPortWindows(port) {
  try {
    const out = execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`,
      { encoding: 'utf8' },
    );
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s) && s !== '0');
  } catch {
    return [];
  }
}

function pidsOnPortUnix(port) {
  try {
    const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
    });
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const pids =
  process.platform === 'win32' ? pidsOnPortWindows(PORT) : pidsOnPortUnix(PORT);

if (pids.length === 0) {
  console.log(`stop-dev: nothing listening on port ${PORT}`);
  process.exit(0);
}

for (const pid of pids) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'inherit' });
    } else {
      process.kill(Number(pid), 'SIGTERM');
    }
    console.log(`stop-dev: killed pid ${pid} (port ${PORT})`);
  } catch (e) {
    console.error(`stop-dev: failed to kill ${pid}:`, e.message || e);
  }
}
