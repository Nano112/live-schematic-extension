<p align="center">
  <img src="media/icon.png" width="96" height="96" alt="Live Schematic Viewer icon">
</p>

<h1 align="center">Live Schematic Viewer</h1>

<p align="center">
  Hot-reloading viewer for Minecraft <code>.schem</code>,
  <code>.litematic</code>, <code>.nbt</code>, and
  <code>.mcstructure</code> files in VS Code. Powered by
  <a href="https://github.com/Schem-at/Nucleation">Nucleation</a>.
</p>

---

Open any supported schematic and the extension's webview meshes it
through Nucleation's WASM build, hands the resulting GLB to three.js,
and re-renders the moment the file changes on disk. No webserver, no
polling.

## Supported file types

- `.schem` (WorldEdit / Sponge)
- `.litematic` (Litematica)
- `.nbt` (Minecraft structure block format)
- `.mcstructure` (Bedrock structure block format)

## Setup

The viewer needs a Minecraft resource pack to texture the mesh. The
simplest source is the vanilla client jar (it is a normal zip):

1. Locate a Minecraft client jar — e.g.
   `~/Library/Application Support/minecraft/versions/1.21.4/1.21.4.jar`
   on macOS, or any vanilla resource-pack zip.
2. Open VS Code's settings (`⌘,`) and set
   **`liveSchematic.resourcePack`** to that path.
3. Open a supported file. The custom editor activates automatically.

Optional: layer additional packs on top via
`liveSchematic.extraResourcePacks` (later entries win, like Minecraft
load order).

## Hot reload

The extension watches the open file (or all matching files when you
run **Live Schematic: Open Viewer** on the workspace). Save the file
in another editor, build a new schematic from CLI, drop a fresh export
into your workspace — the viewer re-meshes and re-renders without
reloading the panel.

Camera state is persisted per-file across reloads. Pass
`liveSchematic.autoFrameOnReload: true` to re-frame on every change
instead.

## Settings

| Key | Default | Notes |
|---|---|---|
| `liveSchematic.resourcePack` | `""` | Path to a vanilla jar / pack zip. Required for textured rendering. |
| `liveSchematic.extraResourcePacks` | `[]` | Layered packs (later entries override earlier). |
| `liveSchematic.backgroundColor` | `""` | CSS hex; empty = match VS Code editor background. |
| `liveSchematic.gridEnabled` | `true` | Show ground grid by default. |
| `liveSchematic.gridSize` | `32` | Grid extent in world units. |
| `liveSchematic.axesEnabled` | `false` | Show XYZ axes helper. |
| `liveSchematic.statsEnabled` | `false` | FPS / draw-call overlay. |
| `liveSchematic.tickMs` | `50` | Animated-texture tick (Minecraft = 50). |
| `liveSchematic.autoFrameOnReload` | `false` | Re-frame the camera on every reload. |
| `liveSchematic.excludeGlobs` | `["**/node_modules/**", "**/.git/**", "**/dist/**", "**/out/**"]` | Skip these when scanning the workspace. |

## Development

```sh
npm install
npm run watch          # esbuild rebuilds on change; copies the
                       # nucleation .wasm next to the bundled JS
```

Press `F5` in VS Code to launch an Extension Development Host with
the extension loaded. Open any supported file, set the resource pack,
and edit it externally to see hot reload in action.

## How it works

```
┌──────────────┐   file change   ┌──────────────┐
│ extension.ts │ ───────────────▶│ webview.js   │
│  watcher     │                 │              │
└──────────────┘                 │  Nucleation  │
                                 │   (WASM)     │
                                 │      ↓       │
                                 │  GLB bytes   │
                                 │      ↓       │
                                 │ three.js     │
                                 │ GLTFLoader   │
                                 └──────────────┘
```

The Nucleation npm package (`nucleation@^0.2.5`) is bundled into the
webview JS by esbuild; the `.wasm` artifact is copied to
`out/wasm/nucleation_bg.wasm` at build time. The webview pulls the
schematic file via the same `webview.asWebviewUri` URL the extension
hands it, decodes via Nucleation's auto-detecting `from_data` (or the
format-specific `from_litematic` / `from_schematic` /
`from_mcstructure` based on the file extension), runs `toMesh(pack)`,
and feeds the resulting `Uint8Array` GLB into `GLTFLoader.parse()`.

## License

MIT.
