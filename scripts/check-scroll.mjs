import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const suppliedUrl = process.argv[2];
const base = process.env.VITE_BASE_PATH || '/';
const url = (suppliedUrl || `http://127.0.0.1:4175${base === './' ? '/' : base}`).replace(/\/+$/, '') + '/';
let server;
let browser;
const report = { url, scenarios: [], errors: [] };
const output = 'tmp/scroll-check';
const widths = process.env.SIBIRIUS_SCROLL_WIDTHS?.split(',').map(Number) || [320, 390, 768, 1440];
const modes = process.env.SIBIRIUS_SCROLL_MODES?.split(',') || ['mouse', 'touch', 'keyboard'];
mkdirSync(output, { recursive: true });
// A booking popup may hide the source tab and suspend its animation frames.
// Wait in the driver so that source-page measurements still complete.
const settle = page => page.waitForTimeout(50);
const sameY = (before, after, label) => assert.ok(Math.abs(after - before) <= 1, `${label}: scrollY ${before} → ${after}`);

try {
  if (!suppliedUrl) {
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--configLoader', 'native', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'pipe', windowsHide: true });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if ((await fetch(url)).ok) { ready = true; break; } } catch { /* Server is starting. */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, `Preview server: ${url}`);
  }
  const chrome = path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe');
  const executablePath = process.env.SIBIRIUS_BROWSER || (!existsSync(chromium.executablePath()) && existsSync(chrome) ? chrome : undefined);
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });

  for (const width of widths) for (const mode of modes) {
    const context = await browser.newContext({ viewport: { width, height: 640 }, hasTouch: mode === 'touch', isMobile: mode === 'touch', permissions: ['clipboard-read', 'clipboard-write'] });
    context.setDefaultTimeout(10000);
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({ width, mode, error: error.message }));
    const external = [];
    await context.route('**/*', async route => {
      if (route.request().isNavigationRequest() && new URL(route.request().url()).origin !== new URL(url).origin) {
        external.push(route.request().url());
        // Keep the source document alive; no real booking, ride or store is opened.
        await route.abort('aborted');
      } else await route.continue();
    });
    await context.addInitScript(() => {
      window.focusScrollCalls = [];
      const scrollBy = window.scrollBy.bind(window);
      window.scrollBy = (...args) => { window.focusScrollCalls.push(args); return scrollBy(...args); };
      Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition(_success, failure) { failure({ code: 1 }); } } });
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('.transport-apps').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth));
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });

    const record = data => { report.scenarios.push({ width, mode, ...data }); };
    const navigate = async hash => {
      await page.bringToFront();
      await page.evaluate(hash => { location.hash = hash; }, hash);
      await settle(page);
      await page.locator(['#home', '#venue', '#transport'].includes(hash) ? '#home-title' : hash === '#food' ? '#food-title' : hash === '#hotels' ? '#hotels-title' : '#souvenirs-title').waitFor();
    };
    const prepare = async locator => {
      await locator.evaluate(node => {
        document.activeElement?.blur();
        if (node.closest('dialog, .mobile-nav')) return;
        const panel = document.querySelector('.mobile-nav');
        const edge = getComputedStyle(panel).display === 'none' ? innerHeight - 8 : panel.getBoundingClientRect().top + 6;
        scrollTo({ top: scrollY + node.getBoundingClientRect().bottom - edge, behavior: 'instant' });
      });
      if (mode === 'keyboard') {
        // Position the preceding real tab stop without scrolling, then use an actual Tab.
        await locator.evaluate(node => {
          const scope = document.querySelector('dialog[open]') || document;
          const stops = [...scope.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(element => element.tabIndex >= 0 && !element.disabled && element.getClientRects().length && !element.closest('[inert]'));
          const previous = stops[stops.indexOf(node) - 1];
          if (previous) previous.focus({ preventScroll: true });
          else if (scope instanceof HTMLElement) scope.focus({ preventScroll: true });
          else document.activeElement?.blur();
        });
        await page.keyboard.press('Tab');
        assert.ok(await locator.evaluate(node => document.activeElement === node), `Tab reaches ${await locator.textContent()}`);
        await settle(page);
        const bounds = await locator.evaluate(node => {
          const panel = document.querySelector('.mobile-nav');
          return { top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, edge: getComputedStyle(panel).display === 'none' || node.closest('.mobile-nav, dialog') ? innerHeight : panel.getBoundingClientRect().top };
        });
        assert.ok(bounds.top >= -1 && bounds.bottom <= bounds.edge + 1, `Tab focus is visible: ${JSON.stringify(bounds)}`);
      }
      await settle(page);
    };
    const activate = async locator => {
      if (mode === 'keyboard') await page.keyboard.press('Enter');
      else {
        const rect = await locator.boundingBox();
        assert.ok(rect);
        assert.ok(await locator.evaluate((node, point) => node.contains(document.elementFromPoint(point.x, point.y)), { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }), `Pointer target is reachable: ${await locator.textContent()}`);
        if (mode === 'touch') await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
        else await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
      }
    };
    const stable = async (locator, label, action = () => activate(locator), destination) => {
      const before = await page.evaluate(() => ({ y: scrollY, url: location.href, calls: window.focusScrollCalls.length }));
      const count = external.length;
      await action();
      await settle(page);
      sameY(before.y, await page.evaluate(() => scrollY), `${label}: while external service is pending`);
      if (destination) {
        for (let i = 0; external.length === count && i < 40; i++) await page.waitForTimeout(25);
        const actual = new URL(external.at(-1));
        const expected = new URL(destination);
        assert.equal(actual.origin + actual.pathname + actual.hash, expected.origin + expected.pathname + expected.hash, `${label}: external destination`);
        assert.deepEqual([...actual.searchParams].sort(), [...expected.searchParams].sort(), `${label}: route parameters`);
        assert.ok(external.length > count, `${label}: link was activated`);
      }
      const after = await page.evaluate(() => ({ y: scrollY, url: location.href, calls: window.focusScrollCalls.length }));
      sameY(before.y, after.y, `${width}/${mode}/${label}`);
      assert.equal(after.url, before.url, `${label}: source URL`);
      assert.equal(after.calls, before.calls, `${label}: no app-driven scroll during activation`);
      record({ label, before: before.y, after: after.y, destination });
      for (const popup of context.pages()) if (popup !== page) await popup.close();
      await page.bringToFront();
    };

    for (const [hash, expectedLinks] of [['#home', 16], ['#food', 17], ['#hotels', 18], ['#souvenirs', 3]]) {
      await navigate(hash);
      const links = page.locator('main a[href^="https://"]');
      assert.equal(await links.count(), expectedLinks);
      for (let i = 0; i < expectedLinks; i++) {
        const link = links.nth(i);
        const destination = await link.getAttribute('href');
        await prepare(link);
        for (const attempt of [1, 2]) await stable(link, `${hash}/link-${i + 1}/attempt-${attempt}`, undefined, destination);
      }
      const selects = page.locator('main select');
      for (let i = 0; i < await selects.count(); i++) {
        const select = selects.nth(i);
        await prepare(select);
        const options = await select.locator('option').evaluateAll(nodes => nodes.map(node => node.value));
        for (const attempt of [1, 2]) {
          await stable(select, `${hash}/select-${i}/open-${attempt}`, async () => {
            await activate(select);
            await page.keyboard.press('Escape');
          });
          await stable(select, `${hash}/select-${i}/change-${attempt}`, async () => {
            if (mode === 'keyboard') { await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); }
            else await select.selectOption(options[attempt % options.length]);
          });
        }
      }
      if (hash === '#home') {
        for (let i = 0; i < 3; i++) {
          const copy = page.locator('.venue-copy').nth(i);
          await prepare(copy);
          for (const attempt of [1, 2]) {
            await stable(copy, `copy-${i}/attempt-${attempt}`);
            const address = await page.locator('.venue-card').nth(i).locator('.transport-address').textContent();
            assert.equal(await page.evaluate(() => navigator.clipboard.readText()), address);
          }
        }
        for (const success of [false, true]) {
          await page.evaluate(success => {
            Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
              getCurrentPosition(resolve, reject) { setTimeout(() => success ? resolve({ coords: { latitude: 61, longitude: 69 } }) : reject({ code: 1 }), 150); },
            } });
          }, success);
          for (let i = 0; i < 3; i++) {
            const bus = page.locator('.venue-card a[aria-busy]').nth(i);
            const destination = new URL(await bus.getAttribute('href'));
            if (success) destination.searchParams.set('rtext', `61,69~${await page.locator('.transport-address').nth(i).textContent()}`);
            await prepare(bus);
            for (const attempt of [1, 2]) await stable(bus, `bus/geolocation-${success}/${i}/${attempt}`, undefined, destination.href);
          }
        }
        await page.evaluate(() => {
          window.nativeClipboard = navigator.clipboard;
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
            writeText() { return Promise.reject(new Error('Clipboard API unavailable')); },
            readText: window.nativeClipboard.readText.bind(window.nativeClipboard),
          } });
        });
        for (let i = 0; i < 3; i++) {
          const copy = page.locator('.venue-copy').nth(i);
          await prepare(copy);
          for (const attempt of [1, 2]) {
            await stable(copy, `copy/fallback-${i}/${attempt}`);
            assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await page.locator('.transport-address').nth(i).textContent());
          }
        }
        await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: window.nativeClipboard }));
        if (mode !== 'keyboard') for (const selector of ['#home-title', '#technopark-title', '#lyceum-title', '#school-2-title', '.venue-image img', '#transport-apps-title']) {
          const text = page.locator(selector);
          await prepare(text);
          for (const attempt of [1, 2]) await stable(text, `plain-content/${selector}/${attempt}`);
        }
      }
      if (hash === '#food') {
        const search = page.locator('input[type="search"]');
        await prepare(search);
        for (const attempt of [1, 2]) {
          await stable(search, `search/focus-${attempt}`, async () => {
            if (mode !== 'keyboard') await activate(search);
          });
          await stable(search, `search/type-${attempt}`, () => page.keyboard.type('пицца'));
          assert.ok(await page.locator('.place-card').count() < 17);
          const clear = page.getByRole('button', { name: 'Очистить поиск' });
          await prepare(clear);
          await stable(clear, `search/clear-${attempt}`);
          assert.equal(await page.locator('.place-card').count(), 17);
          await prepare(search);
        }
      }
      console.log(`Checked ${width}px / ${mode} / ${hash}`);
      writeFileSync(`${output}/regression.json`, JSON.stringify(report, null, 2));
    }

    // Explicit navigation is allowed to scroll; verify its intended destination twice.
    const assertDestination = async hash => {
      await page.waitForFunction(hash => location.hash === hash, hash);
      await settle(page);
      assert.equal(new URL(page.url()).hash, hash);
      if (hash === '#venue') {
        const top = await page.locator('#venue').evaluate(node => node.getBoundingClientRect().top);
        assert.ok(top >= 0 && top < 90, `venue anchor: ${top}`);
      } else assert.equal(await page.evaluate(() => scrollY), 0, `navigation to ${hash}`);
    };
    const useLink = async locator => { await prepare(locator); await activate(locator); await settle(page); };
    for (const hash of ['#venue', '#food', '#hotels', '#souvenirs']) for (const attempt of [1, 2]) {
      await navigate('#home');
      await useLink(page.locator(`.category-card[href="${hash}"]`));
      await assertDestination(hash);
      record({ label: `category/${hash}/${attempt}` });
    }
    const nav = width <= 1020 ? '.mobile-nav' : '.desktop-nav';
    for (const hash of ['#home', '#food', '#hotels', '#venue']) for (const attempt of [1, 2]) {
      await page.evaluate(() => scrollBy({ top: 120, behavior: 'instant' }));
      await useLink(page.locator(`${nav} a[href="${hash}"]`));
      await assertDestination(hash);
      record({ label: `navigation/${hash}/${attempt}` });
    }
    for (const hash of ['#home', '#food', '#hotels', '#venue', '#souvenirs']) for (const attempt of [1, 2]) {
      const trigger = page.locator(width <= 1020 ? '.mobile-nav button' : '.header-menu');
      await useLink(trigger);
      assert.equal(await page.locator('dialog[open]').count(), 1);
      await useLink(page.locator(`.menu-links a[href="${hash}"]`));
      await assertDestination(hash);
      assert.equal(await page.locator('dialog').count(), 0);
      record({ label: `menu/${hash}/${attempt}` });
    }
    for (const hash of ['#food', '#hotels', '#souvenirs']) for (const attempt of [1, 2]) {
      await navigate(hash);
      await useLink(page.locator('.back-link'));
      await assertDestination('#home');
      record({ label: `back-link/${hash}/${attempt}` });
    }
    for (const selector of ['.logo-link', '.footer-top a']) for (const attempt of [1, 2]) {
      await navigate('#food');
      await useLink(page.locator(selector));
      await assertDestination('#home');
      record({ label: `${selector}/${attempt}` });
    }
    if (mode === 'keyboard') for (const attempt of [1, 2]) {
      await navigate('#home');
      await page.locator('#home-title').focus();
      for (let step = 0; step < 12 && !await page.locator('.skip-link').evaluate(node => document.activeElement === node); step++) await page.keyboard.press('Shift+Tab');
      assert.ok(await page.locator('.skip-link').evaluate(node => document.activeElement === node));
      await page.keyboard.press('Enter');
      await settle(page);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
      const top = await page.locator('main').evaluate(node => node.getBoundingClientRect().top);
      assert.ok(top >= 0 && top <= 40, `Skip link scrolls to the beginning of main: ${top}`);
      record({ label: `skip-link/shift-tab/${attempt}` });
    }
    // Closing the dialog returns focus without moving the source page.
    for (const attempt of [1, 2]) {
      const trigger = page.locator(width <= 1020 ? '.mobile-nav button' : '.header-menu');
      await useLink(trigger);
      const close = page.getByRole('button', { name: 'Закрыть', exact: true });
      await prepare(close);
      await stable(close, `menu/close-${attempt}`);
    }
    await navigate('#transport');
    await assertDestination('#venue');
    await navigate('#food');
    await page.evaluate(() => scrollTo({ top: 200, behavior: 'instant' }));
    const beforeWheel = await page.evaluate(() => scrollY);
    await page.mouse.move(width / 2, 200);
    await page.mouse.wheel(0, 220);
    await page.waitForFunction(y => scrollY > y, beforeWheel, { timeout: 3000 });
    record({ label: 'ordinary-wheel-scroll', before: beforeWheel, after: await page.evaluate(() => scrollY) });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    console.log(`OK scroll ${width}px / ${mode}: all links, first/repeat activation, controls, anchors and menus.`);
    writeFileSync(`${output}/regression.json`, JSON.stringify(report, null, 2));
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  console.log(`OK: ${report.scenarios.length} browser scroll scenarios; no JavaScript errors.`);
} catch (error) {
  report.failure = String(error.stack || error);
  throw error;
} finally {
  writeFileSync(`${output}/regression.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  server?.kill();
}
