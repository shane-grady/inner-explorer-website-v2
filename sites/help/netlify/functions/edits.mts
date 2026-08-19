// TEMP CMS (see TEMP-CMS.md) — shared storage for the copy-editing replica.
//
// This file exists ONLY on the throwaway `temp-cms` branch. It persists the team's
// in-browser text edits in Netlify Blobs so edits survive reloads and are shared by
// everyone. The site-wide Basic-Auth edge function (temp-cms-auth.ts) gates every
// route including this one, so no separate token is needed here.
//
// API (same origin, under Basic auth):
//   GET    /api/edits?path=/classroom-setup/   → { blocks: { [key]: Block } }
//   GET    /api/edits?export=1                 → { exportedAt, pages: { [path]: blocks } }
//   POST   /api/edits          body: Block     → upsert one block edit (reverts if
//                                                the new content equals the original)
//   DELETE /api/edits?path=…&key=…             → revert one block edit
//   POST   /api/edits?wipe=1                   → clear the whole store (after a sync
//                                                lands on main, or at teardown)
import { getStore } from '@netlify/blobs';

interface Block {
  path: string;
  key: string;
  tag: string;
  pageTitle?: string;
  originalText: string;
  originalHtml: string;
  newText: string;
  newHtml: string;
  /** 'link' = an href change on a standalone anchor; text/html fields carry the label. */
  kind?: string;
  originalHref?: string;
  newHref?: string;
  editor?: string;
  updatedAt?: string;
}

type PageDoc = { blocks: Record<string, Block> };

const MAX_FIELD = 60_000; // chars; largest help article block is far below this

function store() {
  return getStore({ name: 'temp-cms-edits', consistency: 'strong' });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function isValidBlock(b: unknown): b is Block {
  if (typeof b !== 'object' || b === null) return false;
  const o = b as Record<string, unknown>;
  const strs = ['path', 'key', 'tag', 'originalText', 'originalHtml', 'newText', 'newHtml'];
  const optional = ['kind', 'originalHref', 'newHref'];
  return (
    strs.every((k) => typeof o[k] === 'string') &&
    (o.path as string).startsWith('/') &&
    strs.every((k) => (o[k] as string).length <= MAX_FIELD) &&
    optional.every(
      (k) =>
        o[k] === undefined || (typeof o[k] === 'string' && (o[k] as string).length <= MAX_FIELD),
    ) &&
    (o.kind !== 'link' || (typeof o.originalHref === 'string' && typeof o.newHref === 'string'))
  );
}

// Blob keys must not start with "/" (and percent-encoding trips the client's own
// validation), so page paths are stored base64url-encoded. Paths are ASCII URLs,
// so btoa/atob are safe here.
function keyFor(path: string): string {
  return btoa(path).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pathFor(key: string): string {
  const padded = key.replace(/-/g, '+').replace(/_/g, '/');
  return atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
}

async function readPage(path: string): Promise<PageDoc> {
  const doc = (await store().get(keyFor(path), { type: 'json' })) as PageDoc | null;
  return doc ?? { blocks: {} };
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.searchParams.get('export')) {
    const { blobs } = await store().list();
    const pages: Record<string, Record<string, Block>> = {};
    for (const { key } of blobs) {
      const doc = (await store().get(key, { type: 'json' })) as PageDoc | null;
      if (doc && Object.keys(doc.blocks).length > 0) {
        pages[pathFor(key)] = doc.blocks;
      }
    }
    return json({ exportedAt: new Date().toISOString(), pages });
  }

  if (request.method === 'GET') {
    const path = url.searchParams.get('path');
    if (!path) return json({ error: 'missing path' }, 400);
    return json(await readPage(path));
  }

  if (request.method === 'POST' && url.searchParams.get('wipe')) {
    const { blobs } = await store().list();
    for (const { key } of blobs) await store().delete(key);
    return json({ wiped: blobs.length });
  }

  if (request.method === 'POST') {
    let block: unknown;
    try {
      block = await request.json();
    } catch {
      return json({ error: 'invalid JSON' }, 400);
    }
    if (!isValidBlock(block)) return json({ error: 'invalid block' }, 400);

    const doc = await readPage(block.path);
    const reverted =
      block.kind === 'link'
        ? block.newHref === block.originalHref
        : block.newHtml === block.originalHtml && block.newText === block.originalText;
    if (reverted) {
      delete doc.blocks[block.key];
    } else {
      doc.blocks[block.key] = { ...block, updatedAt: new Date().toISOString() };
    }
    await store().setJSON(keyFor(block.path), doc);
    return json({ ok: true, reverted, count: Object.keys(doc.blocks).length });
  }

  if (request.method === 'DELETE') {
    const path = url.searchParams.get('path');
    const key = url.searchParams.get('key');
    if (!path || !key) return json({ error: 'missing path or key' }, 400);
    const doc = await readPage(path);
    delete doc.blocks[key];
    await store().setJSON(keyFor(path), doc);
    return json({ ok: true, count: Object.keys(doc.blocks).length });
  }

  return json({ error: 'method not allowed' }, 405);
}

export const config = { path: '/api/edits' };
