module.exports = {
    extends: [
        'airbnb-base',
        'airbnb-typescript/base'
    ],
    rules: {
        "no-console": 0,
        "linebreak-style": 0
    },
    parserOptions: {
        project: './tsconfig.json'
    },
    "root": true
};
