// The marketing site's only collection: the privacy policy. Its text lives in the Help
// Center's content folder (src/content/help/privacy-policy.mdx) so the legal document has
// one place to edit, and /privacy-policy/ renders that same file.
//
// Registered as `help`, with the Help Center's own schema (the one CMS contract for
// that file), because `astro check` (run with this config) also type-checks src-help/,
// whose code reads CollectionEntry<'help'>. This is the one marketing import from
// src-help/ that eslint.config.js allows.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { helpArticleSchema } from '../src-help/lib/help-collection';

const help = defineCollection({
  loader: glob({ pattern: 'privacy-policy.mdx', base: './src/content/help' }),
  schema: helpArticleSchema,
});

export const collections = { help };
