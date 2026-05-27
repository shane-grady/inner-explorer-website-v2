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
    ignores: ['dist/', '.astro/', 'node_modules/', '.netlify/', 'public/', 'pnpm-lock.yaml'],
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
    },
    rules: {
      // Intentional placeholders may be prefixed with _.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
);
