# Live Schematic Viewer — changelog

## 0.1.0

Initial release. Renders `.schem`, `.litematic`, `.nbt`, and
`.mcstructure` files via Nucleation's WASM build:

- Custom VS Code editor for the four supported extensions.
- Workspace-wide viewer (command **Live Schematic: Open Viewer**).
- Hot reload on file change via VS Code's file-system watcher.
- Resource pack configurable via `liveSchematic.resourcePack` (vanilla
  client jar or any pack zip).
- Per-file camera persistence; optional auto-frame on reload.

Forked from `live-glb-extension` — same hot-reload + camera-state
plumbing, swapped GLTFLoader's URL fetch for a Nucleation
`Schematic → GLB → GLTFLoader.parse()` pipeline.
