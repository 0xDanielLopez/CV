// Builds dist-test/ for the cv-test.daniel.tools preview.
// Same files as production, plus: noindex (meta + header + robots.txt) and the security
// headers that the Cloudflare Transform Rule only adds on the production host.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const out = 'dist-test';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const p of ['index.html', '404.html', 'assets', 'images']) cpSync(p, `${out}/${p}`, { recursive: true });

const html = readFileSync('index.html', 'utf8');
const marker = '<meta name="viewport" content="width=device-width, initial-scale=1">';
if (!html.includes(marker)) throw new Error('viewport meta not found: cannot inject noindex');
writeFileSync(`${out}/index.html`, html.replace(marker, `${marker}\n  <meta name="robots" content="noindex, nofollow">`));

writeFileSync(`${out}/robots.txt`, 'User-agent: *\nDisallow: /\n');

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');
writeFileSync(`${out}/_headers`, `/*
  X-Robots-Tag: noindex, nofollow
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: interest-cohort=(), geolocation=(), camera=(), microphone=()
  X-Frame-Options: SAMEORIGIN
`);
console.log(`built ${out}/`);
