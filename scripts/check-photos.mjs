import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] || 'http://127.0.0.1:4173/sibirius-guide/').replace(/\/+$/, '') + '/';
const output = 'tmp/photo-check/' + (new URL(base).hostname === '127.0.0.1' ? 'local' : 'live');
mkdirSync(output, { recursive: true });
const chrome = path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe');
const executablePath = process.env.SIBIRIUS_BROWSER || (!existsSync(chromium.executablePath()) && existsSync(chrome) ? chrome : undefined);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const report = { base, scenarios: [], images: [], errors: [] };
const assets = new Set();
try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, hasTouch: width < 760 });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('requestfailed', r => report.errors.push(`${r.url()}: ${r.failure()?.errorText}`));
    page.on('response', r => { if (r.status() >= 400) report.errors.push(`${r.status()}: ${r.url()}`); });
    for (const [section, count, photos] of [['food', 17, 8], ['hotels', 9, 9], ['souvenirs', 3, 0], ['venue', 3, 3]]) {
      await page.goto(`${base}#${section}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
      const cards = page.locator(section === 'venue' ? '.venue-card' : '.place-card');
      await cards.first().waitFor();
      assert.equal(await cards.count(), count);
      assert.equal(await cards.locator('img').count(), photos);
      if (section === 'food') {
        const schedules = await cards.locator('.hours').allTextContents();
        assert.equal(schedules.length, 17);
        for (const hours of schedules) assert.match(hours, /^Ежедневно [\d:– ,;птсб]+$/);
        assert.equal(await page.locator('[aria-labelledby="food-14-title"] .hours').textContent(), 'Ежедневно 08:00–23:00');
        const search = page.getByRole('searchbox');
        await search.fill('Бургер Кинг');
        assert.equal(await cards.count(), 1);
        assert.equal(await cards.locator('.hours').textContent(), 'Ежедневно 09:00–01:00');
        await search.fill('');
        assert.equal(await cards.count(), 17);
      }
      // Explicitly bring lazy images into view and decode every selected asset.
      for (const img of await page.locator('img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(node => node.decode());
        assert.ok(await img.evaluate(node => node.naturalWidth > 0));
        const src = await img.evaluate(node => node.currentSrc);
        if (src.startsWith('http')) assets.add(src);
      }
      for (const gallery of await cards.locator('.card-photos').all()) {
        const controls = gallery.getByRole('button');
        const n = await controls.count();
        const img = gallery.locator('img');
        const dimensions = await img.evaluate(node => {
          const box = node.getBoundingClientRect();
          return { ratio: box.width / box.height, fit: getComputedStyle(node).objectFit,
            position: getComputedStyle(node).objectPosition, loading: node.loading };
        });
        assert.ok(Math.abs(dimensions.ratio - 16 / 9) < .01);
        assert.equal(dimensions.fit, 'cover');
        assert.equal(dimensions.position, section === 'hotels' ? '50% 0%' : '50% 50%');
        assert.equal(dimensions.loading, 'lazy');
        if (!n) continue;
        assert.ok(n >= 2 && n <= 3);
        await gallery.scrollIntoViewIfNeeded();
        const initial = await img.getAttribute('src');
        for (const mode of [width < 760 ? 'touch' : 'mouse', 'keyboard']) {
          for (const i of [...Array(n).keys()].slice(1).concat(0)) {
            const button = controls.nth(i);
            await button.scrollIntoViewIfNeeded();
            if (mode === 'keyboard') await button.focus();
            const before = await page.evaluate(() => scrollY);
            if (mode === 'touch') await button.tap();
            else if (mode === 'keyboard') await page.keyboard.press('Enter');
            else await button.click();
            await img.evaluate(node => node.decode());
            assert.equal(await button.getAttribute('aria-pressed'), 'true');
            assert.equal(await gallery.locator('button[aria-pressed="true"]').count(), 1);
            const current = await img.getAttribute('src');
            assert.ok(i === 0 ? current === initial : current !== initial);
            assert.ok(Math.abs(await page.evaluate(() => scrollY) - before) <= 1, `${width}: photo switch scrolled page`);
            assets.add(await img.evaluate(node => node.currentSrc));
          }
          report.scenarios.push({ width, section, mode, gallery: await gallery.getAttribute('aria-label'), photos: n });
        }
        await gallery.screenshot({ path: `${output}/gallery-${section}-${width}-${report.scenarios.length}.png` });
      }
      assert.equal(await page.locator('dialog[open]').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${section}: overflow at ${width}`);
      await page.screenshot({ path: `${output}/${section}-${width}.png`, fullPage: true });
    }
    await context.close();
    console.log(`OK photos ${width}px: all images, gallery ${width < 760 ? 'touch' : 'mouse'} + keyboard, 17 places, Burger King, hours, no overflow.`);
  }
  const request = await browser.newContext();
  for (const url of assets) {
    assert.ok(new URL(url).pathname.startsWith('/sibirius-guide/'), url);
    const response = await request.request.get(url);
    assert.equal(response.status(), 200, url);
    assert.match(response.headers()['content-type'], /^image\//);
    report.images.push({ url, status: response.status(), bytes: (await response.body()).length });
  }
  await request.close();
  assert.deepEqual(report.errors, []);
  console.log(`OK: ${assets.size} distinct image URLs, ${report.scenarios.length} gallery scenarios, no image or JavaScript errors.`);
} finally {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
