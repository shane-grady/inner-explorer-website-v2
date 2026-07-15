#!/usr/bin/env node

import { readdirSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const rawBaseUrl = process.argv[2] ?? process.env.CLOUDCANNON_URL;
const outputDirectory = process.argv[3] ?? 'dist';
const concurrency = 2;

if (!rawBaseUrl) {
  console.error('Usage: node scripts/verify-cloudcannon.mjs <cloudcannon-url> [output-directory]');
  process.exit(1);
}

const baseUrl = new URL(rawBaseUrl);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function outputPathToUrl(path) {
  const outputPath = `/${relative(outputDirectory, path).split(sep).join('/')}`;
  if (outputPath === '/index.html') return '/';
  return outputPath.endsWith('/index.html') ? outputPath.slice(0, -10) : outputPath;
}

function addReference(references, rawReference, sourcePath) {
  if (
    !rawReference ||
    rawReference.startsWith('#') ||
    rawReference.startsWith('data:') ||
    rawReference.startsWith('javascript:') ||
    rawReference.startsWith('mailto:') ||
    rawReference.startsWith('tel:')
  ) {
    return;
  }

  let url;
  try {
    url = new URL(rawReference, new URL(sourcePath, baseUrl));
  } catch {
    return;
  }

  if (url.origin !== baseUrl.origin) return;
  url.hash = '';
  const key = `${url.pathname}${url.search}`;
  const sources = references.get(key) ?? new Set();
  sources.add(sourcePath);
  references.set(key, sources);
}

async function mapWithConcurrency(values, callback) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await callback(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchResult(path) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await delay(100);
      const response = await fetch(new URL(path, baseUrl), { redirect: 'follow' });
      const body = await response.text();

      if (response.status === 429 && attempt < 4) {
        const retryAfter = Number(response.headers.get('retry-after'));
        await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : 500 * 2 ** attempt);
        continue;
      }

      return {
        path,
        status: response.status,
        finalPath: new URL(response.url).pathname,
        contentType: response.headers.get('content-type') ?? '',
        body,
      };
    } catch (error) {
      if (attempt === 4) {
        return { path, error: error instanceof Error ? error.message : String(error), body: '' };
      }
      await delay(500 * 2 ** attempt);
    }
  }

  return { path, error: 'Request failed without a response', body: '' };
}

const pagePaths = walk(outputDirectory)
  .filter((path) => extname(path) === '.html')
  .map(outputPathToUrl)
  .sort();

const pageResults = await mapWithConcurrency(pagePaths, fetchResult);
const pageFailures = pageResults.filter(
  ({ error, status, contentType, body }) =>
    error ||
    !status ||
    status >= 400 ||
    !contentType.includes('text/html') ||
    body.includes('Site not built'),
);

const references = new Map();
for (const { path, body } of pageResults) {
  for (const match of body.matchAll(/(?:^|\s)(?:href|poster|src)=["']([^"']+)["']/gi)) {
    addReference(references, match[1], path);
  }

  for (const match of body.matchAll(/(?:^|\s)srcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) {
      addReference(references, candidate.trim().split(/\s+/)[0], path);
    }
  }
}

const referencePaths = [...references.keys()].sort();
const referenceResults = await mapWithConcurrency(referencePaths, async (path) => ({
  ...(await fetchResult(path)),
  sources: [...references.get(path)].sort(),
}));
const referenceFailures = referenceResults.filter(
  ({ error, status }) => error || !status || status >= 400,
);

const report = {
  baseUrl: baseUrl.origin,
  pagesTested: pageResults.length,
  referencesTested: referenceResults.length,
  pageFailures: pageFailures.map(({ body: _body, ...result }) => result),
  referenceFailures: referenceFailures.map(({ body: _body, ...result }) => result),
};

console.log(JSON.stringify(report, null, 2));

if (pageFailures.length || referenceFailures.length) process.exit(1);
