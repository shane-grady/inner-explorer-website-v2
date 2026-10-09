// Flat ESLint config (ESLint 10). Lints .astro, .ts(x), .js(x).
// Astro templates: eslint-plugin-astro (+ its jsx-a11y rules).
// React islands: jsx-a11y recommended. Type errors are handled by `astro check`.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      // Covers dist-help/ plus scratch comparison builds (dist-help-baseline/ etc.).
      'dist-*/',
      // Transient extraction/scratch dirs — never source, and linting them fails the gate.
      '.tmp-*/',
      '.astro/',
      'node_modules/',
      '.netlify/',
      'public/',
      '.agents/',
      '.claude/',
      'agent/',
      '.cloudcannon/migration/*.schema.json',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    // React islands: apply jsx-a11y recommended RULES only — the plugin is already
    // registered by the astro jsx-a11y config above (re-registering it errors).
    files: ['**/*.{jsx,tsx}'],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        // Agent-managed worktrees may contain their own tsconfig files. Keep the
        // parser anchored to this repository instead of auto-selecting a sibling.
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Intentional placeholders may be prefixed with _.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // The Help Center is sealed (src-help/README.md): it may read only the editor-owned
    // help-ui.json from src/, so the marketing rebuild can never change it.
    files: ['src-help/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(\\.\\./)+src/(?!data/help-ui\\.json$)',
              message:
                'src-help/ is sealed: use (or add) a copy under src-help/ instead. See src-help/README.md.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)src-help/',
              message: 'The marketing site must not import the frozen Help Center (src-help/).',
            },
          ],
        },
      ],
    },
  },
);
