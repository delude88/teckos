module.exports = {
    extends: [
        'airbnb-typescript/base',
        'plugin:promise/recommended',
        'plugin:prettier/recommended'
    ],
    rules: {
        'no-underscore-dangle': 0,
        'linebreak-style': 0
    },
    parserOptions: {
        project: './tsconfig.json'
    }
};