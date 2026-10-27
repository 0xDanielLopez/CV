// Prints the CV to daniel-lopez-cv.pdf with the page's own print styles (A4).
// Usage: node scripts/build-pdf.mjs [url]   (default: the cv-test preview, so deploy:test first)
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'https://cv-test.daniel.tools/';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new' });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
await page.goto(`${url}?pdf=${Date.now()}`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: 'daniel-lopez-cv.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('wrote daniel-lopez-cv.pdf');
