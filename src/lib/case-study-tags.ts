// The case-study index's outcome filters, in the order the chips draw them (Case Studies
// boards). Their ids are the `tags` a story carries (src/content.config.ts). Kept apart from
// case-studies.ts, which reads the collection that config defines.
export const CASE_STUDY_TAGS = {
  behavior: 'Behavior & discipline',
  academics: 'Academics',
  wellbeing: 'Wellbeing & student voice',
  specialed: 'Special education',
} as const;
export type CaseStudyTag = keyof typeof CASE_STUDY_TAGS;
