import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node, // Allows Node.js globals (process, console, etc.)
        ...globals.jest, // Fixes "it is not defined" & "expect is not defined"
      },
    },
  },
  pluginJs.configs.recommended, // Standard JavaScript ESLint rules
  {
    plugins: { jest: pluginJest }, // Adds Jest plugin
    rules: {
      ...pluginJest.configs.recommended.rules, // Apply Jest recommended rules
    },
  },
  eslintConfigPrettier, // Disables ESLint rules that conflict with Prettier
];
