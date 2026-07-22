// Content config for the standalone Help Center build (astro.help.config.mjs).
// Only the help collection exists on this site; the definition is shared with the
// main site's config via src/lib/help-collection.ts so the schema cannot drift.
import { helpCollection as help } from '../src/lib/help-collection';

export const collections = { help };
