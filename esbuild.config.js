const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const watch = process.argv.includes("--watch");
const production = process.argv.includes("--production");

const common = {
  bundle: true,
  sourcemap: !production,
  minify: production,
  logLevel: "info",
};

const extension = {
  ...common,
  entryPoints: ["src/extension.ts"],
  outfile: "out/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node18",
};

const webview = {
  ...common,
  entryPoints: ["src/webview/viewer.js"],
  outfile: "out/webview.js",
  format: "esm",
  platform: "browser",
  target: "es2022",
};

/**
 * Copy the Nucleation .wasm next to the bundled webview JS so the
 * webview can fetch it via a known URL (`out/wasm/nucleation_bg.wasm`).
 * The npm package's `init()` accepts a custom URL argument, which
 * `viewer.js` reads from the `data-wasm-base` attribute the extension
 * stamps into the HTML.
 */
function copyNucleationWasm() {
  // The published package doesn't list nucleation_bg.wasm under
  // `exports`, so resolve via the package root instead.
  const pkgRoot = path.dirname(require.resolve("nucleation/package.json"));
  const src = path.join(pkgRoot, "nucleation_bg.wasm");
  const destDir = path.join(__dirname, "out", "wasm");
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, "nucleation_bg.wasm"));
}

(async () => {
  copyNucleationWasm();
  if (watch) {
    const ctxs = await Promise.all([
      esbuild.context(extension),
      esbuild.context(webview),
    ]);
    await Promise.all(ctxs.map((c) => c.watch()));
    console.log("[esbuild] watching…");
  } else {
    await Promise.all([esbuild.build(extension), esbuild.build(webview)]);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
