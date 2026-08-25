#!/usr/bin/env node
/**
 * Builds the /contact HubSpot form definition (portal 44976911) from the field spec below.
 *
 * Why this exists as a script rather than a one-off done in HubSpot's UI: the field set IS
 * the contract between the page's design and the CRM. Keeping it in the repo means the eight
 * fields, their labels, their order and their required flags are reviewable, diffable, and
 * reproducible if the form is ever rebuilt or cloned into another portal.
 *
 * Run it yourself — it needs a token this repo must never contain:
 *
 *   HUBSPOT_PRIVATE_APP_TOKEN=… node scripts/hubspot-contact-form.mjs --dry-run
 *   HUBSPOT_PRIVATE_APP_TOKEN=… node scripts/hubspot-contact-form.mjs
 *
 * The token needs the `forms` scope (plus `crm.schemas.contacts.read`, used to read the
 * dropdown options). Create it in HubSpot under Settings > Integrations > Private Apps.
 *
 * Blast radius, deliberately kept as small as possible:
 *
 *  - It PATCHes exactly one form, by hardcoded id, and sends ONLY `fieldGroups`. Notification
 *    recipients, lifecycle stages, reCAPTCHA, the post-submit action, the theme and every
 *    style value are untouched.
 *  - It refuses to run if the live form holds any field this spec would not recreate (see the
 *    interlock below), so it cannot silently destroy a form that someone has since built out,
 *    and a mistyped form id fails loudly instead of overwriting a stranger.
 *  - It sets nothing at form level that would change how the form renders in OTHER embeds.
 *    The one thing that keeps this form out of an iframe is `css: ''` in HubSpotForm.astro —
 *    a per-embed option, scoped to our page. (`displayOptions.renderRawHtml` would achieve
 *    the same thing form-wide, which is exactly why it is not used: it would restyle every
 *    other place this form is ever embedded.)
 *  - Dropdown options are read from the CRM property definitions at run time rather than
 *    hardcoded, so the form cannot drift from the properties it writes to. Properties are
 *    only ever READ.
 *
 * Read-modify-write and idempotent: re-running it is a no-op.
 */

const FORM_ID = '48e37214-69e4-479f-b03b-1ae2ab5dfbd4';
// The form name is what shows up as each contact's `recent_conversion_event_name`, so it is
// reporting-visible, not cosmetic. "V2" distinguishes this from the legacy site's captured
// forms, which are still collecting on the current innerexplorer.com pages.
const FORM_NAME = 'Contact — innerexplorer.com V2';
const API = 'https://api.hubapi.com';
const CONTACT_OBJECT_TYPE_ID = '0-1';

// One array per row of the form, mirroring the design: two-up until School name, which sits
// alone on the left half, then the full-width message. The page's CSS grid is what actually
// produces that layout (see HubSpotForm.astro) — the grouping here keeps HubSpot's own
// editor preview and any other embed of this form looking the same.
const ROWS = [
  [
    { name: 'firstname', label: 'First name', fieldType: 'single_line_text', required: true },
    { name: 'lastname', label: 'Last name', fieldType: 'single_line_text', required: true },
  ],
  [
    { name: 'email', label: 'Email', fieldType: 'email', required: true },
    {
      name: 'job_role',
      label: 'Job role',
      fieldType: 'dropdown',
      required: true,
      placeholder: 'Select one',
    },
  ],
  [
    {
      name: 'stateabreviation',
      label: 'State or region',
      fieldType: 'dropdown',
      required: true,
      placeholder: 'Select one',
    },
    {
      name: 'district_name',
      label: 'District name',
      fieldType: 'single_line_text',
      required: true,
    },
  ],
  [{ name: 'school_name', label: 'School name', fieldType: 'single_line_text', required: false }],
  [
    {
      name: 'message',
      label: 'Message for our team',
      fieldType: 'multi_line_text',
      required: false,
    },
  ],
];

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

if (!token) {
  console.error(
    'HUBSPOT_PRIVATE_APP_TOKEN is not set.\n\n' +
      'Create a private app with the `forms` and `crm.schemas.contacts.read` scopes\n' +
      '(HubSpot > Settings > Integrations > Private Apps), then:\n\n' +
      '  export HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-your-real-token\n' +
      '  node scripts/hubspot-contact-form.mjs --dry-run',
  );
  process.exit(1);
}

// An HTTP header value can hold ASCII only. Without this check, a placeholder that was run
// literally (or a token mangled in transit) fails deep inside fetch with an opaque undici
// "Cannot convert argument to a ByteString" error that says nothing about the real cause.
if (!/^[\x21-\x7e]+$/.test(token)) {
  const bad = [...token].find((c) => c < '\x21' || c > '\x7e');
  const point = bad.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  console.error(
    `HUBSPOT_PRIVATE_APP_TOKEN contains ${JSON.stringify(bad)} (U+${point}), which cannot go\n` +
      'in an HTTP header.\n\n' +
      'If that is an ellipsis or a quote, a placeholder was run literally instead of being\n' +
      'replaced with the real token. Set it and try again:\n\n' +
      '  export HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-your-real-token\n' +
      '  node scripts/hubspot-contact-form.mjs --dry-run',
  );
  process.exit(1);
}

if (!token.startsWith('pat-')) {
  console.warn('Warning: HubSpot private app tokens normally start with "pat-". Continuing.');
}

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const body = await res.text();
  if (!res.ok) {
    // Exit rather than throw: this is a CLI a person runs, and a stack trace through
    // undici tells them nothing they can act on.
    const hint =
      res.status === 401
        ? '\nThe token was rejected. Check it was copied whole and has not been rotated.'
        : res.status === 403
          ? `\nAuthenticated but not authorized — the private app is probably missing a scope.\nThis call needs: ${path.startsWith('/crm/') ? 'crm.schemas.contacts.read' : 'forms'}`
          : res.status === 404
            ? '\nNot found. Check the form id at the top of this script matches a form in this portal.'
            : '';
    console.error(`${init.method ?? 'GET'} ${path} → ${res.status}${hint}\n\n${body}`);
    process.exit(1);
  }
  return body ? JSON.parse(body) : null;
}

/** Enumerated options for a dropdown, taken from the CRM property that backs it. */
async function optionsFor(propertyName) {
  const prop = await api(`/crm/v3/properties/contacts/${propertyName}`);
  const options = (prop.options ?? [])
    .filter((o) => !o.hidden)
    .map((o, i) => ({ label: o.label, value: o.value, displayOrder: i }));
  if (!options.length) {
    throw new Error(`Contact property "${propertyName}" has no selectable options.`);
  }
  return options;
}

function buildField(spec, optionsByName) {
  const field = {
    objectTypeId: CONTACT_OBJECT_TYPE_ID,
    name: spec.name,
    label: spec.label,
    required: spec.required,
    hidden: false,
    fieldType: spec.fieldType,
    dependentFields: [],
  };
  if (spec.placeholder) field.placeholder = spec.placeholder;
  if (spec.fieldType === 'email') {
    field.validation = { blockedEmailDomains: [], useDefaultBlockList: false };
  }
  if (spec.fieldType === 'dropdown') {
    field.options = optionsByName.get(spec.name);
    field.defaultValues = [];
  }
  return field;
}

const fieldNames = (groups) => (groups ?? []).flatMap((g) => g.fields.map((f) => f.name));

const summarize = (groups) =>
  (groups ?? [])
    .map(
      (g, i) =>
        `  ${i + 1}. ${g.fields.map((f) => `${f.name}${f.required ? '*' : ''}`).join(' | ')}`,
    )
    .join('\n');

/**
 * Comparable projection of a fieldGroups array.
 *
 * A byte comparison of what we send against what a later GET returns can never match:
 * HubSpot drops `dependentFields` and `defaultValues` from its responses, adds
 * `description: ''` to every option, and does not preserve key order. So compare only the
 * properties this script actually controls, in a fixed order.
 */
const canonical = (groups) =>
  JSON.stringify(
    (groups ?? []).map((g) => ({
      groupType: g.groupType,
      richTextType: g.richTextType,
      fields: (g.fields ?? []).map((f) => ({
        name: f.name,
        label: f.label,
        required: !!f.required,
        hidden: !!f.hidden,
        fieldType: f.fieldType,
        placeholder: f.placeholder ?? '',
        options: (f.options ?? []).map((o) => ({
          label: o.label,
          value: o.value,
          displayOrder: o.displayOrder,
        })),
      })),
    })),
  );

const current = await api(`/marketing/v3/forms/${FORM_ID}`);
console.log(`Form:  ${current.name}`);
console.log(`Id:    ${FORM_ID}`);
console.log(`Type:  ${current.formType}`);
console.log('Current fields:');
console.log(summarize(current.fieldGroups) || '  (none)');

if (current.formType !== 'hubspot') {
  console.error(
    `\nRefusing to write: formType is "${current.formType}", not "hubspot".\n` +
      'Captured, flow and blog_comment forms cannot be embedded and must not be rewritten.',
  );
  process.exit(1);
}

const targetNames = ROWS.flat().map((f) => f.name);
const orphans = fieldNames(current.fieldGroups).filter((n) => !targetNames.includes(n));
if (orphans.length && !force) {
  console.error(
    `\nRefusing to write: this form holds ${orphans.length} field(s) the spec would delete:\n` +
      orphans.map((n) => `  - ${n}`).join('\n') +
      '\n\nThat usually means the form id is wrong, or someone has built this form out since\n' +
      'the spec was written. Check the form (and its submission count) in HubSpot first.\n' +
      'Pass --force only if losing those fields is genuinely intended.',
  );
  process.exit(1);
}

const dropdowns = ROWS.flat().filter((f) => f.fieldType === 'dropdown');
const optionsByName = new Map(
  await Promise.all(dropdowns.map(async (f) => [f.name, await optionsFor(f.name)])),
);

const fieldGroups = ROWS.map((row) => ({
  groupType: 'default_group',
  richTextType: 'text',
  fields: row.map((spec) => buildField(spec, optionsByName)),
}));

console.log('\nTarget fields:');
console.log(summarize(fieldGroups));
for (const [name, options] of optionsByName) {
  console.log(
    `  ${name}: ${options.length} options (${options[0].label} … ${options.at(-1).label})`,
  );
}

const fieldsMatch = canonical(current.fieldGroups) === canonical(fieldGroups);
const nameMatches = current.name === FORM_NAME;

if (!nameMatches) {
  console.log(`\nRename: ${JSON.stringify(current.name)} -> ${JSON.stringify(FORM_NAME)}`);
}

if (fieldsMatch && nameMatches) {
  console.log('\nAlready up to date — nothing to write.');
  process.exit(0);
}

const patch = { fieldGroups };
if (!nameMatches) patch.name = FORM_NAME;

if (dryRun) {
  console.log('\n--dry-run: not writing. Payload:');
  console.log(JSON.stringify(patch, null, 2));
  process.exit(0);
}

await api(`/marketing/v3/forms/${FORM_ID}`, { method: 'PATCH', body: JSON.stringify(patch) });
console.log('\nUpdated. The embed on /contact picks this up on next page load — no deploy needed.');
