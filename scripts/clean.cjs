const fs = require('fs');

for (const dir of ['dist', 'dist-desktop']) {
  fs.rmSync(dir, { recursive: true, force: true });
}
