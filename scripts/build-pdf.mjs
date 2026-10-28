// Prints the CV to daniel-lopez-cv.pdf with the page's own print styles (A4).
// Usage: node scripts/build-pdf.mjs [url]   (default: the cv-test preview, so deploy:test first)
// Rebuild it on every content deploy: the footer carries the build month and the Okta duration is computed.
import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

// Appends an incremental update that redefines the Info dictionary. Chrome writes a classic
// xref table, so every other object (fonts, images, tag tree, named destinations) stays byte-identical.
function setInfo(buf, fields) {
  const text = buf.toString('latin1');
  const trailer = text.slice(text.lastIndexOf('trailer'));
  const prev = Number(/startxref\s+(\d+)/.exec(trailer)[1]);
  const size = Number(/\/Size (\d+)/.exec(trailer)[1]);
  const root = /\/Root (\d+) 0 R/.exec(trailer)[1];
  const infoNum = Number(/\/Info (\d+) 0 R/.exec(trailer)[1]);
  const old = text.slice(text.lastIndexOf(`\n${infoNum} 0 obj`));
  const keep = (key) => { const m = new RegExp(`/${key} (\\([^)]*\\))`).exec(old); return m ? `/${key} ${m[1]}` : ''; };
  const str = (s) => '<FEFF' + Buffer.from(s, 'utf16le').swap16().toString('hex').toUpperCase() + '>';
  const info = `${infoNum} 0 obj\n<< /Title ${str(fields.title)} /Author ${str(fields.author)} /Subject ${str(fields.subject)} /Keywords ${str(fields.keywords)} /Creator ${str(fields.creator)} ${keep('Producer')} ${keep('CreationDate')} ${keep('ModDate')} >>\nendobj\n`;
  const infoAt = buf.length + 1;
  const xrefAt = infoAt + Buffer.byteLength(info, 'latin1');
  const xref = `xref\n${infoNum} 1\n${String(infoAt).padStart(10, '0')} 00000 n \ntrailer\n<< /Size ${size} /Root ${root} 0 R /Info ${infoNum} 0 R /Prev ${prev} >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  return Buffer.concat([buf, Buffer.from('\n' + info + xref, 'latin1')]);
}

const url = process.argv[2] || 'https://cv-test.daniel.tools/';
const updated = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new' });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
// Print media first, so the print-only static fonts are loaded before page.pdf().
await page.emulateMediaType('print');
await page.goto(`${url}?pdf=${Date.now()}`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
const meta = await page.evaluate(() => ({
  title: document.title,
  author: document.querySelector('meta[name="author"]').content,
  subject: document.querySelector('meta[name="description"]').content,
}));
const pdf = Buffer.from(await page.pdf({
  format: 'A4', printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: `<div style="width:100%;padding:0 14mm;font:8px Helvetica,Arial,sans-serif;color:#646b7a;display:flex;justify-content:space-between"><span>Daniel L&oacute;pez - CV - cv.daniel.tools - Updated ${updated}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
}));
await browser.close();
writeFileSync('daniel-lopez-cv.pdf', setInfo(pdf, {
  ...meta,
  keywords: 'Daniel López, CV, cyber threat intelligence, identity threat research, phishing, Okta, TweetFeed, phishunt',
  creator: 'cv.daniel.tools',
}));
console.log('wrote daniel-lopez-cv.pdf');
