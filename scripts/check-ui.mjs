import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import { load } from './check.mjs';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/#transport', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: typeof dom.window[key] === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom.window[key].bind(dom.window) : dom.window[key] });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const scrolls = [];
window.scrollTo = (...args) => scrolls.push(args);
window.scrollBy = () => {};
HTMLElement.prototype.scrollIntoView = function () { scrolls.push(this.id); };
dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
let copied;
const destinations = ['Ханты-Мансийск, ул. Промышленная, 19', 'Ханты-Мансийск, ул. Мира, 124', 'Ханты-Мансийск, ул. Анны Коньковой, 5'];
Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { copied = text; } } });
const App = load('src/App.tsx').default;
const root = createRoot(document.getElementById('root'));
const tick = async fn => { await act(async () => { fn?.(); await new Promise(resolve => setTimeout(resolve, 35)); }); await act(async () => { await new Promise(resolve => setTimeout(resolve, 35)); }); };
const click = selector => { const node = document.querySelector(selector); assert.ok(node, selector); node.click(); };
await tick(() => root.render(createElement(App)));
assert.equal(window.location.hash, '#venue');
assert.ok(document.getElementById('venue') && scrolls.includes('venue'));
assert.equal(document.querySelectorAll('.transport-app a').length, 10);
for (const [i, card] of [...document.querySelectorAll('.venue-card')].entries()) {
  await tick(() => card.querySelector('button').click());
  assert.equal(copied, destinations[i]);
  assert.ok(card.querySelector('[role="status"]').textContent.includes('скопирован'));
  assert.equal(new URL(card.querySelector('a[aria-busy]').href).searchParams.get('rtext'), `~${destinations[i]}`);
}
Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw Error('denied'); } } });
const fallbackCopies = [];
document.execCommand = command => { fallbackCopies.push(document.querySelector('textarea').value); return command === 'copy'; };
for (const card of document.querySelectorAll('.venue-card')) {
  const button = card.querySelector('button');
  button.focus();
  await tick(() => button.click());
  assert.ok(card.querySelector('[role="status"]').textContent.includes('скопирован'));
  assert.equal(document.activeElement, button);
}
assert.deepEqual(fallbackCopies, destinations);
assert.equal(document.querySelector('textarea'), null);
document.execCommand = () => false;
await tick(() => click('.venue-content button'));
assert.ok(document.querySelector('.venue-content [role="status"]').textContent.includes('Не удалось скопировать'));
for (const [hash, count] of [['#food', 17], ['#hotels', 9]]) {
  await tick(() => click(`.mobile-nav a[href="${hash}"]`));
  assert.equal(document.querySelectorAll('.place-card').length, count);
}
await tick(() => click('.mobile-nav a[href="#venue"]'));
assert.ok(document.getElementById('venue'));
const before = scrolls.length;
await tick(() => click('.mobile-nav a[href="#venue"]'));
assert.ok(scrolls.length > before);
await tick(() => click('.mobile-nav a[href="#home"]'));
assert.equal(document.activeElement.tagName, 'H1');
await tick(() => click('.header-menu'));
await tick(() => click('.menu-links a[href="#hotels"]'));
assert.equal(document.querySelectorAll('.place-card').length, 9);
assert.equal(document.querySelector('dialog'), null);
await tick(() => { window.location.hash = '#transport'; });
assert.equal(window.location.hash, '#venue');
assert.ok(document.getElementById('venue'));
// Запрос геолокации не должен увести пользователя после ухода из блока.
let resolveLocation;
Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition(success) { resolveLocation = success; } } });
await tick(() => click('.venue-section a[aria-busy]'));
assert.ok(resolveLocation);
await tick(() => click('.mobile-nav a[href="#food"]'));
await tick(() => resolveLocation({ coords: { latitude: 61, longitude: 69 } }));
assert.equal(window.location.hash, '#food');
await tick(() => click('.mobile-nav a[href="#hotels"]'));
assert.ok(document.querySelector('.place-card h2').textContent.includes('Олимпийская'));
assert.equal(document.getElementById('hotel-sort').value, 'distance');
assert.deepEqual([...document.querySelectorAll('#hotel-sort option')].map(option => option.textContent), ['По расстоянию', 'По стоимости']);
await tick(() => {
  const select = document.getElementById('hotel-sort');
  select.value = 'price';
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
});
assert.ok(document.querySelector('.place-card h2').textContent.includes('На семи холмах'));
assert.equal(document.querySelectorAll('.place-card').length, 9);
await tick(() => {
  const select = document.getElementById('hotel-sort');
  select.value = 'distance';
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
});
assert.ok(document.querySelector('.place-card h2').textContent.includes('Олимпийская'));
await tick(() => click('.mobile-nav a[href="#home"]'));
await tick(() => click('.category-card[href="#souvenirs"]'));
assert.equal(document.querySelectorAll('.place-card').length, 3);
assert.equal(document.title, 'Сувениры — Сибириус');
await tick(() => click('.mobile-nav a[href="#home"]'));
await tick(() => click('.header-menu'));
await tick(() => click('.menu-links a[href="#souvenirs"]'));
assert.equal(document.querySelectorAll('.place-card').length, 3);
assert.equal(document.querySelector('dialog'), null);
await tick(() => { window.location.hash = '#food'; });
await tick(() => { window.location.hash = '#souvenirs'; });
assert.equal(document.querySelectorAll('.place-card').length, 3);
await tick(() => root.unmount());
console.log('OK: сортировка через select, сувениры с главной, из меню и по прямому якорю.');
console.log('OK: DOM-переходы, повторные якоря, #transport, меню, 10 ссылок магазинов, копирование всех 3 адресов через Clipboard API и запасной способ, ошибка копирования, отмена отложенного перехода.');
