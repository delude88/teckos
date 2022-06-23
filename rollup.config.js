import { defineConfig } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const extensions = ['.ts']
const noDeclarationFiles = { compilerOptions: { declaration: false } }

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(
    /^[^0-9]*/,
    ''
)

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
].map(name => RegExp(`^${name}($|/)`))

export default defineConfig([
    // CommonJS
    {
        input: 'src/index.ts',
        output: { file: 'lib/index.js', format: 'cjs', indent: false },
        external,
        plugins: [
            nodeResolve({
                extensions
            }),
            typescript({ useTsconfigDeclarationDir: true }),
            babel({
                extensions,
                plugins: [
                    ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
                    ['./scripts/mangleErrors.js', { minify: false }]
                ],
                babelHelpers: 'runtime'
            })
        ]
    },

    // ES
    {
        input: 'src/index.ts',
        output: { file: 'es/index.js', format: 'es', indent: false },
        external,
        plugins: [
            nodeResolve({
                extensions
            }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            babel({
                extensions,
                plugins: [
                    [
                        '@babel/plugin-transform-runtime',
                        { version: babelRuntimeVersion, useESModules: true }
                    ],
                    ['./scripts/mangleErrors.js', { minify: false }]
                ],
                babelHelpers: 'runtime'
            })
        ]
    },

    // ES for Browsers
    {
        input: 'src/index.ts',
        output: { file: 'es/index.mjs', format: 'es', indent: false },
        plugins: [
            nodeResolve({
                extensions
            }),
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            babel({
                extensions,
                exclude: 'node_modules/**',
                plugins: [['./scripts/mangleErrors.js', { minify: true }]],
                skipPreflightCheck: true,
                babelHelpers: 'bundled'
            }),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true
                }
            })
        ]
    },

    // UMD Development
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'umd',
            name: 'Teckos Client',
            indent: false
        },
        plugins: [
            nodeResolve({
                extensions
            }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            babel({
                extensions,
                exclude: 'node_modules/**',
                plugins: [['./scripts/mangleErrors.js', { minify: false }]],
                babelHelpers: 'bundled'
            }),
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': JSON.stringify('development')
            })
        ]
    },

    // UMD Production
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.min.js',
            format: 'umd',
            name: 'Teckos Client',
            indent: false
        },
        plugins: [
            nodeResolve({
                extensions
            }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            babel({
                extensions,
                exclude: 'node_modules/**',
                plugins: [['./scripts/mangleErrors.js', { minify: true }]],
                skipPreflightCheck: true,
                babelHelpers: 'bundled'
            }),
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true
                }
            })
        ]
    }
])