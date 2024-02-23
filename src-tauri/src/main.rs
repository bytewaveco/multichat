// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::process::{Command, CommandEvent};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_path = app.path_resolver()
            .resource_dir()
            .expect("failed to resolve resource dir");

            let (mut rx, _) = Command::new_sidecar("MultiChat")
            .expect("failed to create `MultiChat` binary command")
            .args(["-d", resource_path.to_str().unwrap()])
            .spawn()
            .expect("Failed to spawn sidecar");

            tauri::async_runtime::spawn(async move {
                // read events such as stdout
                while let Some(event) = rx.recv().await {
                if let CommandEvent::Stdout(line) = event {
                    print!("{}", line);
                }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
