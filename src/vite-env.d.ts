interface ShevonDesktop {
  setHistoryOpen: (open: boolean) => Promise<void>;
  setAlwaysOnTop: (on: boolean) => Promise<void>;
  setBringToFrontAccelerator: (accel: string) => Promise<boolean>;
}

interface Window {
  shevonDesktop?: ShevonDesktop;
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
