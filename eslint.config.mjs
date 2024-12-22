import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,tsx}'] },
  {
    languageOptions: {
      globals: globals.browser,
      parser: eslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    env: {
      node: true,
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-require-imports': 'off',
    },
    ignores: ['config/*.*', 'eslint.config.js'],
  },
];
