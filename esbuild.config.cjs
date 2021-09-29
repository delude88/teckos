const esbuild = require('esbuild')

// Automatically exclude all node_modules from the bundled version
const {nodeExternalsPlugin} = require('esbuild-node-externals')
const replace = require('replace-in-file')

const buildESModule = esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: 'lib/index.mjs',
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    plugins: [nodeExternalsPlugin()],
    external: ['*/uws'],
})
    .then(() =>
        // Avoid directory imports
        replace({
            files: 'lib/index.mjs',
            from: /"\.\.\/uws"/g,
            to: '"../uws/index.mjs"'
        })
    )

const buildCommonJS = esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: 'lib/index.cjs',
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    target: 'node14',
    format: 'cjs',
    plugins: [nodeExternalsPlugin()],
    external: ['*/uws'],
})
Promise.all([
    buildCommonJS,
    buildESModule
]).catch(() => process.exit(1))