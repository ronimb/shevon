interface ShevonDesktop {
  setHistoryOpen: (open: boolean) => Promise<void>;
  setAlwaysOnTop: (on: boolean) => Promise<void>;
  setBringToFrontAccelerator: (accel: string) => Promise<boolean>;
  /** Quit the desktop shell. Present on Tauri; Electron uses window.close(). */
  closeApp?: () => Promise<void>;
}

interface Window {
  shevonDesktop?: ShevonDesktop;
  __TAURI_INTERNALS__?: unknown;
  __TAURI__?: unknown;
}

declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}
