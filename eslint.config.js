// Flat ESLint config (ESLint 10). Lints .astro, .ts and .js/.mjs.
// Astro templates: eslint-plugin-astro (+ its jsx-a11y rules, which need
// eslint-plugin-jsx-a11y installed). Type errors are handled by `astro check`.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
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
    // help-ui.json from src/, so the marketing rebuild can never change it. Covers
    // relative (../src/) and Vite root-absolute (/src/) imports, and import.meta.glob.
    files: ['src-help/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?:(?:\\.\\./)+|/)src/(?!data/help-ui\\.json$)',
              message:
                'src-help/ is sealed: use (or add) a copy under src-help/ instead. See src-help/README.md.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.type='MetaProperty'][callee.property.name='glob'] Literal[value=/^(\\.\\.\\/)*\\/?src\\//]",
          message: 'src-help/ is sealed: import.meta.glob must not read from src/.',
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
              // One exception: the help article schema, the CMS contract for the privacy
              // policy that both sites render (src/content.config.ts).
              regex: '(^|/)src-help/(?!lib/help-collection(\\.ts)?$)',
              message: 'The marketing site must not import the frozen Help Center (src-help/).',
            },
          ],
        },
      ],
    },
  },
);
