use crate::as_crypt;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use std::collections::HashMap;
use std::env;
use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::PathBuf;

const LEVELS_CRYPTO_KEY: &str = "きみがこの世界に生まれてきてくれて、本当に、よかった";

struct MisakuraDirectory {
    base_directory: PathBuf,
    levels_directory: PathBuf,
}

fn get_misakura_directory() -> io::Result<MisakuraDirectory> {
    let directory = env::current_dir()?;
    let levels_directory = directory.join("save");
    Ok(MisakuraDirectory {
        base_directory: directory,
        levels_directory: levels_directory,
    })
}

fn initialize_directory(directory: &MisakuraDirectory) -> io::Result<()> {
    if !directory.levels_directory.exists() {
        fs::create_dir(directory.levels_directory.as_path())?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_base_directory() -> Result<String, String> {
    let directory = get_misakura_directory().map_err(|e| e.to_string())?;
    Ok(directory.base_directory.to_string_lossy().to_string())
}

#[tauri::command]
pub fn set_levels(name: &str, png_data: &str, dat_content: &str) -> Result<String, String> {
    let directory = get_misakura_directory().map_err(|e| e.to_string())?;
    initialize_directory(&directory).map_err(|e| e.to_string())?;

    let png_path = directory
        .levels_directory
        .join(format!("level-{}.png", name));
    let dat_path = directory
        .levels_directory
        .join(format!("level-{}.dat", name));

    let decoded_png = STANDARD
        .decode(png_data.replace("data:image/png;base64,", ""))
        .unwrap();
    let mut png_file = File::create(&png_path).map_err(|e| e.to_string())?;
    png_file
        .write_all(&decoded_png)
        .map_err(|e| e.to_string())?;

    let mut dat_file = File::create(&dat_path).map_err(|e| e.to_string())?;
    dat_file
        .write_all(as_crypt::encrypt(dat_content, LEVELS_CRYPTO_KEY).as_bytes())
        .map_err(|e| e.to_string())?;

    Ok("".to_string())
}

#[tauri::command]
pub fn get_all_levels() -> Result<Vec<(String, String, String)>, String> {
    let directory = get_misakura_directory().map_err(|e| e.to_string())?;
    initialize_directory(&directory).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    let entries = fs::read_dir(directory.levels_directory).map_err(|e| e.to_string())?;
    let mut png_files = HashMap::new();
    let mut dat_files = HashMap::new();

    for entry in entries {
        let path = entry.map_err(|e| e.to_string())?.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                let file_stem = path.file_stem().unwrap().to_string_lossy().to_string();
                if ext == "png" {
                    let mut file = File::open(&path).map_err(|e| e.to_string())?;
                    let mut buffer = Vec::new();
                    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
                    let base64_str = format!("data:image/png;base64,{}", STANDARD.encode(&buffer));
                    png_files.insert(file_stem, base64_str);
                } else if ext == "dat" {
                    let mut file = File::open(&path).map_err(|e| e.to_string())?;
                    let mut contents = String::new();
                    file.read_to_string(&mut contents)
                        .map_err(|e| e.to_string())?;
                    dat_files.insert(
                        file_stem,
                        as_crypt::decrypt(contents.as_str(), LEVELS_CRYPTO_KEY)
                            .map_err(|e| e.to_string())?,
                    );
                }
            }
        }
    }

    for (file_stem, png_data) in png_files {
        if let Some(dat_content) = dat_files.remove(&file_stem) {
            let name = file_stem.replace("level-", "");
            results.push((name, png_data, dat_content));
        }
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_levels() {
        set_levels("1", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "test_dat").unwrap();
        set_levels("2", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "test_dat2").unwrap();
        let levels = get_all_levels().unwrap();
        assert_eq!(levels.len() >= 2, true);
    }
}
