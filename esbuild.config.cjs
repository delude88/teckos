const esbuild = require('esbuild')

// Automatically exclude all node_modules from the bundled version
const {nodeExternalsPlugin} = require('esbuild-node-externals')

const buildESModule = esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: 'lib/index.js',
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    plugins: [nodeExternalsPlugin()]
})

const buildCommonJS = esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: 'lib/index.cjs',
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    target: 'node14',
    format: 'cjs',
    plugins: [nodeExternalsPlugin()]
})
Promise.all([
    buildCommonJS,
    buildESModule
]).catch(() => process.exit(1))