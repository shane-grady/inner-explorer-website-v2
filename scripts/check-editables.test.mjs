import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const CHECKER = fileURLToPath(new URL('./check-editables.mjs', import.meta.url));

// A minimal Help Center: one article (src/content/help/guide.mdx) built to
// dist-help/guide/, plus the CloudCannon config, creation template and Zod schema the
// checker reads. `hero` is fixture-only data that exercises image, object and array
// bindings; real articles bind `title` and `@content`.
const config = `
collections_config:
  help:
    schemas: null
    path: src/content/help
    url: /[slug]/
    create:
      path: '[relative_base_path]/{title|slugify}[count].mdx'
    add_options:
      - name: Help article
        default_content_file: .cloudcannon/schemas/help-article.md
    _inputs:
      keywords:
        type: multiselect
        options:
          values: collections.help[*].keywords
          allow_create: true
      hero:
        type: object
        options:
          structures: _structures.hero
      items:
        type: array
        options:
          structures: _structures.help_items
_inputs:
  title: { type: text }
_snippets:
  callout:
    template: mdx_paired_component
    definitions:
      component_name: Callout
      named_args:
        - editor_key: type
          type: string
          default: tip
    _inputs:
      type:
        type: select
        options:
          values: [tip, note, good]
  help_figure:
    template: mdx_component
    definitions:
      component_name: HelpFigure
      named_args:
        - editor_key: ratio
          type: string
          default: 16 / 9
    _inputs:
      ratio:
        type: select
        options:
          values: [16 / 9, 4 / 3]
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
        type: select
        options:
          values: [16 / 9, 16 / 10]
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
  help_items:
    values:
      - value:
          label: ''
`;

const article = `---
title: Guide
items: []
hero:
  image: /images/hero.jpg
  imageAlt: Children learning
  title: Welcome
  items:
    - label: First item
---
Body text.
`;

const html = `<!doctype html>
<h1 data-editable="text" data-prop="title">Guide</h1>
<img data-editable="image" data-prop-src="hero.image" data-prop-alt="hero.imageAlt" alt="Children learning">
<h2 data-editable="text" data-prop="hero.title">Welcome</h2>
<ul data-editable="array" data-prop="hero.items">
  <li data-editable="array-item"><span data-editable="text" data-prop="label">First item</span></li>
</ul>
<div data-editable="text" data-type="block" data-prop="@content"><p>Body text.</p></div>`;

// A structured snippet: its JSX expression nests braces, including inside strings.
const stepsUsage = `<Steps
  items={[
    { title: 'Open the menu', content: 'Braces in text: } {' },
    { title: 'Choose', content: "It's done" },
  ]}
/>`;

// The data file the help pages that are not entries (home, 404) bind to.
const sharedData = `
data_config:
  shared:
    path: src/data/shared.json
file_config:
  - glob: src/data/shared.json
    _inputs:
      title: { type: text }
`;

function baseFiles() {
  return {
    'cloudcannon.config.yml': config,
    'src-help/lib/help-collection.ts':
      'export const helpCollection = defineCollection({ schema: z.object({ title: z.string(), items: z.array(z.object({ label: z.string() })) }) });\n',
    '.cloudcannon/schemas/help-article.md': '---\ntitle: New guide\nitems: []\n---\n',
    'src/content/help/guide.mdx': article,
    'dist-help/guide/index.html': html,
  };
}

// `roots` are passed to the checker; the default (none) checks dist-help.
function runFixture(mutate = () => {}, roots = []) {
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
  assert.match(result.output, /Scanned dist-help — 1 pages/);
});

const negativeFixtures = [
  {
    name: 'bad image path',
    error: 'INVALID_IMAGE_BINDING',
    mutate(files) {
      files['dist-help/guide/index.html'] = html.replace(
        'data-prop-src="hero.image"',
        'data-prop-src="hero.missing"',
      );
    },
  },
  {
    name: 'bad image alt path',
    error: 'INVALID_IMAGE_BINDING',
    mutate(files) {
      files['dist-help/guide/index.html'] = html.replace(
        'data-prop-alt="hero.imageAlt"',
        'data-prop-alt="hero.missingAlt"',
      );
    },
  },
  {
    name: 'component region on a site that registers no renderers',
    error: 'UNKNOWN_COMPONENT',
    mutate(files) {
      files['dist-help/guide/index.html'] = html.replace(
        '<h2 data-editable="text" data-prop="hero.title">Welcome</h2>',
        '<editable-component data-component="hero" data-prop="hero"><h2 data-editable="text" data-prop="title">Welcome</h2></editable-component>',
      );
    },
  },
  {
    name: 'component region without a component key',
    error: 'MISSING_COMPONENT_KEY',
    mutate(files) {
      files['dist-help/guide/index.html'] = html.replace(
        '<h2 data-editable="text" data-prop="hero.title">Welcome</h2>',
        '<editable-component data-prop="hero"><h2 data-editable="text" data-prop="title">Welcome</h2></editable-component>',
      );
    },
  },
  {
    name: 'text binding that resolves to nothing',
    error: 'UNRESOLVED',
    mutate(files) {
      files['dist-help/guide/index.html'] = html.replace(
        'data-prop="hero.title"',
        'data-prop="hero.subtitle"',
      );
    },
  },
  {
    name: 'absolute file binding whose file does not exist',
    error: 'UNRESOLVED',
    mutate(files) {
      files['dist-help/guide/index.html'] =
        '<h1 data-editable="text" data-prop="@file[/src/data/missing.json].title">Missing title</h1>';
    },
  },
  {
    name: 'absolute data binding to a missing field',
    error: 'UNRESOLVED',
    mutate(files) {
      files['cloudcannon.config.yml'] += sharedData;
      files['src/data/shared.json'] = '{"title":"Shared title"}\n';
      files['dist-help/index.html'] =
        '<h1 data-editable="text" data-prop="@data[shared].heading">Shared title</h1>';
    },
  },
  {
    name: 'editable input path absent from configuration',
    error: 'MISSING_INPUT',
    mutate(files) {
      files['src/content/help/guide.mdx'] = article.replace(
        'title: Guide\n',
        'title: Guide\nunconfigured: Visible but unavailable\n',
      );
      files['dist-help/guide/index.html'] =
        `${html}\n<p data-editable="text" data-prop="unconfigured">Visible but unavailable</p>`;
    },
  },
  {
    name: 'input declared only in an unrelated sibling structure',
    error: 'MISSING_INPUT',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml']
        .replace(
          '      hero:\n        type: object\n        options:\n          structures: _structures.hero',
          '      hero:\n        type: object\n        options:\n          structures: _structures.hero\n      other:\n        type: object\n        options:\n          structures: _structures.unrelated',
        )
        .replace(
          '  help_items:\n',
          "  unrelated:\n    values:\n      - value:\n          ghost: ''\n  help_items:\n",
        );
      files['src/content/help/guide.mdx'] = article
        .replace('  title: Welcome\n', '  title: Welcome\n  ghost: Wrong scope\n')
        .replace('---\nBody', 'other:\n  ghost: Correct scope\n---\nBody');
      files['dist-help/guide/index.html'] =
        `${html}\n<p data-editable="text" data-prop="hero.ghost">Wrong scope</p>`;
    },
  },
  {
    name: 'array item without a nested binding',
    error: 'MISSING_ARRAY_ITEM_BINDING',
    mutate(files) {
      files['dist-help/guide/index.html'] = html.replace(
        '<li data-editable="array-item"><span data-editable="text" data-prop="label">First item</span></li>',
        '<li data-editable="array-item">First item</li>',
      );
    },
  },
  {
    name: 'data file missing from the sidebar collection',
    error: 'UNREACHABLE_DATA_FILE',
    mutate(files) {
      files['cloudcannon.config.yml'] =
        files['cloudcannon.config.yml'].replace(
          'collections_config:\n',
          'collections_config:\n  data:\n    path: src/data\n    disable_url: true\n    glob:\n      - other.json\n',
        ) + sharedData;
      files['src/data/shared.json'] = '{"title":"Shared title"}\n';
    },
  },
  {
    name: 'MDX component without a snippet',
    error: 'UNMATCHED_SNIPPET',
    mutate(files) {
      files['src/content/help/guide.mdx'] = `${article}\n<Banner tone="info" />\n`;
    },
  },
  {
    name: 'MDX component with an array prop and no snippet',
    error: 'UNMATCHED_SNIPPET',
    mutate(files) {
      files['src/content/help/guide.mdx'] = `${article}\n${stepsUsage}\n`;
    },
  },
  {
    name: 'MDX component attribute its snippet does not declare',
    error: 'UNMATCHED_SNIPPET',
    mutate(files) {
      files['src/content/help/guide.mdx'] =
        `${article}\n<Callout type="tip" tone="loud">Hi</Callout>\n`;
    },
  },
  {
    name: 'incomplete collection creation template',
    error: 'MISSING_CREATION_FIELD',
    mutate(files) {
      files['src-help/lib/help-collection.ts'] = files['src-help/lib/help-collection.ts'].replace(
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
        "  help_items:\n    values:\n      - value:\n          label: ''",
        '  help_items:\n    values:\n      - value: {}',
      );
    },
  },
  {
    name: 'help schema the checker cannot read',
    error: 'UNREADABLE_CREATION_CONTRACT',
    mutate(files) {
      delete files['src-help/lib/help-collection.ts'];
    },
  },
  {
    name: 'missing help collection',
    error: 'MISSING_CREATABLE_COLLECTION',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  help:\n',
        '  help_missing:\n',
      );
    },
  },
  {
    name: 'help collection with adding disabled',
    error: 'DISABLED_CREATABLE_COLLECTION',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  help:\n    schemas: null\n    path:',
        '  help:\n    schemas: null\n    disable_add: true\n    path:',
      );
    },
  },
  {
    name: 'help collection without an add option',
    error: 'MISSING_CREATION_TEMPLATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '    add_options:\n      - name: Help article',
        '    missing_add_options:\n      - name: Help article',
      );
    },
  },
  {
    name: 'help collection without a create path',
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
        "{title|slugify}[count].mdx'",
        "{title|slugify}[count].md'",
      );
    },
  },
  {
    name: 'creation path without its required data placeholder',
    error: 'INVALID_CREATION_PATH',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        "{title|slugify}[count].mdx'",
        "{name|slugify}[count].mdx'",
      );
    },
  },
  {
    name: 'creation add option without a default content file',
    error: 'UNCONFIGURED_CREATION_TEMPLATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        default_content_file: .cloudcannon/schemas/help-article.md',
        '',
      );
    },
  },
  {
    name: 'creation add option configured through a managed schema',
    error: 'UNCONFIGURED_CREATION_TEMPLATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        default_content_file: .cloudcannon/schemas/help-article.md',
        '        schema: default',
      );
    },
  },
  {
    name: 'creation add option whose default content file is missing',
    error: 'MISSING_CREATION_TEMPLATE',
    mutate(files) {
      delete files['.cloudcannon/schemas/help-article.md'];
    },
  },
  {
    name: 'single-shape collection configured with schema maintenance',
    error: 'CREATION_SCHEMA_POLLUTION_RISK',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  help:\n    schemas: null\n    path:',
        '  help:\n    schemas:\n      default:\n        path: .cloudcannon/schemas/help-article.md\n    path:',
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
      files['src/content/help/guide.mdx'] = article.replace('---\n', '---\n_schema: default\n');
    },
  },
  {
    name: 'creation template placeholder leaked into content',
    error: 'CREATION_TEMPLATE_SENTINEL',
    mutate(files) {
      files['src/content/help/guide.mdx'] = article.replace(
        'title: Guide\n',
        'title: Guide\nseoTitle: New help article | Inner Explorer\n',
      );
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
    name: 'select input with an empty value source',
    error: 'EMPTY_SELECT_VALUES',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '          values: collections.help[*].keywords',
        '          values: []',
      );
    },
  },
  {
    name: 'semantic snippet Select cannot become optional',
    error: 'SNIPPET_SELECT_OPTIONAL',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        - editor_key: type\n          type: string\n          default: tip',
        '        - editor_key: type\n          type: string\n          optional: true\n          default: tip\n          remove_empty: true',
      );
    },
  },
  {
    name: 'semantic snippet Select keeps its insertion default',
    error: 'SNIPPET_SELECT_DEFAULT',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        - editor_key: type\n          type: string\n          default: tip',
        '        - editor_key: type\n          type: string',
      );
    },
  },
  {
    name: 'semantic snippet argument uses a closed Select containing its default',
    error: 'SNIPPET_SELECT_INPUT',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  help_video:\n    template: mdx_component\n    definitions:\n      component_name: HelpVideo\n      named_args:\n        - editor_key: ratio\n          type: string\n          default: 16 / 9\n    _inputs:\n      ratio:\n        type: select',
        '  help_video:\n    template: mdx_component\n    definitions:\n      component_name: HelpVideo\n      named_args:\n        - editor_key: ratio\n          type: string\n          default: 16 / 9\n    _inputs:\n      ratio:\n        type: text',
      );
    },
  },
  {
    name: 'required semantic snippet Select removed from configuration',
    error: 'SNIPPET_SELECT_MISSING',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        / {2}help_figure:\n[\s\S]*?(?= {2}help_video:)/,
        '',
      );
    },
  },
  {
    name: 'semantic snippet Select declared twice',
    error: 'SNIPPET_SELECT_DUPLICATE',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '        - editor_key: type\n          type: string\n          default: tip',
        '        - editor_key: type\n          type: string\n          default: tip\n        - editor_key: type\n          type: string\n          default: tip',
      );
    },
  },
  {
    name: 'ineffective allow-empty option restored on a semantic snippet Select',
    error: 'SNIPPET_SELECT_ALLOW_EMPTY',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '          values: [tip, note, good]',
        '          values: [tip, note, good]\n          allow_empty: true',
      );
    },
  },
  {
    name: 'snippet arguments outside CloudCannon serializer order',
    error: 'NONCANONICAL_SNIPPET_ARG_ORDER',
    mutate(files) {
      files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
        '  help_video:\n    template: mdx_component\n    definitions:\n      component_name: HelpVideo\n      named_args:\n        - editor_key: ratio\n          type: string\n          default: 16 / 9\n    _inputs:',
        '  help_video:\n    template: mdx_component\n    definitions:\n      component_name: HelpVideo\n      named_args:\n        - editor_key: label\n          type: string\n        - editor_key: ratio\n          type: string\n          default: 16 / 9\n        - editor_key: caption\n          type: string\n          optional: true\n    _inputs:',
      );
      files['src/content/help/guide.mdx'] =
        `${article}<HelpVideo label="Test" caption="Test" ratio="16 / 9"/>\n`;
    },
  },
  {
    name: 'unbacked page with editable regions',
    error: 'UNBACKED_EDITABLE_PAGE',
    mutate(files) {
      files['dist-help/orphan/index.html'] =
        '<!doctype html><h1 data-editable="text" data-prop="title">Orphan</h1>';
    },
  },
  {
    name: 'help article still built under the old /help/ prefix',
    error: 'UNBACKED_EDITABLE_PAGE',
    mutate(files) {
      delete files['dist-help/guide/index.html'];
      files['dist-help/help/guide/index.html'] = html;
    },
  },
  {
    name: 'duplicate collection output URL',
    error: 'DUPLICATE_OUTPUT_URL',
    mutate(files) {
      files['src/content/help/guide.md'] = article;
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

test('absolute data bindings on pages that are not entries remain valid', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] += sharedData;
    files['src/data/shared.json'] = '{"title":"Shared title"}\n';
    files['dist-help/index.html'] =
      '<h1 data-editable="text" data-prop="@data[shared].title">Shared title</h1>';
    files['dist-help/404.html'] =
      '<h1 data-editable="text" data-prop="@data[shared].title">Shared title</h1>';
  });
  assert.equal(result.status, 0, result.output);
});

test('absolute singleton file bindings resolve data and input configuration', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] += `
file_config:
  - glob: src/data/shared.json
    _inputs:
      title: { type: text }
`;
    files['src/data/shared.json'] = '{"title":"Shared title"}\n';
    files['dist-help/guide/index.html'] =
      '<h1 data-editable="text" data-prop="@file[/src/data/shared.json].title">Shared title</h1>';
  });
  assert.equal(result.status, 0, result.output);
});

test('default invocation rejects a missing Help build root', () => {
  const result = runFixture((files) => {
    delete files['dist-help/guide/index.html'];
  });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Missing build output: dist-help/);
});

test('explicit build roots replace the default', () => {
  const result = runFixture(
    (files) => {
      files['scratch/guide/index.html'] = files['dist-help/guide/index.html'];
      delete files['dist-help/guide/index.html'];
    },
    ['scratch'],
  );
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /Scanned scratch — 1 pages/);
});

test('optional creation fields must still be present in the creation template', () => {
  const result = runFixture((files) => {
    files['src-help/lib/help-collection.ts'] = files['src-help/lib/help-collection.ts'].replace(
      'title: z.string(),',
      'title: z.string(), voice: z.object({ audio: z.string() }).optional(),',
    );
  });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /\bMISSING_CREATION_FIELD\b/);
  assert.match(result.output, /voice/);
});

test('creation placeholders remain valid while an entry is a draft', () => {
  const result = runFixture((files) => {
    files['src/content/help/guide.mdx'] = article.replace(
      'title: Guide\n',
      'title: New help article\nseoTitle: New help article | Inner Explorer\ndraft: true\n',
    );
  });
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /\bCREATION_TEMPLATE_SENTINEL\b/);
});

test('MDX components with array props match their snippet', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
      '_snippets:\n',
      `_snippets:
  steps:
    template: mdx_component
    definitions:
      component_name: Steps
      named_args:
        - editor_key: items
          type: array
`,
    );
    files['src/content/help/guide.mdx'] = `${article}\n${stepsUsage}\n`;
  });
  assert.equal(result.status, 0, result.output);
});

test('unrelated optional snippet defaults remain valid', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
      '_snippets:\n  callout:',
      `_snippets:
  badge:
    template: mdx_component
    definitions:
      component_name: Badge
      named_args:
        - editor_key: tone
          type: string
          optional: true
          default: neutral
  callout:`,
    );
  });
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /\bSNIPPET_SELECT_/);
});

test('snippet arguments in CloudCannon serializer order remain valid', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml'].replace(
      '  help_video:\n    template: mdx_component\n    definitions:\n      component_name: HelpVideo\n      named_args:\n        - editor_key: ratio\n          type: string\n          default: 16 / 9\n    _inputs:',
      '  help_video:\n    template: mdx_component\n    definitions:\n      component_name: HelpVideo\n      named_args:\n        - editor_key: label\n          type: string\n        - editor_key: ratio\n          type: string\n          default: 16 / 9\n        - editor_key: caption\n          type: string\n          optional: true\n    _inputs:',
    );
    files['src/content/help/guide.mdx'] =
      `${article}<HelpVideo label="Test" ratio="16 / 9" caption="Test"/>\n`;
  });
  assert.equal(result.status, 0, result.output);
});

test('preprocessed optional objects retain nested creation-structure validation', () => {
  const result = runFixture((files) => {
    files['src-help/lib/help-collection.ts'] = files['src-help/lib/help-collection.ts'].replace(
      'title: z.string(),',
      'title: z.string(), voice: z.preprocess((value) => value, z.object({ audio: z.string(), title: z.string() }).optional()),',
    );
    files['.cloudcannon/schemas/help-article.md'] =
      '---\ntitle: New guide\nitems: []\nvoice: null\n---\n';
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml']
      .replace(
        '    _inputs:\n      keywords:',
        '    _inputs:\n      voice:\n        type: object\n        options:\n          structures: _structures.voice\n      keywords:',
      )
      .replace(
        '  help_items:\n',
        "  voice:\n    values:\n      - value:\n          audio: ''\n  help_items:\n",
      );
  });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /\bMISSING_CREATION_STRUCTURE_FIELD\b/);
  assert.match(result.output, /title/);
});

test('exact file configuration with a $ root structure scopes entry inputs', () => {
  const result = runFixture((files) => {
    files['cloudcannon.config.yml'] = files['cloudcannon.config.yml']
      .replace(
        '      hero:\n        type: object\n        options:\n          structures: _structures.hero\n',
        '',
      )
      .replace(
        '_inputs:\n  title:',
        'file_config:\n  - glob: src/content/help/guide.mdx\n    _inputs:\n      $:\n        type: object\n        options:\n          structures: _structures.guide_root\n_inputs:\n  title:',
      )
      .replace(
        '_structures:\n',
        `_structures:
  guide_root:
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
      '      hero:\n        type: object',
      "      '$.hero':\n        type: object",
    );
    files['src/content/help/guide.mdx'] = article.replace(
      '---\nBody',
      'other:\n  hero: Nested name with a different shape\n---\nBody',
    );
  });
  assert.equal(result.status, 0, result.output);
});
