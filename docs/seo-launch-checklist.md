# SEO Launch Checklist for layanaboutique.in

## 1) Netlify + GoDaddy pre-launch

- Set Netlify production env var: `NEXT_PUBLIC_SITE_URL=https://layanaboutique.in`
- Set `layanaboutique.in` as Netlify primary domain.
- Ensure GoDaddy DNS points both apex and `www` to the same Netlify site.
- Verify Netlify SSL is active for `layanaboutique.in` and `www.layanaboutique.in`.

## 2) Redirect and canonical checks (T+0)

Run these commands and confirm all non-canonical variants return a single-hop `301` to `https://layanaboutique.in/...`:

```bash
curl -I https://www.layanaboutique.in
curl -I http://www.layanaboutique.in
curl -I http://layanaboutique.in
curl -I https://www.layanaboutique.com
curl -I https://layanaboutique.com
```

## 3) Crawl/index checks (T+0)

```bash
curl -I https://layanaboutique.in/robots.txt
curl -I https://layanaboutique.in/sitemap.xml
curl -I https://layanaboutique.in/opengraph-image
```

Expected:

- `robots.txt` and `sitemap.xml` return `200`
- `sitemap.xml` includes canonical `.in` URLs
- OG endpoint returns `200`

## 4) Metadata checks (T+0)

Inspect source on:

- Home: `https://layanaboutique.in/`
- Category: `https://layanaboutique.in/collections/sarees`
- Product: `https://layanaboutique.in/product/<id>`

Validate:

- Canonical URL host is always `https://layanaboutique.in`
- Open Graph/Twitter images resolve
- JSON-LD `Organization.url` and `Product.url` use `.in`

## 5) Google Search Console (T+24h, T+7d)

- Add Domain property for `layanaboutique.in`
- Submit sitemap: `https://layanaboutique.in/sitemap.xml`
- Review:
  - Page indexing report
  - Canonical selection conflicts
  - Crawl stats and server errors
  - Core Web Vitals status

## 6) Ongoing monitoring

- Re-check redirects and robots/sitemap after major releases.
- Watch for new 404s and soft-404s in Search Console.
- Keep collection and product copy unique and regularly refreshed.

