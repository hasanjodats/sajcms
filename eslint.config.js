const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

export default tseslint.config(
  {
    ...eslint.configs.recommended,
    ...tseslint.configs.recommended,
    rules: {
      '@typescript-eslint/no-namespace': 'error',
    },
  },
  {
    ignores: ['config/*.*', 'eslint.config.js'],
  },
);
