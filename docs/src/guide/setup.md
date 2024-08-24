# Setup

## Environment

- Cargo 1.51+
- Rust 1.51+
- Node.js 14+
- Pnpm 8+

## Install

Misakura has many package name, so you can choose one you like:

```bash
pnpm install misakura
pnpm install avgjs
pnpm install galjs
```

## Structure

- `my-visual-novel`
  - `public` Static files and misakura scripts files
    - `audio`
      - `music` Music files
      - `sound` Sound effect files
      - `voice` Characters voice files
    - `fonts` Font files
    - `images`
      - `background` Background images
      - `figure` Character images
    - `scripts` Misakura scripts files
    - `videos` Video files
    - `misakura.svg` Logo file
  - `src` TypeScript source code
    - `styles`
    - `index.tsx` Loading file of the dom
    - `main.ts` Entry file of the game
  - `src-tauri` Rust source code
    - `icons` Icon files
    - `src` Rust source code
    - `tauri.conf.json` Configuration file of the Rust code
    - `Cargo.toml` Package information
  - `package.json` Package information
  - `index.html` HTML template file
  - `README.md` Readme file
  - `.gitignore` Git ignore file
  - `tsconfig.json` TypeScript configuration file

## Visual Studio Code Extension

Search for `Misakura Script` in the Extensions tab of Visual Studio Code.That will get syntax highlighting for Misakura scripts.

![extension](https://pic.imgdb.cn/item/66c9c0f1d9c307b7e94f2666.png)

## Coding

**src/main.ts**:

```typescript
import Misakura from 'misakura'
import * as styles from './styles'

function main() {
  const ctx = new Misakura({ entry: 'complex', styles })

  ctx.start()
  return ctx
}

export default main
```

**src/index.tsx**:

```tsx
/* @refresh reload */
import { render } from 'solid-js/web'
import './styles/index.css'
import main from './main'

function App() {
  return <>{main()}</>
}

const root = document.getElementById('root')
render(() => <App />, root as HTMLElement)
```

**src-tauri/src/main.rs**:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust and love of Misakura!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

```

## Write Scripts

**public/scripts/main.mrs**:

![script](https://pic.imgdb.cn/item/65f832d29f345e8d0328d459.png)
