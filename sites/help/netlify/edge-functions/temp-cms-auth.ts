// TEMP CMS (see TEMP-CMS.md) — Basic-Auth gate for the copy-editing replica.
//
// This file exists ONLY on the throwaway `temp-cms` branch; the branch deploy it
// guards is the internal editable copy of the Help Center. Every request (pages,
// assets, /api/edits) must present the shared credential recorded in TEMP-CMS.md.
//
// The expected value is a SHA-256 of the "user:password" pair baked in below —
// deliberately not a Netlify env var, so the whole tool tears down by deleting the
// branch (and env-var writes have silently no-op'd in this workspace before).

type Context = { next(): Promise<Response> };

// sha256(user + ':' + password) as lowercase hex. Credentials live in TEMP-CMS.md.
const EXPECTED_HASH = '2725a1ed762b4cc57bad7fea5e802b4c67567dd8bf110cdef3b6c9be1952e9c4';

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default async function handler(request: Request, context: Context): Promise<Response> {
  const auth = request.headers.get('authorization') ?? '';
  if (auth.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(auth.slice(6));
    } catch {
      // fall through to the 401 below
    }
    if (decoded && (await sha256Hex(decoded)) === EXPECTED_HASH) {
      return context.next();
    }
  }
  return new Response('This is an internal Inner Explorer editing site. Sign in to continue.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Inner Explorer copy editing", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = { path: '/*' };
