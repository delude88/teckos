const sharedPresets = ['@babel/typescript'];
const shared = {
    ignore: ['src/**/*.spec.ts'],
    presets: sharedPresets,
}

module.exports = {
    env: {
        esmUnbundled: shared,
        esmBundled: {
            ...shared,
            presets: [['@babel/env', {
                targets: {
                    "node": "current"
                }
            }], ...sharedPresets],
        },
        cjs: {
            ...shared,
            presets: [['@babel/env', {
                modules: 'commonjs',
                targets: {
                    "node": "current"
                }
            }], ...sharedPresets],
        }
    }
}