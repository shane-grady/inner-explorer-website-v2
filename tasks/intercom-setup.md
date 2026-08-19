# Intercom — how the three sources are wired

Workspace: **Inner Explorer** · app ID **`a185fzec`** (this is the public Messenger
`app_id`; it is not a secret).

Goal: every conversation from the **platform**, the **marketing site**, and the
**Help Center** lands in one queue, labelled by where it started.

## The mechanism

One custom attribute on each side, joined by one workflow:

| Layer                  | Name            | Set by                                          | Values                               |
| ---------------------- | --------------- | ----------------------------------------------- | ------------------------------------ |
| People attribute       | `ie_source`     | the Messenger snippet on each surface           | `Website`, `Help Center`, `Platform` |
| Conversation attribute | `Source` (list) | Intercom workflow **Stamp conversation Source** | same three                           |

`ie_source` follows the person and is overwritten whenever they move between
surfaces. `Source` is written **once, at conversation start**, so it stays accurate
forever — that's why the label lives on the conversation and the views filter on it,
not on the person.

**Workflow — "Stamp conversation Source"** (live). Trigger: _customer sends their
first message_, Messenger channels only (Web/iOS/Android — Email is deliberately
unchecked so email threads aren't mislabelled). One `Apply rules` step, four rules:

```
ie_source is Website      → Source = Website
ie_source is Help Center   → Source = Help Center
ie_source is Platform      → Source = Platform
ie_source is unknown       → Source = Platform   ← safety net, see below
```

**Inbox views:** `Website`, `Help Center`, `Platform`, each filtered `Source is <x>`.
Nothing is routed to a separate team inbox — one shared queue, three saved filters.

**`ie_source` has "Require verified updates" turned OFF.** It has to be: the website
and Help Center are anonymous visitors with no JWT, and Intercom silently discards
protected-attribute writes from unauthenticated sources. `ie_source` is a
non-sensitive label, so this is safe. Do not turn it on — it would break the labels
without any error.

## Site side — done

`src/components/integrations/Intercom.astro`, rendered from `BaseLayout`, gated on
`PUBLIC_INTERCOM_APP_ID` + a real production build (same gate as GA4). The Help
Center build passes `surface="Help Center"`; everything else defaults to `Website`.

**Set `PUBLIC_INTERCOM_APP_ID=a185fzec` in Netlify env vars on BOTH sites** —
`innerexplorerwebsitev2` and `inner-explorer-help`. Each build reads its own env, so
missing it on one site silently means no Messenger there.

## Platform side — TODO (needs a platform engineer)

Two separate jobs. The second one is a security issue.

### 1. Stamp the source

Add `ie_source: 'Platform'` to the existing boot config:

```js
window.intercomSettings = {
  app_id: 'a185fzec',
  // ...existing user fields (user_id, email, name, created_at, company, …)
  ie_source: 'Platform',
};
```

Until this ships, platform chats are caught by the `ie_source is unknown` rule and
still land in the Platform view — so nothing is broken, it's just implicit. Setting it
explicitly makes the rule redundant instead of load-bearing.

### 2. Turn on identity verification (JWT) — security

Intercom currently reports the web Messenger as **"Insecurely installed"**. Without
identity verification, anyone can boot the Messenger claiming another district user's
`user_id`/`email` and read that person's conversation history. For a K-12 product
holding staff and student-adjacent data, that should not ship.

Intercom's 2026 mechanism is a **JWT** (not the older `user_hash` HMAC):

1. Settings → Channels → Messenger → **Security** → copy the **Unified Secret**
   (server-side only — never expose it to the browser or commit it).
2. On the server, per authenticated session:
   ```js
   const jwt = require('jsonwebtoken');
   const token = jwt.sign(
     { user_id: currentUser.id, email: currentUser.email },
     process.env.INTERCOM_SECRET,
     { expiresIn: '1h' },
   );
   ```
3. Pass it to the client and include it in the boot config as
   `intercom_user_jwt: token`, then refresh before expiry.
4. Flip enforcement on in Messenger → Security once it's verified in staging.

Anonymous visitors are unaffected by enforcement — it only applies to boots that
claim an identity — so enabling it will **not** break the marketing site or Help
Center installs.

## Deliberately not done

- **Intercom's own Help Center stays unpublished.** `help.innerexplorer.com` (built
  from this repo) is the only public help centre. Publishing Intercom's too would put
  the same articles on two domains competing for the same queries.
- Instead, Fin/Copilot read the real thing: Knowledge Hub → Websites →
  **`help.innerexplorer.com (live site)`**, 14 pages, re-synced weekly. No article
  migration, and the CloudCannon editing workflow is untouched.
- **Fin AI Agent is still off.** Only Copilot (agent-assist) is live. Turning Fin on
  is a separate decision — if you do, revisit `/contact`'s "no phone trees, no dead
  ends" promise.
- Intercom's 4 sample conversations (`Messenger · [Demo]` etc.) are still in the
  inbox. They pre-date the workflow so they carry no `Source` and won't appear in the
  three views; close them whenever you want a clean queue.
