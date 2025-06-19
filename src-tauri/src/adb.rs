use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn adb_command(app: tauri::AppHandle, args: Vec<String>) -> String {
    let sidecar_command = app.shell().sidecar("adb").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
    // read events such as stdout
    let mut result = String::new();
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line_bytes) = event {
            let line = String::from_utf8_lossy(&line_bytes);
            result.push_str(&line);
        }
    }
    result
}
