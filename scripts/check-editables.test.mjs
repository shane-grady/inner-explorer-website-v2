import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const CHECKER = fileURLToPath(new URL('./check-editables.mjs', import.meta.url));

const pageRoutes = {
  about: ['about', '/about/'],
  'blog-index': ['blog/index', '/blog/'],
  'case-studies-index': ['case-studies/index', '/case-studies/'],
  contact: ['contact', '/contact/'],
  districts: ['districts', '/districts/'],
  faq: ['faq', '/faq/'],
  home: ['index', '/'],
  'narrators-index': ['narrators/index', '/narrators/'],
  newsroom: ['newsroom', '/newsroom/'],
  platform: ['platform', '/platform/'],
  pricing: ['pricing', '/pricing/'],
  'privacy-policy': ['privacy-policy', '/privacy-policy/'],
  research: ['research', '/research/'],
};
const pageIds = Object.keys(pageRoutes);
const pageSchemas = pageIds
  .map(
    (id) => `      ${id}:
        path: .cloudcannon/schemas/marketing-page.yml${
          id === 'home'
            ? `
        _inputs:
          hero:
            type: object
            options:
              structures: _structures.hero`
            : ''
        }`,
  )
  .join('\n');

const config = `
collections_config:
  pages:
    path: src/content/pages
    url: '{permalink}'
    schema_key: _schema
    disable_add: true
    _inputs:
      _schema: { type: text, hidden: true }
      permalink: { type: text, hidden: true }
      pageTitle: { type: text }
      pageDescription: { type: textarea }
    schemas:
${pageSchemas}
  blog:
    schemas: null
    path: src/content/blog
    url: /blog/[slug]/
    create:
      path: '[relative_base_path]/{title|slugify}[count].mdx'
    add_options:
      - name: Blog post
        default_content_file: .cloudcannon/schemas/blog-post.md
    _inputs:
      items:
        type: array
        options:
          structures: _structures.blog_items
  caseStudies:
    schemas: null
    path: src/content/case-studies
    url: /case-studies/[slug]/
    create:
      path: '[relative_base_path]/{meta.titleLead|slugify}[count].yaml'
    add_options:
      - name: Case study
        default_content_file: .cloudcannon/schemas/case-study.yml
  help:
    schemas: null
    path: src/content/help
    url: /help/[slug]/
    create:
      path: '[relative_base_path]/{title|slugify}[count].mdx'
    add_options:
      - name: Help article
        default_content_file: .cloudcannon/schemas/help-article.md
  narrators:
    schemas: null
    path: src/content/narrators
    url: /narrators/[slug]/
    create:
      path: '[relative_base_path]/{name|slugify}[count].yml'
    add_options:
      - name: Narrator
        default_content_file: .cloudcannon/schemas/narrator.yml
  series:
    schemas: null
    path: src/content/series
    url: /series/[slug]/
    create:
      path: '[relative_base_path]/{name|slugify}[count].yaml'
    add_options:
      - name: Practice series
        default_content_file: .cloudcannon/schemas/series.yml
  testimonials:
    schemas: null
    path: src/content/testimonials
    disable_url: true
    create:
      path: '[relative_base_path]/{name|slugify}[count].yml'
    add_options:
      - name: Testimonial
        default_content_file: .cloudcannon/schemas/testimonial.yml
_inputs:
  title: { type: text }
_structures:
  hero:
    values:
      - value:
          image: ''
          imageAlt: ''
          title: ''
          items: []
        _inputs:
          items:
            type: array
            options:
              structures: _structures.hero_items
  hero_items:
    values:
      - value:
          label: ''
  blog_items:
    values:
      - value:
          label: ''
`;

const page = `
_schema: home
permalink: /
pageTitle: Home
pageDescription: Home page
hero:
  image: /images/hero.jpg
  imageAlt: Children learning
  title: Welcome
  items:
    - label: First item
`;

const html = `<!doctype html>
<editable-component data-component="hero" data-prop="hero">
  <img data-editable="image" data-prop-src="image" data-prop-alt="imageAlt" alt="Children learning">
  <h1 data-editable="text" data-prop="title">Welcome</h1>
  <ul data-editable="array" data-prop="items">
    <li data-editable="array-item"><span data-editable="text" data-prop="label">First item</span></li>
  </ul>
</editable-component>`;

function baseFiles() {
  const files = {
    'cloudcannon.config.yml': config,
    'src/cloudcannon/registerComponents.ts': "registerAstroComponent('hero', Hero);\n",
    'dist/index.html': html,
    'src/content.config.ts': `
const blog = defineCollection({ schema: z.object({ title: z.string(), items: z.array(z.object({ label: z.string() })) }) });
const caseStudies = defineCollection({ schema: z.object({ title: z.string() }) });
const narrators = defineCollection({ schema: z.object({ title: z.string() }) });
const series = defineCollection({ schema: z.object({ title: z.string() }) });
const testimonials = defineCollection({ schema: z.object({ title: z.string() }) });
`,
    'src/lib/help-collection.ts':
      'const helpCollection = defineCollection({ schema: z.object({ title: z.string() }) });\n',
    '.cloudcannon/schemas/blog-post.md': '---\ntitle: New post\nitems: []\n---\n',
    '.cloudcannon/schemas/marketing-page.yml':
      '_schema: home\npermalink: /\npageTitle: Marketing page\npageDescription: Fixed layout\n',
    '.cloudcannon/schemas/case-study.yml': 'title: New case study\n',
    '.cloudcannon/schemas/help-article.md': '---\ntitle: New guide\n---\n',
    '.cloudcannon/schemas/narrator.yml': 'title: New narrator\n',
    '.cloudcannon/schemas/series.yml': 'title: New series\n',
    '.cloudcannon/schemas/testimonial.yml': 'title: New testimonial\n',
    'src/content/blog/example.md': '---\ntitle: Example\nitems: []\n---\n',
    'src/content/blog/nested/article.md': '---\ntitle: Nested article\nitems: []\n---\n',
    'src/content/case-studies/example.yml': 'title: Example\n',
    'src/content/help/guide.mdx': '---\ntitle: Guide\n---\n',
    'src/content/narrators/example.yml': 'title: Example\n',
    'src/content/series/example.yml': 'title: Example\n',
    'src/content/testimonials/example.yml': 'title: Example\n',
    'dist/blog/nested/article/index.html':
      '<!doctype html><h1 data-editable="text" data-prop="title">Nested article</h1>',
  };
  const imports = [];
  const calls = [];
  for (const [index, id] of pageIds.entries()) {
    const functionName = `page${index}`;
    const [route, permalink] = pageRoutes[id];
    imports.push(`import { ${functionName} } from './${id}';`);
    calls.push(`${functionName}(ctx)`);
    files[`src/lib/page-schemas/${id}.ts`] =
      `export const ${functionName} = () => z.object({ _schema: z.literal('${id}') });\n`;
    files[`src/pages/${route}.astro`] =
      `---\nconst entry = await getEntry('pages', '${id}');\n---\n`;
    files[`src/content/pages/${id}.yml`] =
      id === 'home'
        ? page
        : `_schema: ${id}\npermalink: ${permalink}\npageTitle: ${id}\npageDescription: ${id}\n`;
    const output = permalink === '/' ? 'dist/index.html' : `dist${permalink}index.html`;
    files[output] ??= '<!doctype html><p>Built page</p>';
  }
  files['src/lib/page-schemas/index.ts'] =
    `${imports.join('\n')}\nexport const pageSchemas = (ctx) => [${calls.join(', ')}] as const;\n`;
  return files;
}

function runFixture(mutate = () => {}, roots = ['dist']) {
  const dir = mkdtempSync(join(tmpdir(), 'ie-editable-guard-'));
  const files = baseFiles();
  mutate(files);
  for (const [path, contents] of Object.entries(files)) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  const result = spawnSync(process.execPath, [CHECKER, ...roots], {
    cwd: dir,
    encoding: 'utf8',
  });
  rmSync(dir, { recursive: true, force: true });
  return { ...result, output: `${result.stdout}\n${result.stderr}` };
}

test('the complete fixture passes', () => {
  const result = runFixture();
  assert.equal(result.status, 0, result.output);
});

const negativeFixtures = [
  {
    name: 'bad image path',
    error: 'INVALID_IMAGE_BINDING',
    mutate(files) {
      files['dist/index.html'] = html.replace('data-prop-src="image"', 'data-prop-src="missing"');
    },
  },
  {
    name: 'bad image alt path',
    error: 'INVALID_IMAGE_BINDING',
    mutate(files) {
      files['dist/index.html'] = html.replace(
        'data-prop-alt="imageAlt"',
        'data-prop-alt="missingAlt"',
      );
    },
  },
  {
    name: 'unknown component key',
    error: 'UNKNOWN_COMPONENT',
    mutate(files) {
      files['dist/index.html'] = html.replace('data-component="hero"', 'data-component="missing"');
    },
  },
  {
    name: 'comment-only component registration',
    error: 'UNKNOWN_COMPONENT',
    mutate(files) {
      files['src/cloudcannon/registerComponents.ts'] = "// registerAstroComponent('hero', Hero);\n";
    },
  },
  {
    name: 'duplicate component registration',
    error: 'DUPLICATE_COMPONENT_REGISTRATION',
    mutate(files) {
      files['src/cloudcannon/duplicate.ts'] = "registerAstroComponent('hero', OtherHero);\n";
    },
  },
  {
    name: 'editable input path absent from configuration',
    error: 'MISSING_INPUT',
    mutate(files) {
      files['src/content/pages/home.yml'] = `${page}  unconfigured: Visible but unavailable\n`;
      files['dist/index.html'] = html.replace(
        '</editable-component>',
        '<p data-editable="text" data-prop="unconfigured">Visible but unavailable</p></editable-component>',
      );
    },
  },
  {
    name: 'input declared only in an unrelated sibling structure',
    error: 'MISSING_INPUT',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml']
        .replace(
          '          hero:\n            type: object\n            options:\n              structures: _structures.hero',
          '          hero:\n            type: object\n            options:\n              structures: _structures.hero\n          other:\n            type: object\n            options:\n              structures: _structures.unrelated',
        )
        .replace(
          '  blog_items:\n',
          "  unrelated:\n    values:\n      - value:\n          ghost: ''\n  blog_items:\n",
        );
      files['src/content/pages/home.yml'] = files['src/content/pages/home.yml']
        .replace('  title: Welcome\n', '  title: Welcome\n  ghost: Wrong scope\n')
        .concat('other:\n  ghost: Correct scope\n');
      files['dist/index.html'] = html.replace(
        '</editable-component>',
        '<p data-editable="text" data-prop="ghost">Wrong scope</p></editable-component>',
      );
    },
  },
  {
    name: 'array item without a nested binding',
    error: 'MISSING_ARRAY_ITEM_BINDING',
    mutate(files) {
      files['dist/index.html'] = html.replace(
        '<li data-editable="array-item"><span data-editable="text" data-prop="label">First item</span></li>',
        '<li data-editable="array-item">First item</li>',
      );
    },
  },
  {
    name: 'missing marketing permalink',
    error: 'MISSING_PERMALINK',
    mutate(files) {
      files['src/content/pages/about.yml'] = files['src/content/pages/about.yml'].replace(
        'permalink: /about/\n',
        '',
      );
    },
  },
  {
    name: 'duplicate marketing permalink',
    error: 'DUPLICATE_PERMALINK',
    mutate(files) {
      files['src/content/pages/about.yml'] = page.replace('_schema: home', '_schema: about');
    },
  },
  {
    name: 'marketing page without generated output',
    error: 'MISSING_OUTPUT_PAGE',
    mutate(files) {
      delete files['dist/index.html'];
      files['dist/.keep'] = '';
    },
  },
  {
    name: 'incomplete collection creation template',
    error: 'MISSING_CREATION_FIELD',
    mutate(files) {
      files['src/content.config.ts'] = files['src/content.config.ts'].replace(
        'title: z.string(), items:',
        'title: z.string(), summary: z.string(), items:',
      );
    },
  },
  {
    name: 'creation structure missing an array-item field',
    error: 'MISSING_CREATION_STRUCTURE_FIELD',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        "  blog_items:\n    values:\n      - value:\n          label: ''",
        '  blog_items:\n    values:\n      - value: {}',
      );
    },
  },
  {
    name: 'missing required Marketing pages collection',
    error: 'MISSING_PAGES_COLLECTION',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  pages:\n',
        '  pages_missing:\n',
      );
    },
  },
  {
    name: 'missing required creatable collection',
    error: 'MISSING_CREATABLE_COLLECTION',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  blog:\n',
        '  blog_missing:\n',
      );
    },
  },
  {
    name: 'disabled required creatable collection',
    error: 'DISABLED_CREATABLE_COLLECTION',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  series:\n    schemas: null\n    path:',
        '  series:\n    schemas: null\n    disable_add: true\n    path:',
      );
    },
  },
  {
    name: 'required creatable collection without an add option',
    error: 'MISSING_CREATION_TEMPLATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '    add_options:\n      - name: Narrator\n        default_content_file: .cloudcannon/schemas/narrator.yml',
        '    missing_add_options:\n      - name: Narrator\n        default_content_file: .cloudcannon/schemas/narrator.yml',
      );
    },
  },
  {
    name: 'required creatable collection without a create path',
    error: 'MISSING_CREATION_PATH',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        "    create:\n      path: '[relative_base_path]/{title|slugify}[count].mdx'",
        '    missing_create: true',
      );
    },
  },
  {
    name: 'creation path with an unsupported output extension',
    error: 'INVALID_CREATION_PATH',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        "{meta.titleLead|slugify}[count].yaml'",
        "{meta.titleLead|slugify}[count].md'",
      );
    },
  },
  {
    name: 'creation path without its required data placeholder',
    error: 'INVALID_CREATION_PATH',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        "{name|slugify}[count].yaml'",
        "{title|slugify}[count].yaml'",
      );
    },
  },
  {
    name: 'creation add option without a default content file',
    error: 'UNCONFIGURED_CREATION_TEMPLATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        default_content_file: .cloudcannon/schemas/blog-post.md',
        '',
      );
    },
  },
  {
    name: 'creation add option configured through a managed schema',
    error: 'UNCONFIGURED_CREATION_TEMPLATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        default_content_file: .cloudcannon/schemas/blog-post.md',
        '        schema: default',
      );
    },
  },
  {
    name: 'creation add option whose default content file is missing',
    error: 'MISSING_CREATION_TEMPLATE',
    mutate(files) {
      delete files['.cloudcannon/schemas/blog-post.md'];
    },
  },
  {
    name: 'single-shape collection configured with schema maintenance',
    error: 'CREATION_SCHEMA_POLLUTION_RISK',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  blog:\n    schemas: null\n    path:',
        '  blog:\n    schemas:\n      default:\n        path: .cloudcannon/schemas/blog-post.md\n    path:',
      );
    },
  },
  {
    name: 'single-shape collection missing a legacy-schema tombstone',
    error: 'MISSING_SCHEMA_TOMBSTONE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  help:\n    schemas: null\n',
        '  help:\n',
      );
    },
  },
  {
    name: 'schema metadata leaked into single-shape content',
    error: 'MANAGED_SCHEMA_METADATA',
    mutate(files) {
      files['src/content/help/guide.mdx'] = '---\n_schema: default\ntitle: Guide\n---\n';
    },
  },
  {
    name: 'creation template placeholder leaked into content',
    error: 'CREATION_TEMPLATE_SENTINEL',
    mutate(files) {
      files['src/content/help/guide.mdx'] =
        '---\ntitle: Guide\nseoTitle: New help article | Inner Explorer\n---\n';
    },
  },
  {
    name: 'schema metadata input configured globally',
    error: 'GLOBAL_SCHEMA_INPUT',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '_inputs:\n  title:',
        '_inputs:\n  _schema: { hidden: true }\n  title:',
      );
    },
  },
  {
    name: 'semantic snippet Select cannot become optional',
    error: 'SNIPPET_SELECT_OPTIONAL',
    mutate(files) {
      files['cloudcannon.config.yml'] += `
_snippets:
  callout:
    template: mdx_component
    definitions:
      component_name: Callout
      named_args:
        - editor_key: type
          type: string
          optional: true
          default: tip
          remove_empty: true
`;
    },
  },
  {
    name: 'semantic snippet Select keeps its insertion default',
    error: 'SNIPPET_SELECT_DEFAULT',
    mutate(files) {
      files['cloudcannon.config.yml'] += `
_snippets:
  callout:
    template: mdx_component
    definitions:
      component_name: Callout
      named_args:
        - editor_key: type
          type: string
          allowed_values: [tip, note, good]
`;
    },
  },
  {
    name: 'semantic snippet argument uses a closed Select containing its default',
    error: 'SNIPPET_SELECT_INPUT',
    mutate(files) {
      files['cloudcannon.config.yml'] += `
_snippets:
  help_video:
    template: mdx_component
    definitions:
      component_name: HelpVideo
      named_args:
        - editor_key: ratio
          type: string
          default: 16 / 9
    _inputs:
      ratio:
        type: text
        options:
          values: [16 / 9, 4 / 3]
`;
    },
  },
  {
    name: 'required marketing page removed from the contract',
    error: 'MISSING_MARKETING_PAGE',
    mutate(files) {
      delete files['src/content/pages/about.yml'];
    },
  },
  {
    name: 'marketing schema template placed inside its collection',
    error: 'PAGE_SCHEMA_TEMPLATE_IN_COLLECTION',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replaceAll(
        '.cloudcannon/schemas/marketing-page.yml',
        'src/content/pages/home.yml',
      );
    },
  },
  {
    name: 'missing marketing schema template',
    error: 'MISSING_PAGE_SCHEMA_TEMPLATE',
    mutate(files) {
      delete files['.cloudcannon/schemas/marketing-page.yml'];
    },
  },
  {
    name: 'unbacked page with editable regions',
    error: 'UNBACKED_EDITABLE_PAGE',
    mutate(files) {
      files['dist/orphan/index.html'] =
        '<!doctype html><h1 data-editable="text" data-prop="title">Orphan</h1>';
    },
  },
  {
    name: 'duplicate collection output URL',
    error: 'DUPLICATE_OUTPUT_URL',
    mutate(files) {
      files['src/content/blog/example.mdx'] = '---\ntitle: Duplicate URL\nitems: []\n---\n';
    },
  },
  {
    name: 'comment-only Zod discriminant',
    error: 'INVALID_ZOD_SCHEMA_MODULE',
    mutate(files) {
      const path = 'src/lib/page-schemas/home.ts';
      files[path] = files[path].replace(
        "z.object({ _schema: z.literal('home') })",
        "z.object({}) /* _schema: z.literal('home') */",
      );
    },
  },
  {
    name: 'duplicate actual Zod discriminant registration',
    error: 'DUPLICATE_ZOD_DISCRIMINANT',
    mutate(files) {
      files['src/lib/page-schemas/index.ts'] = files['src/lib/page-schemas/index.ts'].replace(
        'page6(ctx)',
        'page6(ctx), page6(ctx)',
      );
    },
  },
  {
    name: 'comment-only marketing route',
    error: 'MISSING_PAGE_ROUTE',
    mutate(files) {
      files['src/pages/index.astro'] = "---\n// getEntry('pages', 'home')\n---\n";
    },
  },
  {
    name: 'duplicate actual marketing route',
    error: 'DUPLICATE_PAGE_ROUTE',
    mutate(files) {
      files['src/pages/duplicate.astro'] =
        "---\nconst entry = await getEntry('pages', 'home');\n---\n";
      files['dist/duplicate/index.html'] = '<!doctype html><p>Duplicate route</p>';
    },
  },
  {
    name: 'root-relative link to a known Help article',
    error: 'ROOT_RELATIVE_HELP_LINK',
    mutate(files) {
      files['src/content/help/guide.mdx'] = '---\ntitle: Guide\n---\n';
      files['src/content/help/other.mdx'] = '---\ntitle: Other\n---\n[Open the guide](/guide/)\n';
    },
  },
  {
    name: 'root-relative /help/ link to a known Help article',
    error: 'ROOT_RELATIVE_HELP_LINK',
    mutate(files) {
      files['src/content/help/other.mdx'] =
        '---\ntitle: Other\n---\n[Open the guide](/help/guide/)\n';
    },
  },
  {
    name: 'reference-style root-relative Help link',
    error: 'ROOT_RELATIVE_HELP_LINK',
    mutate(files) {
      files['src/content/help/other.mdx'] =
        '---\ntitle: Other\n---\n[Open the guide][guide]\n\n[guide]: /guide/\n';
    },
  },
  {
    name: 'JSX-expression root-relative Help link',
    error: 'ROOT_RELATIVE_HELP_LINK',
    mutate(files) {
      files['src/content/help/other.mdx'] =
        '---\ntitle: Other\n---\n<a href={"/guide/"}>Open the guide</a>\n';
    },
  },
];

for (const fixture of negativeFixtures) {
  test(`rejects ${fixture.name}`, () => {
    const result = runFixture(fixture.mutate);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, new RegExp(`\\b${fixture.error}\\b`));
  });
}

test('default invocation rejects a missing Help build root', () => {
  const result = runFixture(() => {}, []);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Missing build output: dist-help/);
});

test('optional creation fields must still be present in the creation template', () => {
  const result = runFixture((files) => {
    files['src/content.config.ts'] = files['src/content.config.ts'].replace(
      'const narrators = defineCollection({ schema: z.object({ title: z.string() }) });',
      'const narrators = defineCollection({ schema: z.object({ title: z.string(), voice: z.object({ audio: z.string() }).optional() }) });',
    );
  });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /\bMISSING_CREATION_FIELD\b/);
  assert.match(result.output, /voice/);
});

test('creation placeholders remain valid while an entry is a draft', () => {
  const result = runFixture((files) => {
    files['src/content/help/guide.mdx'] =
      '---\ntitle: New help article\nseoTitle: New help article | Inner Explorer\ndraft: true\n---\n';
  });
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /\bCREATION_TEMPLATE_SENTINEL\b/);
});

test('unrelated optional snippet defaults remain valid', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] += `
_snippets:
  badge:
    template: mdx_component
    definitions:
      component_name: Badge
      named_args:
        - editor_key: tone
          type: string
          optional: true
          default: neutral
`;
  });
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /\bOPTIONAL_SNIPPET_(?:DEFAULT|KEPT_EMPTY)\b/);
});

test('preprocessed optional objects retain nested creation-structure validation', () => {
  const result = runFixture((files) => {
    files['src/content.config.ts'] = files['src/content.config.ts'].replace(
      'const narrators = defineCollection({ schema: z.object({ title: z.string() }) });',
      'const narrators = defineCollection({ schema: z.object({ title: z.string(), voice: z.preprocess((value) => value, z.object({ audio: z.string(), title: z.string() }).optional()) }) });',
    );
    files['.cloudcannon/schemas/narrator.yml'] = 'title: New narrator\nvoice: null\n';
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml']
      .replace(
        '  narrators:\n    schemas: null\n    path:',
        '  narrators:\n    schemas: null\n    _inputs:\n      voice:\n        type: object\n        options:\n          structures: _structures.voice\n    path:',
      )
      .replace(
        '  blog_items:\n',
        "  voice:\n    values:\n      - value:\n          audio: ''\n  blog_items:\n",
      );
  });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /\bMISSING_CREATION_STRUCTURE_FIELD\b/);
  assert.match(result.output, /title/);
});

test('exact file configuration with a $ root structure scopes page inputs', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml']
      .replace(
        '        _inputs:\n          hero:\n            type: object\n            options:\n              structures: _structures.hero',
        '',
      )
      .replace(
        '_inputs:\n  title:',
        'file_config:\n  - glob: src/content/pages/home.yml\n    _inputs:\n      $:\n        type: object\n        options:\n          structures: _structures.home_root\n_inputs:\n  title:',
      )
      .replace(
        '_structures:\n',
        `_structures:
  home_root:
    values:
      - value:
          hero:
            image: ''
            imageAlt: ''
            title: ''
            items: []
        _inputs:
          hero:
            type: object
            options:
              structures: _structures.hero
`,
      );
  });
  assert.equal(result.status, 0, result.output);
});

test('exact $.field inputs bind at the file root without matching nested names', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
      '          hero:\n            type: object',
      "          '$.hero':\n            type: object",
    );
    files['src/content/pages/home.yml'] += '\nother:\n  hero: Nested name with a different shape\n';
  });
  assert.equal(result.status, 0, result.output);
});
