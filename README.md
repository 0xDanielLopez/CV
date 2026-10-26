# CV

Source for https://cv.daniel.tools - my curriculum vitae.

It is a static single page with no build step: `index.html`, `assets/css/site.css`, `assets/js/site.js` and `images/`. GitHub Pages serves it from the `main` branch, root path; `.nojekyll` turns Jekyll off. The custom domain is set by `CNAME` and served through Cloudflare.

Local preview: open `index.html` through any static server, for example `python3 -m http.server`.

Preview deploys go to https://cv-test.daniel.tools (a Cloudflare Worker with static assets only, `wrangler.jsonc`). `npm run deploy:test` builds `dist-test/` with `scripts/build-test.mjs`, which adds `noindex` and the security headers, and then deploys it.

There are no analytics and no tracking scripts.
