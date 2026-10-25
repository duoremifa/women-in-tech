import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        // Web API globals
        URL: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        caches: 'readonly',
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',

      // General
      'no-console': 'off',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      // Skip ESLint for Astro files for now
    },
    languageOptions: {
      // Skip parsing for Astro files
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        addEventListener: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        skipWaiting: 'readonly',
        clients: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vercel/**',
      '.astro/**',
      '.wrangler/**',
      '**/*.d.ts',
      '**/*.astro',
    ],
  },
];
