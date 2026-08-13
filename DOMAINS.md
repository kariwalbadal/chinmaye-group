# Chinmaye — domain & namespace rules

One rule, applied to every property, current and future.

## The rule

| Purpose | Pattern | Example |
|---|---|---|
| Brand site (all properties) | `chinmaye.in` | chinmaye.in |
| A property's website | `<property>.chinmaye.in` | `inn.chinmaye.in`, `grand.chinmaye.in`, `deoghar.chinmaye.in` |
| A property's booking engine (STAAH mask) | `booking.<property>.chinmaye.in` | `booking.grand.chinmaye.in` |

**Grandfathered exception:** the Inn's booking engine is **`booking.chinmaye.in`**.
It was whitelisted with STAAH before this scheme existed and changing a STAAH
whitelist takes days. It stays where it is — it works fine regardless of where
the Inn's website lives, because the engine is hosted by STAAH (CloudFront),
not by us. Do not reuse the bare `booking.` name for any other property.

Before a property has a real website, it may live as a page on the brand site
(e.g. `chinmaye.in/deoghar/`). When its site ships, it moves to its subdomain
and the old path keeps a redirect stub (see `/grand/` in this repo).

## Who serves what

- **GitHub Pages** serves all websites — one repo per site, the repo's `CNAME`
  file declares its domain: `chinmaye-group` → chinmaye.in, `chinmaye-inn` →
  inn.chinmaye.in, `chinmaye-grand` → grand.chinmaye.in, (future)
  `chinmaye-deoghar` → deoghar.chinmaye.in.
- **STAAH** serves booking engines on their own CloudFront; we only point a
  CNAME at the hostname they give us.

## DNS (Hostinger) — the standing records

| Type | Name | Value |
|---|---|---|
| A ×4 | `@` | 185.199.108.153 · 185.199.109.153 · 185.199.110.153 · 185.199.111.153 |
| CNAME | `www` | `kariwalbadal.github.io` |
| CNAME | `inn` | `kariwalbadal.github.io` |
| CNAME | `grand` | `kariwalbadal.github.io` |
| CNAME | `booking` | *(STAAH's CloudFront hostname — do not touch)* |

## Adding the next property (Deoghar checklist)

1. Create repo `chinmaye-deoghar`, root `index.html`, `CNAME` file containing
   `deoghar.chinmaye.in`.
2. Enable GitHub Pages (branch `main`, path `/`), custom domain
   `deoghar.chinmaye.in`, enforce HTTPS once the cert is issued.
3. Hostinger: add `CNAME deoghar → kariwalbadal.github.io`.
4. When STAAH (or any engine) is contracted: ask them to whitelist
   `booking.deoghar.chinmaye.in`, then add a CNAME for it at Hostinger pointing
   to the hostname they provide, and put the engine URL in
   `js/booking-config.js` under the `deoghar` key.
5. Replace the brand-site teaser (`/deoghar/`) with a redirect stub to the new
   subdomain, and update links/sitemap here.
