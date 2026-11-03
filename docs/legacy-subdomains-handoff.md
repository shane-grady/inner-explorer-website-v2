# Handoff: retire the old marketing site on web. and cto.innerexplorer.com

**For:** whoever runs the legacy Apache server (`Apache/2.4.56 (Amazon Linux)` with `mod_jk`).
**Why:** the new marketing site is live at https://www.innerexplorer.com, but two subdomains still
serve copies of the old one. Each copy answers `200`, with no canonical tag, no `noindex` and no
robots.txt, so Google sees duplicate pages competing with www. Other sites link to them too:
`web.innerexplorer.com/` has 27 referring domains (Semrush, 2026-11-03). Their link equity should
pass to www.

Found 2026-11-03 (Semrush Backlink Analytics and Site Audit, checked with curl).

## What each host does today

| Request                                                         | Today                                                                 | Should be                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| `web.innerexplorer.com/`                                        | `200`, the old marketing home page                                    | `301` → `https://www.innerexplorer.com/`                    |
| `web.innerexplorer.com/aboutus.html` (and every other old page) | `200`, the old page                                                   | `301` → the same path on www (see below)                    |
| `web.innerexplorer.com/compass/*`                               | `302` → `https://app.innerexplorer.com/login`                         | No change                                                   |
| `web.innerexplorer.com/robots.txt`                              | `404`                                                                 | Covered by the `301` (www's robots.txt answers)             |
| `cto.innerexplorer.com/`                                        | `200`, the old marketing home page                                    | `301` → `https://www.innerexplorer.com/`                    |
| `cto.innerexplorer.com/compass/*`                               | `200`: the old app still runs here (`/compass/login`, `/compass/faq`) | Keep serving if anything uses it, but out of search (below) |
| `http://cto.innerexplorer.com/`                                 | `301` → `https://cto.innerexplorer.org/`                              | Confirm this is intended                                    |

## 1. web.innerexplorer.com: send every non-app path to www

Send each path to the **same path on www**. The www site already has a 301 map of every legacy
URL (`netlify.toml` in the website repo: `/aboutus.html` → `/about/`, `/ie-program` →
`/program/`, and so on). So one rule here is enough, and the map stays in one place.

In the `web.innerexplorer.com` virtual host, inside the HTTPS `<VirtualHost>` (and the HTTP one,
or keep its existing redirect to HTTPS):

```apache
RewriteEngine On
# The app's paths keep their current behavior (the /compass/* redirects to app.innerexplorer.com).
# Add any other path the app or an API still serves here, one RewriteCond per prefix.
RewriteCond %{REQUEST_URI} !^/compass(/|$)
RewriteRule ^ https://www.innerexplorer.com%{REQUEST_URI} [R=301,L,NE]
```

`NE` keeps query strings and encoded characters as they were. Paths www doesn't know end on www's
404 page, which is fine. The links that matter are all in its map.

## 2. cto.innerexplorer.com: home page to www, keep the app out of search

`/compass/*` still serves the old app here. **Check with engineering whether anything still uses
it** (district portals, payments: `/compass/chargePaymentForDistrict` is linked from outside).

- **If nothing uses it:** apply the same rule as web. (section 1).
- **If it's still in use:** redirect only the marketing home page, and tell search engines not to
  index the host:

```apache
RewriteEngine On
RewriteRule ^/?$ https://www.innerexplorer.com/ [R=301,L]

# A staging/app host: nothing here belongs in search results.
Header set X-Robots-Tag "noindex, nofollow"
```

(`Header` needs `mod_headers`, which Amazon Linux's Apache loads by default.)

## 3. lms.innerexplorer.org

The website's `tasks/todo.md` notes that `lms.innerexplorer.org` copies of the old case-study
pages and PDFs are served by this same server. If they still answer, give that host the same
treatment as section 1. Its paths map onto www the same way (`/case-study1` → www's
`/case-study1` → `/case-studies/kaiser-elementary/`).

## Check it worked

Each of these should print `301` and a www URL (or, for `/compass/`, the app's `302`):

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" https://web.innerexplorer.com/
```

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" https://web.innerexplorer.com/aboutus.html
```

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" https://web.innerexplorer.com/compass/login
```

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" https://cto.innerexplorer.com/
```

```bash
curl -sSI https://cto.innerexplorer.com/compass/login | grep -i x-robots-tag
```

Then, in Semrush Backlink Analytics › Indexed Pages for `innerexplorer.com`, the `web.` and `cto.`
URLs should show `301` after Semrush's next crawl. In Google Search Console, the old pages drop out
over the following weeks.
