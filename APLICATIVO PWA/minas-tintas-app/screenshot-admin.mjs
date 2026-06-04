import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, 'screenshots');

const screens = [
  { name: '01-login',           url: '/login' },
  { name: '02-dashboard',       url: '/dashboard' },
  { name: '03-pedidos',         url: '/pedidos' },
  { name: '04-pedido-detalhe',  url: '/pedidos/1' },
  { name: '05-pintores',        url: '/pintores' },
  { name: '06-pintor-detalhe',  url: '/pintores/joao-pereira' },
  { name: '07-lojinha',         url: '/lojinha' },
];

import fs from 'fs';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Set a fake auth cookie so admin layout renders
await page.goto(BASE + '/login');
await page.waitForLoadState('networkidle');

for (const s of screens) {
  console.log(`Capturing ${s.name}...`);
  await page.goto(BASE + s.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, `${s.name}.png`), fullPage: false });
  console.log(`  ✓ ${s.name}.png`);
}

await browser.close();
console.log('\nDone. Screenshots saved to:', OUT);
