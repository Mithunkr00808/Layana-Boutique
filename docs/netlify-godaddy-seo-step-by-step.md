# Netlify + GoDaddy SEO Launch Guide (Step by Step)

This checklist is written for launching `layanaboutique.in` on Netlify with strong technical SEO.

## What is already implemented in code

- Canonical URL helper wired across metadata, robots, sitemap, and JSON-LD.
- Netlify redirect rules for canonical host enforcement.
- `noindex,nofollow` added to private routes (`/admin`, `/account`, `/cart`, `/checkout`, order confirmation).
- Dynamic OG image route at `/opengraph-image`.
- Web manifest route at `/manifest.webmanifest`.
- Extra on-page SEO copy and internal links on home, collections, and product pages.

## Step 1: Netlify environment variables

In Netlify site settings -> Environment variables (Production), set:

- `NEXT_PUBLIC_SITE_URL=https://layanaboutique.in`

Optional but recommended:

- Keep the same var in Deploy Preview (if you want previews to behave with canonical host, otherwise use preview URL strategy separately).

## Step 2: Connect domain in Netlify

In Netlify -> Domain management:

- Add custom domain: `layanaboutique.in`
- Add alias domain: `www.layanaboutique.in`
- Set **Primary domain** to: `layanaboutique.in` (non-www canonical)

## Step 3: Update GoDaddy DNS

In GoDaddy DNS for `layanaboutique.in`:

- Point apex (`@`) to Netlify target values shown in Netlify domain setup.
- Point `www` CNAME to Netlify target value.
- Remove conflicting old records for the same hostnames.
- Use low TTL (300-600) during cutover, increase later.

Wait for propagation.

## Step 4: SSL/HTTPS readiness

In Netlify domain panel:

- Confirm SSL certificate is issued for both:
  - `layanaboutique.in`
  - `www.layanaboutique.in`
- Ensure HTTPS is active before marketing/indexing push.

## Step 5: Deploy latest code

Deploy the current branch containing SEO changes.

After deployment, verify these routes load:

- `https://layanaboutique.in/`
- `https://layanaboutique.in/robots.txt`
- `https://layanaboutique.in/sitemap.xml`
- `https://layanaboutique.in/opengraph-image`
- `https://layanaboutique.in/manifest.webmanifest`

## Step 6: Verify redirect behavior (must pass)

Run locally in terminal:

```bash
curl -I https://www.layanaboutique.in
curl -I http://www.layanaboutique.in
curl -I http://layanaboutique.in
curl -I https://www.layanaboutique.com
curl -I https://layanaboutique.com
```

Expected:

- All non-canonical variants return `301`.
- Final destination is `https://layanaboutique.in/...`.
- Avoid multi-hop chains if possible.

## Step 7: Verify page-level SEO tags

Check page source (or SEO browser extension) for:

- Home: `https://layanaboutique.in/`
- Collection: `https://layanaboutique.in/collections/sarees`
- Product: `https://layanaboutique.in/product/<real-product-id>`

Confirm:

- Canonical tag host = `https://layanaboutique.in`
- Open Graph/Twitter image uses `/opengraph-image` or valid product image
- JSON-LD values use `.in` host

## Step 8: Verify deindexing of private pages

Open these pages and inspect robots metadata:

- `/admin`
- `/account`
- `/cart`
- `/checkout`
- `/order/<id>/confirmation`

Confirm they are `noindex,nofollow`.

## Step 9: Google Search Console setup

In Google Search Console:

- Add Domain Property for `layanaboutique.in`
- Verify ownership via DNS (GoDaddy)
- Submit sitemap:
  - `https://layanaboutique.in/sitemap.xml`

## Step 10: Post-launch monitoring schedule

### T+0 (immediately after launch)

- Redirect checks
- `robots.txt` and `sitemap.xml` availability
- Canonical tag spot-check

### T+24 hours

- Check Search Console indexing and crawl status
- Confirm no major canonical conflicts
- Check 404s and redirect issues in Netlify logs

### T+7 days

- Review indexing trend and discovered pages
- Re-check Core Web Vitals status
- Confirm no sudden drops in crawlability

## Step 11: Ongoing SEO maintenance

- Keep collection and product content unique and descriptive.
- Add internal links from editorial/home sections to key collections.
- Re-submit sitemap after major catalog updates if needed.
- Monitor Search Console weekly during the first month.

## Quick go-live acceptance checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://layanaboutique.in` in Netlify production
- [ ] Apex + `www` connected in Netlify
- [ ] GoDaddy DNS points correctly to Netlify
- [ ] SSL active for apex + `www`
- [ ] All non-canonical hosts redirect with `301` to canonical
- [ ] `robots.txt` returns `200`
- [ ] `sitemap.xml` returns `200` with canonical URLs
- [ ] `/opengraph-image` returns `200`
- [ ] Private routes are `noindex,nofollow`
- [ ] Sitemap submitted in Search Console

