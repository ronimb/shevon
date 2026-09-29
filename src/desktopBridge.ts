/** Desktop shell bridge (Electron preload or Tauri shim). */

export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

export function isElectronApp(): boolean {
  return typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
}

/** Electron or Tauri desktop shell — Pin / Close / pane widen chrome. */
export function isDesktopApp(): boolean {
  return isElectronApp() || isTauriApp();
}

/**
 * Install `window.shevonDesktop` under Tauri so Calculator call sites stay
 * the same as Electron. No-op when Electron preload already exposed it.
 */
export async function installShevonDesktopBridge(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.shevonDesktop) return;
  if (!isTauriApp()) return;

  const { invoke } = await import('@tauri-apps/api/core');
  const { getCurrentWindow } = await import('@tauri-apps/api/window');

  window.shevonDesktop = {
    setHistoryOpen: (open) => invoke('set_history_open', { open: !!open }),
    setAlwaysOnTop: (on) => invoke('set_always_on_top', { on: !!on }),
    setBringToFrontAccelerator: (accel) =>
      invoke<boolean>('set_bring_to_front_accelerator', { accel }),
    closeApp: async () => {
      await getCurrentWindow().close();
    },
  };
}
