import esbuild from "esbuild";
// Automatically exclude all node_modules from the bundled version
import {nodeExternalsPlugin} from "esbuild-node-externals";

esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: 'lib/index.js',
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    plugins: [nodeExternalsPlugin()],
    external: ['*/uws'],
})
    .catch(() => process.exit(1))
