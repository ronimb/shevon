use std::sync::Mutex;

use tauri::{AppHandle, Manager, State, WebviewWindow};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

const CHROME_H: f64 = 40.0;
const CALC_W: f64 = 504.0;
const CALC_H: f64 = 1000.0;
const HISTORY_EXTRA: f64 = 382.0;

struct DesktopState {
  history_open: bool,
  always_on_top: bool,
  bring_accel: Option<String>,
}

impl Default for DesktopState {
  fn default() -> Self {
    Self {
      history_open: false,
      always_on_top: false,
      bring_accel: None,
    }
  }
}

fn main_window(app: &AppHandle) -> Option<WebviewWindow> {
  app.get_webview_window("main")
}

fn apply_base_size(window: &WebviewWindow) -> (f64, f64) {
  let scale = if let Ok(Some(monitor)) = window.current_monitor() {
    let size = monitor.work_area().size;
    let scale_factor = monitor.scale_factor();
    let work_w = size.width as f64 / scale_factor;
    let work_h = size.height as f64 / scale_factor;
    (1.0_f64)
      .min((work_h - CHROME_H) / CALC_H)
      .min(work_w / CALC_W)
  } else {
    1.0
  };
  let width = (CALC_W * scale).max(320.0);
  let height = (CHROME_H + CALC_H * scale).max(360.0);
  let _ = window.set_size(tauri::LogicalSize::new(width, height));
  (width, height)
}

fn toggle_window(app: &AppHandle, always_on_top: bool) {
  let Some(win) = main_window(app) else {
    return;
  };
  let visible = win.is_visible().unwrap_or(false);
  let minimized = win.is_minimized().unwrap_or(false);
  let focused = win.is_focused().unwrap_or(false);
  let up = visible && !minimized;
  let in_front = focused || always_on_top;
  if up && in_front {
    let _ = win.hide();
    return;
  }
  if minimized {
    let _ = win.unminimize();
  }
  let _ = win.show();
  let _ = win.set_focus();
}

fn normalize_accel(accel: &str) -> String {
  // Electron uses CommandOrControl; global-shortcut on Windows wants Ctrl.
  accel.replace("CommandOrControl", "Ctrl")
}

#[tauri::command]
fn set_history_open(
  app: AppHandle,
  state: State<'_, Mutex<DesktopState>>,
  open: bool,
) -> Result<(), String> {
  let mut st = state.lock().map_err(|e| e.to_string())?;
  if open == st.history_open {
    return Ok(());
  }
  let Some(win) = main_window(&app) else {
    return Ok(());
  };
  let size = win.outer_size().map_err(|e| e.to_string())?;
  let pos = win.outer_position().map_err(|e| e.to_string())?;
  let scale = win.scale_factor().unwrap_or(1.0);
  let mut width = size.width as f64 / scale;
  let height = size.height as f64 / scale;
  let mut x = pos.x as f64 / scale;
  let y = pos.y as f64 / scale;

  if open {
    width += HISTORY_EXTRA;
    if let Ok(Some(monitor)) = win.current_monitor() {
      let work = monitor.work_area();
      let work_x = work.position.x as f64 / scale;
      let work_w = work.size.width as f64 / scale;
      if x + width > work_x + work_w {
        x = (work_x + work_w - width).max(work_x);
      }
    }
    win
      .set_position(tauri::LogicalPosition::new(x, y))
      .map_err(|e| e.to_string())?;
    win
      .set_size(tauri::LogicalSize::new(width, height))
      .map_err(|e| e.to_string())?;
    st.history_open = true;
  } else {
    width = (width - HISTORY_EXTRA).max(320.0);
    win
      .set_size(tauri::LogicalSize::new(width, height))
      .map_err(|e| e.to_string())?;
    st.history_open = false;
  }
  Ok(())
}

#[tauri::command]
fn set_always_on_top(
  app: AppHandle,
  state: State<'_, Mutex<DesktopState>>,
  on: bool,
) -> Result<(), String> {
  let mut st = state.lock().map_err(|e| e.to_string())?;
  let Some(win) = main_window(&app) else {
    return Ok(());
  };
  win.set_always_on_top(on).map_err(|e| e.to_string())?;
  st.always_on_top = on;
  Ok(())
}

#[tauri::command]
fn set_bring_to_front_accelerator(
  app: AppHandle,
  state: State<'_, Mutex<DesktopState>>,
  accel: String,
) -> Result<bool, String> {
  if accel.trim().is_empty() {
    return Ok(false);
  }
  let normalized = normalize_accel(&accel);
  let mut st = state.lock().map_err(|e| e.to_string())?;
  if st.bring_accel.as_deref() == Some(normalized.as_str()) {
    return Ok(true);
  }

  if let Some(prev) = st.bring_accel.take() {
    let _ = app.global_shortcut().unregister(prev.as_str());
  }

  let shortcut: Shortcut = normalized
    .parse()
    .map_err(|e| format!("invalid shortcut {normalized}: {e}"))?;

  let app_handle = app.clone();
  app
    .global_shortcut()
    .on_shortcut(shortcut, move |app, _shortcut, event| {
      if event.state != ShortcutState::Pressed {
        return;
      }
      let on_top = app
        .state::<Mutex<DesktopState>>()
        .lock()
        .map(|g| g.always_on_top)
        .unwrap_or(false);
      toggle_window(&app_handle, on_top);
    })
    .map_err(|e| e.to_string())?;

  st.bring_accel = Some(normalized);
  Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .manage(Mutex::new(DesktopState::default()))
    .invoke_handler(tauri::generate_handler![
      set_history_open,
      set_always_on_top,
      set_bring_to_front_accelerator
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      if let Some(window) = main_window(app.handle()) {
        let _ = apply_base_size(&window);
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
