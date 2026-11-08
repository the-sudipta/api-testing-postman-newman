const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'reports/', 'collections/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node } },
    rules: { 'max-lines-per-function': ['warn', { max: 30, skipComments: true, skipBlankLines: true }] },
  },
  {
    files: ['src/collection/**/*.js'],
    languageOptions: { globals: { pm: 'readonly' } },
    rules: { 'max-lines-per-function': 'off' },
  },
];
