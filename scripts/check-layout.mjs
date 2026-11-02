import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] || 'http://127.0.0.1:4173/sibirius-guide/').replace(/\/+$/, '') + '/';
const output = `tmp/layout-check/${new URL(base).hostname === '127.0.0.1' ? 'local' : 'live'}`;
mkdirSync(output, { recursive: true });
const chrome = path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe');
const executablePath = process.env.SIBIRIUS_BROWSER || (!existsSync(chromium.executablePath()) && existsSync(chrome) ? chrome : undefined);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const report = { base, catalogues: [], categories: [], errors: [] };
const close = (a, b, label) => assert.ok(Math.abs(a - b) <= 1.1, `${label}: ${a} vs ${b}`);

async function checkGrid(page, count) {
  await page.locator('.places-grid').waitFor();
  // Allow ResizeObserver to run after viewport, text, filtering or sorting changes.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const state = await page.locator('.places-grid').evaluate(grid => {
    const style = getComputedStyle(grid);
    const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
    return { food: grid.classList.contains('food-cards'), masonry: grid.hasAttribute('data-masonry'),
      box: rect(grid), gap: parseFloat(style.getPropertyValue('--catalog-gap')),
      columns: style.gridTemplateColumns.split(' ').length,
      cards: [...grid.children].map(card => {
        const content = card.querySelector('.place-content');
        const actions = card.querySelector('.place-actions');
        const previous = actions.previousElementSibling;
        const photo = card.querySelector('.place-photo');
        return { id: card.getAttribute('aria-labelledby'), ...rect(card), content: rect(content), actions: rect(actions),
          previous: rect(previous), previousMargin: parseFloat(getComputedStyle(previous).marginBottom),
          padding: parseFloat(getComputedStyle(content).paddingBottom),
          photo: photo ? rect(photo) : null, margin: getComputedStyle(actions).marginTop };
      }) };
  });
  assert.equal(state.cards.length, count);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), true);
  const next = Array(state.columns).fill(state.box.y);
  const columnWidth = (state.box.width - state.gap * (state.columns - 1)) / state.columns;
  if (state.food) {
    assert.equal(state.masonry, false, 'Food uses ordinary row grid');
    let top = state.box.y;
    for (let start = 0; start < count; start += state.columns) {
      const row = state.cards.slice(start, start + state.columns);
      for (const [column, card] of row.entries()) {
        close(card.x, state.box.x + column * (columnWidth + state.gap), `${card.id}: ordered column`);
        close(card.y, top, `${card.id}: aligned row top`);
        close(card.height, row[0].height, `${card.id}: equal row height`);
        close(card.actions.bottom, row[0].actions.bottom, `${card.id}: aligned route button`);
      }
      top += row[0].height + state.gap;
    }
    assert.equal(await page.locator('.food-cards .place-photo').count(), count, 'Every card has photo or placeholder');
  }
  for (const [i, card] of state.cards.entries()) {
    const column = next.indexOf(Math.min(...next));
    if (!state.food) {
      close(card.x, state.box.x + column * (columnWidth + state.gap), `${card.id}: column`);
      close(card.y, next[column], `${card.id}: no masonry gap`);
    }
    if (i) assert.ok(card.y >= state.cards[i - 1].y - 1, `${card.id}: visual order`);
    close(card.height, card.content.height + (card.photo?.height || 0) + 2, `${card.id}: natural card height`);
    if (!card.photo) close(card.content.y, card.y + 1, `${card.id}: no empty image space`);
    else assert.ok(Math.abs(card.photo.width / card.photo.height - 16 / 9) < .01, `${card.id}: photo ratio`);
    if (!state.food) {
      assert.equal(card.margin, '0px');
      close(card.actions.y - card.previous.bottom, card.previousMargin, `${card.id}: actions follow content`);
    } else assert.ok(card.actions.y - card.previous.bottom >= card.previousMargin - 1, `${card.id}: space before route`);
    close(card.content.bottom - card.actions.bottom, card.padding, `${card.id}: no empty card bottom`);
    next[column] += Math.ceil(card.height) + state.gap;
  }
  return state;
}

async function checkTabOrder(page) {
  const controls = page.locator('.places-grid').locator('a[href], button, select');
  const count = await controls.count();
  await controls.first().focus();
  for (let i = 0; i < count; i++) {
    assert.ok(await controls.nth(i).evaluate(node => node === document.activeElement), `Tab order: ${i}`);
    assert.equal(await controls.nth(i).getAttribute('tabindex'), null);
    if (i + 1 < count) await page.keyboard.press('Tab');
  }
}

const decoration = card => card.evaluate(node => {
  const s = getComputedStyle(node);
  return { border: s.borderColor, outline: s.outlineStyle, outlineWidth: s.outlineWidth,
    outlineColor: s.outlineColor, transform: s.transform, background: s.backgroundColor };
});

try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, hasTouch: width < 760, isMobile: width < 760 });
    let page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    for (const [section, count] of [['food', 17], ['hotels', 9], ['souvenirs', 3]]) {
      await page.goto(`${base}#${section}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
      const state = await checkGrid(page, count);
      await checkTabOrder(page);
      await page.setViewportSize({ width: width + 36, height: 960 });
      await checkGrid(page, count);
      await page.setViewportSize({ width, height: 960 });
      await checkGrid(page, count);
      await page.setViewportSize({ width: width < 760 ? 1440 : 320, height: 960 });
      await checkGrid(page, count);
      await page.setViewportSize({ width, height: 960 });
      await checkGrid(page, count);
      const title = page.locator('.place-card h2').first();
      await title.evaluate(node => { node.style.fontSize = '42px'; });
      await checkGrid(page, count);
      await title.evaluate(node => { node.style.removeProperty('font-size'); });
      await checkGrid(page, count);
      if (section === 'food') {
        const search = page.getByRole('searchbox');
        await search.fill('Бургер Кинг');
        await checkGrid(page, 1);
        await search.fill('кофе');
        await checkGrid(page, await page.locator('.place-card').count());
        await search.fill('');
        await checkGrid(page, 17);
      } else if (section === 'hotels') {
        await page.locator('#hotel-sort').selectOption('price');
        const sorted = await checkGrid(page, count);
        assert.equal(sorted.cards[0].id, 'hotel-6-title');
        await page.locator('#hotel-sort').selectOption('distance');
        await checkGrid(page, count);
      }
      await page.screenshot({ path: `${output}/${section}-${width}.png`, fullPage: true });
      report.catalogues.push({ width, section, count, columns: state.columns, ids: state.cards.map(card => card.id) });
    }

    await page.close();
    page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(`${base}#home`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.hero-kicker').textContent(), 'III Межрегиональный форум «ПРОразвитие»');
    assert.equal((await page.locator('.hero h1').innerText()).replace(/\s+/g, ' ').replace(/\.$/, ''), 'Путеводитель участника');
    assert.equal(await page.locator('.hero-description').textContent(), 'Всё необходимое для участия в мероприятии — в одном месте');
    assert.equal(await page.locator('.hero-content > p').count(), 2);
    assert.ok(await page.locator('.hero').evaluate(node => parseFloat(getComputedStyle(node.querySelector('h1')).fontSize) > 2.5 * parseFloat(getComputedStyle(node.querySelector('.hero-kicker')).fontSize)));
    const cards = page.locator('.category-card');
    assert.deepEqual(await cards.locator('.category-title').allTextContents(), ['Места проведения', 'Где поесть', 'Проживание', 'Сувениры']);
    assert.deepEqual(await cards.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), ['#venue', '#food', '#hotels', '#souvenirs']);
    await cards.first().scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const normal = await decoration(cards.first());
    assert.equal(normal.border, 'rgb(255, 255, 255)');
    for (const card of await cards.all()) assert.deepEqual(await decoration(card), normal);
    // Prevent navigation only while inspecting pressed/focus styles.
    await cards.evaluateAll(nodes => nodes.forEach(node => { node.onclick = event => event.preventDefault(); }));
    const hover = [];
    const active = [];
    for (const card of await cards.all()) {
      if (width === 1440) {
        await card.hover();
        await page.waitForTimeout(220);
        hover.push(await decoration(card));
        await page.mouse.down();
        await page.waitForTimeout(220);
        active.push(await decoration(card));
        await page.mouse.up();
        await page.mouse.move(0, 0);
      } else await card.tap();
      await page.waitForTimeout(220);
      await page.waitForFunction(node => node.getAnimations().every(animation => animation.playState !== 'running'), await card.elementHandle());
      assert.deepEqual(await decoration(card), normal, `${width}px: no persistent pointer/touch highlight`);
    }
    for (const style of hover) assert.deepEqual(style, hover[0]);
    for (const style of active) assert.deepEqual(style, active[0]);
    await cards.first().focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i);
      assert.ok(await card.evaluate(node => node === document.activeElement && node.matches(':focus-visible')));
      const focused = await decoration(card);
      assert.equal(focused.outline, 'solid');
      assert.equal(focused.outlineWidth, '3px');
      assert.equal(focused.outlineColor, 'rgb(84, 46, 255)');
      if (i < 3) await page.keyboard.press('Tab');
    }
    await page.locator('.header-menu').focus();
    await page.mouse.click(0, 0);
    await page.locator('.category-grid').screenshot({ path: `${output}/categories-${width}.png` });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    report.categories.push({ width, hover: hover.length, active: active.length, keyboardFocus: 4, uniform: true });
    await context.close();
    console.log(`OK layout ${width}px: equal food rows with 16:9 media; preserved hotel/souvenir layout; DOM/Tab order, resizing, filtering/sorting; hero hierarchy and category states.`);
  }
  assert.deepEqual(report.errors, []);
} finally {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
