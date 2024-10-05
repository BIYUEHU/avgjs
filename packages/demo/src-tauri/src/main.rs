#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod as_crypt;
mod levels;

use levels::{get_all_levels, get_base_directory, set_levels};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_all_levels,
            set_levels,
            get_base_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
