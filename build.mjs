import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/client/index.tsx"],
    alias: {
        "react": "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime"
    },
    jsx: "automatic",
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: 'static/index.js',
    format: "esm"
});

await esbuild.build({
    entryPoints: ["src/server/index.ts"],
    platform: "node",
    bundle: true,
    minify: true,
    sourcemap: true,
    external: ["express", "mongoose", "fs", "dotenv"],
    format: "esm",
    outdir: "src/server"
});