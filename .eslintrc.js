module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2022: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2022
    },
    rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-undef': 'error',
        'semi': ['warn', 'always'],
        'quotes': ['warn', 'single', { avoidEscape: true }],
        'no-console': 'off',
        'eqeqeq': 'warn',
        'no-trailing-spaces': 'warn',
        'eol-last': ['warn', 'always'],
        'comma-dangle': ['warn', 'never']
    },
    ignorePatterns: ['node_modules/', 'migrations/', 'seeders/', 'coverage/']
};
