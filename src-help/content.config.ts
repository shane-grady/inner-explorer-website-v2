// Content config for the standalone Help Center build (astro.help.config.mjs).
// Only the help collection exists on this site (defined in lib/help-collection.ts).
import { helpCollection as help } from './lib/help-collection';

export const collections = { help };
