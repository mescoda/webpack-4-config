module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        'plugin:react/recommended'
    ],
    // disable react/all in @ecomfe/eslint-config
    plugins: [
        'babel'
    ],
    rules: {
        'spaced-comment': 0,
        'brace-style': 0,
        'no-else-return': 0
    }
};
