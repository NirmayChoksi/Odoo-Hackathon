import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  // Ignore generated files
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Application source
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // 🔴 UNUSED VARIABLES → ERROR (this is what you want)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Formatting-style rules (IDE will show errors)
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'block-spacing': ['error', 'always'],

      // Safety
      'no-const-assign': 'error',
    },
  },

  // Disable formatting conflicts with Prettier
  prettier,
];
