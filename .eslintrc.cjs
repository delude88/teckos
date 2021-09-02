module.exports = {
    plugins: ["import"],
    extends: [
        'airbnb-typescript/base',
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:promise/recommended",
        "plugin:prettier/recommended"
    ],
    rules: {
        // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
        "no-prototype-builtins": "off",
        // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
        "import/prefer-default-export": "off",
        "import/no-default-export": "error",
        // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
        "react/destructuring-assignment": "off",
        // Use function hoisting to improve code readability
        "no-use-before-define": [
            "error",
            {functions: false, classes: true, variables: true},
        ],
        // Allow most functions to rely on type inference. If the function is exported, then `@typescript-eslint/explicit-module-boundary-types` will ensure it's typed.
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-use-before-define": [
            "error",
            {functions: false, classes: true, variables: true, typedefs: true},
        ],
        // It's not accurate in the monorepo style
        "import/no-extraneous-dependencies": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/naming-convention": [
            0,
            {
                "format": ["camelCase"],
                "leadingUnderscore": "allow"
            },
        ],
        "prettier/prettier": [
            "error",
            {
                "endOfLine": "auto"
            },
        ]
    },
    parserOptions: {
        project: './tsconfig.json'
    }
};
