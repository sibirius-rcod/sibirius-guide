import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Можно передать путь к уже установленному Playwright без добавления зависимости.
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require(process.env.SIBIRIUS_PLAYWRIGHT || 'playwright'); }
catch (error) {
  const bundled = path.resolve(path.dirname(process.execPath), '../node_modules/playwright');
  if (!existsSync(bundled) || process.env.SIBIRIUS_PLAYWRIGHT) throw error;
  playwright = require(bundled);
}
const { chromium } = playwright;
const installedChrome = path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe');
const executablePath = process.env.SIBIRIUS_BROWSER || (!existsSync(chromium.executablePath()) && existsSync(installedChrome) ? installedChrome : undefined);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const origin = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const output = path.resolve('tmp/visual-check');
mkdirSync(output, { recursive: true });
const report = [];
const destinations = [
  ['Ханты-Мансийск, ул. Промышленная, 19', '61.001422', '68.994009'],
  ['Ханты-Мансийск, ул. Мира, 124', '61.019178', '69.08623'],
  ['Ханты-Мансийск, ул. Анны Коньковой, 5', '60.968844', '69.015749'],
];

try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.transport-apps').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('img')].every(img => img.complete && img.naturalWidth > 0));
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
    await page.waitForFunction(() => window.scrollY === 0);
    await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
    await page.locator('.hero').screenshot({ path: path.join(output, `hero-${width}.png`) });
    const layout = await page.evaluate(() => {
      const rect = selector => {
        const { x, y, width, height, right, bottom } = document.querySelector(selector).getBoundingClientRect();
        return { x, y, width, height, right, bottom };
      };
      const text = rect('.hero-content');
      const art = rect('.brand-pattern');
      const cards = [...document.querySelectorAll('.venue-grid .venue-card')].map(node => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return { x, y, width, height };
      });
      return {
        viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        heroOverlap: text.x < art.right && text.right > art.x && text.y < art.bottom && text.bottom > art.y,
        cards,
      };
    });
    assert.equal(layout.scrollWidth, width, `${width}: горизонтальная прокрутка`);
    assert.equal(layout.heroOverlap, false, `${width}: графика пересекается с текстом`);
    if (width < 760) assert.ok(layout.cards[1].y > layout.cards[0].y);
    else assert.equal(layout.cards[0].y, layout.cards[1].y);
    assert.equal(await page.locator('.venue-card').count(), 3);
    assert.equal(await page.locator('.transport-apps').count(), 1);
    assert.equal(await page.locator('.transport-app a').count(), 10);
    for (const [i, [address, lat, lon]] of destinations.entries()) {
      const card = page.locator('.venue-card').nth(i);
      await card.getByRole('button', { name: 'Скопировать адрес' }).click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), address);
      const bus = new URL(await card.getByRole('link', { name: 'На автобусе' }).getAttribute('href'));
      assert.equal(bus.searchParams.get('rtext'), `~${address}`);
      assert.equal(bus.searchParams.get('rtt'), 'mt');
      const taxi = new URL(await card.getByRole('link', { name: 'На такси' }).getAttribute('href'));
      assert.equal(taxi.searchParams.get('end-lat'), lat);
      assert.equal(taxi.searchParams.get('end-lon'), lon);
    }
    // Перехватываем выход в Карты, чтобы проверить клики и геолокацию без внешней сети.
    const navigations = [];
    await page.route('https://yandex.ru/maps/**', async route => {
      navigations.push(route.request().url());
      await route.abort('aborted');
    });
    await page.route('https://3.redirect.appmetrica.yandex.com/route**', async route => {
      navigations.push(route.request().url());
      await route.abort('aborted');
    });
    for (const [i, [address]] of destinations.entries()) {
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
          getCurrentPosition(success) { success({ coords: { latitude: 61, longitude: 69 } }); },
        } });
      });
      await page.locator('.venue-card').nth(i).getByRole('link', { name: 'На автобусе' }).click();
      await page.waitForTimeout(100);
      assert.equal(new URL(navigations.at(-1)).searchParams.get('rtext'), `61,69~${address}`);
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
          getCurrentPosition(_success, failure) { failure({ code: 1 }); },
        } });
      });
      await page.locator('.venue-card').nth(i).getByRole('link', { name: 'На автобусе' }).click();
      await page.waitForTimeout(100);
      assert.equal(new URL(navigations.at(-1)).searchParams.get('rtext'), `~${address}`);
      await page.locator('.venue-card').nth(i).getByRole('link', { name: 'На такси' }).click();
      await page.waitForTimeout(100);
      const taxi = new URL(navigations.at(-1));
      assert.equal(taxi.searchParams.get('end-lat'), destinations[i][1]);
      assert.equal(taxi.searchParams.get('end-lon'), destinations[i][2]);
    }
    for (const hash of ['#transport', '#venue']) {
      await page.goto(`${origin}/${hash}`);
      await page.waitForTimeout(150);
      assert.equal(new URL(page.url()).hash, '#venue');
      const top = await page.locator('#venue').evaluate(node => node.getBoundingClientRect().top);
      assert.ok(top >= 0 && top < 80, `Якорь ${hash}: ${top}`);
    }
    await page.goto(`${origin}/#hotels`);
    const sort = page.locator('#hotel-sort');
    await sort.waitFor();
    assert.equal(await sort.inputValue(), 'distance');
    assert.deepEqual(await sort.locator('option').allTextContents(), ['По расстоянию', 'По стоимости']);
    assert.match(await page.locator('.place-card h2').first().textContent(), /Олимпийская/);
    await sort.selectOption('price');
    assert.match(await page.locator('.place-card h2').first().textContent(), /На семи холмах/);
    await sort.selectOption('distance');
    assert.match(await page.locator('.place-card h2').first().textContent(), /Олимпийская/);
    await page.screenshot({ path: path.join(output, `hotels-${width}.png`), fullPage: true });
    const overflow = await page.evaluate(() => [...document.querySelectorAll('main *, header *, footer *, .mobile-nav *')]
      .filter(node => node.getBoundingClientRect().right > innerWidth + 1)
      .map(node => ({ tag: node.tagName, class: node.className, text: node.textContent.slice(0, 50), right: node.getBoundingClientRect().right })));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, JSON.stringify(overflow));
    for (const hash of ['#food', '#souvenirs']) {
      await page.goto(`${origin}/${hash}`);
      await page.locator('.place-card').first().waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${hash}: горизонтальная прокрутка`);
    }
    assert.deepEqual(errors, []);
    report.push({ width, ...layout, errors, copiedAddresses: 3, busClicks: 6, taxiClicks: 3, routeLinks: 6, storeLinks: 10, anchors: ['#transport', '#venue'], sorting: 'passed', overflowChecked: ['home', 'hotels', 'food', 'souvenirs'] });
    console.log(`OK ${width}px: вёрстка, изображения, копирование, маршруты с геолокацией и без, якоря, сортировка; ошибок браузера нет.`);
    await context.close();
  }
  writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
} finally { await browser.close(); }
