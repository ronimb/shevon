import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // loadEnv('', …) so DISABLE_HMR / ENABLE_HMR from .env apply to
  // this config (plain process.env often misses them at config time).
  const env = loadEnv(mode, process.cwd(), '');
  // Default HMR off (agent edits were bobbing the app). Solo coding
  // with hot reload: set ENABLE_HMR=true in .env and restart.
  const hmrOn = env.ENABLE_HMR === 'true';

  return {
    plugins: [react(), tailwindcss()],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: hmrOn,
      watch: {
        ignored: [
          '**/src-tauri/**',
          '**/docs/**',
          '**/canvases/**',
          '**/.cursor/**',
          '**/agent-transcripts/**',
          '**/dist-desktop/**',
          '**/dist/**',
          '**/.git/**',
          '**/node_modules/**',
          '**/*.md',
          '**/*.mdc',
        ],
      },
    },
  };
});
