import type { APIRoute } from 'astro';
import { getNews, newsPath } from '../lib/news';
import { caseStudyHeadline, caseStudyHref, getCaseStudies } from '../lib/case-studies';
import { HELP_SITE, MAIN_SITE } from '../lib/site';

// /llms.txt (llmstxt.org): a plain map of the site for AI search tools. The key pages are
// listed here; case studies and articles come from their collections, so new ones appear on
// their own. Unlisted case studies and drafts stay out, as they do in the sitemap.
const content = {
  name: 'Inner Explorer',
  summary:
    'Inner Explorer brings daily, audio-guided mindfulness to PreK–12 classrooms: 5 to 10 minute practices in English and Spanish for all 180 school days, backed by independent controlled studies.',
  pages: [
    { label: 'Home', path: '/', note: 'What Inner Explorer is and who it serves.' },
    {
      label: 'Program',
      path: '/program/',
      note: 'The daily practices by grade band, languages and how classrooms use them.',
    },
    {
      label: 'Why Inner Explorer',
      path: '/why-inner-explorer/',
      note: 'For school and district leaders: outcomes, MTSS fit and implementation.',
    },
    {
      label: 'Research',
      path: '/research/',
      note: 'The controlled studies and meta-review behind the practice.',
    },
    {
      label: 'Pricing',
      path: '/pricing/',
      note: 'The license plans for schools and districts, compared.',
    },
    { label: 'About', path: '/about/', note: 'History, mission, team and partners.' },
    { label: 'Contact', path: '/contact/', note: 'Reach the team.' },
    {
      label: 'Privacy Policy',
      path: '/privacy-policy/',
      note: 'No student information is collected.',
    },
  ],
  sections: { pages: 'Key pages', stories: 'Case studies', news: 'Articles', help: 'Help' },
  help: {
    label: 'Help Center',
    note: 'Setup, sign-in and classroom how-tos for educators and families.',
  },
};

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site ?? MAIN_SITE).href;
  const stories = await getCaseStudies();
  const posts = await getNews();
  const body = [
    `# ${content.name}`,
    '',
    `> ${content.summary}`,
    '',
    `## ${content.sections.pages}`,
    '',
    ...content.pages.map((p) => `- [${p.label}](${url(p.path)}): ${p.note}`),
    '',
    `## ${content.sections.stories}`,
    '',
    ...stories.map((s) => `- [${s.data.name}](${url(caseStudyHref(s))}): ${caseStudyHeadline(s)}`),
    '',
    `## ${content.sections.news}`,
    '',
    ...posts.map((p) => `- [${p.data.title}](${url(newsPath(p))})`),
    '',
    `## ${content.sections.help}`,
    '',
    `- [${content.help.label}](${HELP_SITE}/): ${content.help.note}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
