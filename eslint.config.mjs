import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
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
        // Node globals（astro.config.mjs / 脚本等构建期代码会用）
        process: 'readonly',
        Buffer: 'readonly',
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
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        require: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
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
      // .astro 文件由 Astro 编译器处理；待引入 astro-eslint-parser 后再纳入 lint
      '**/*.astro',
    ],
  },
];
