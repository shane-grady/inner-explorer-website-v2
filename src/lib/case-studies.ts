// Reading the case-study collection (src/content.config.ts).
import { getCollection, type CollectionEntry } from 'astro:content';

export { CASE_STUDY_TAGS, type CaseStudyTag } from './case-study-tags';

export type CaseStudy = CollectionEntry<'caseStudies'>;

/** Every published story, in the index's order. */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  const all = await getCollection('caseStudies', ({ data }) => !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export const caseStudyHref = (story: CaseStudy) => `/case-studies/${story.id}/`;

/** The H1 as one line of text (JSON-LD, the index's item list). */
export const caseStudyHeadline = (story: CaseStudy) =>
  `${story.data.title.lead} ${story.data.title.emph}`;
