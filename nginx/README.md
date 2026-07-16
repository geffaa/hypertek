# Nginx configs (mirror of the live server)

Source of truth is the EC2 server (`/etc/nginx/sites-available/hypertek` and
`/etc/nginx/conf.d/gzip-tuning.conf`); these files are synced copies kept for
reference. Last synced: after the compression + cache-header patch.

- `hypertek.conf` — all three server blocks (frontend, admin, api) with
  gzip_static for precompressed build assets, 1y immutable caching for
  `/assets/`, 7d for other static files, and no-cache for index.html.
- `gzip-tuning.conf` — widens dynamic gzip beyond text/html (JS/CSS/JSON/SVG).

A backup of the previous live config is kept on the server as
`/etc/nginx/sites-available/hypertek.bak-2026-07-16`.
