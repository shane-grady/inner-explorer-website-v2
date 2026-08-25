// Every marketing page schema, in one array for the `pages` collection's
// discriminatedUnion. Add a route by creating its module here and appending it —
// nothing else in content.config.ts changes.
import { aboutPage } from './about';
import { districtsPage } from './districts';
import { homePage } from './home';
import { newsroomPage } from './newsroom';
import { pricingPage } from './pricing';
import { narratorsIndexPage } from './narrators-index';
import { blogIndexPage } from './blog-index';
import { caseStudiesIndexPage } from './case-studies-index';
import { contactPage } from './contact';
import { faqPage } from './faq';
import { platformPage } from './platform';
import { researchPage } from './research';

import type { PageSchemaContext } from './shared';

export const pageSchemas = (ctx: PageSchemaContext) =>
  [
    contactPage(ctx),
    faqPage(ctx),
    platformPage(ctx),
    researchPage(ctx),
    aboutPage(ctx),
    districtsPage(ctx),
    homePage(ctx),
    newsroomPage(ctx),
    pricingPage(ctx),
    narratorsIndexPage(ctx),
    blogIndexPage(ctx),
    caseStudiesIndexPage(ctx),
  ] as const;
