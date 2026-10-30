import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
const require = createRequire(import.meta.url);
export function load(file) {
  const filename = path.resolve(file);
  if (/\.(webp|png)$/.test(filename)) return file;
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const result = { exports: {} };
  const localRequire = id => id.startsWith('.') ? load(path.resolve(path.dirname(filename), /\.(webp|png)$/.test(id) ? id : id + (require('node:fs').existsSync(path.resolve(path.dirname(filename), id + '.tsx')) ? '.tsx' : '.ts'))) : require(id);
  new Function('require', 'module', 'exports', code)(localRequire, result, result.exports);
  return result.exports;
}
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const vite = { ssrLoadModule: async file => load('.' + file), close: async () => {} };
try {
  const { places, findPlaces } = await vite.ssrLoadModule('/src/data/places.ts');
  const { hotels, sortHotels } = await vite.ssrLoadModule('/src/data/hotels.ts');
  const { busRouteUrl, taxiUrl, transportApps } = await vite.ssrLoadModule('/src/data/transport.ts');
  const { venues } = await vite.ssrLoadModule('/src/data/venues.ts');
  const { eventName } = await vite.ssrLoadModule('/src/config.ts');
  assert.equal(places.length, 17);
  assert.equal(hotels.length, 9);
  assert.equal(new Set(places.map(p => p.id)).size, places.length);
  for (const p of places) assert.ok(p.name && p.addresses.length && p.hours.length && p.price && p.description);
  for (const id of ['olymp', 'panorama', 'goodfood', 'travelers']) assert.ok(places.find(p => p.id === id)?.image);
  assert.equal(findPlaces('  PRO ITALIA ')[0].name, 'Pro Italia');
  assert.equal(findPlaces('нет такого места').length, 0);
  assert.ok(findPlaces('  ПИЦЦА ').some(place => place.name === 'Pro Italia'));
  assert.ok(findPlaces('блины').some(place => place.id === 'goodfood'));
  assert.equal(places.find(place => place.id === 'goodfood').price, '400–600 ₽');
  assert.ok(!JSON.stringify(places.find(place => place.id === 'travelers')).includes('ремонт'));
  const originalOrder = hotels.map(hotel => hotel.id);
  assert.deepEqual(sortHotels('distance').map(hotel => hotel.distance.split(' км')[0]), ['1,5', '2,02', '2,47', '2,63', '3,3', '3,4', '4', '4,3', '8,9']);
  assert.deepEqual(sortHotels('price').map(hotel => hotel.id), ['hotel-6', 'hotel-8', 'hotel-0', 'hotel-5', 'hotel-4', 'hotel-2', 'hotel-3', 'hotel-7', 'hotel-1']);
  assert.deepEqual(hotels.map(hotel => hotel.id), originalOrder);
  for (const h of hotels) {
    assert.ok(h.name && h.address && h.price && h.time && h.description);
    const route = new URL(h.route);
    assert.equal(route.hostname, 'yandex.ru');
    assert.ok(route.searchParams.get('rtext').endsWith('Промышленная, 19'));
    assert.equal(new URL(h.booking).protocol, 'https:');
  }
  for (const [page, count] of [['FoodPage',17], ['HotelsPage',9]]) {
    const Component = (await vite.ssrLoadModule(`/src/pages/${page}.tsx`)).default;
    const html = renderToStaticMarkup(createElement(Component));
    assert.equal((html.match(/class="place-card"/g) || []).length, count);
    assert.ok(!html.includes('Служебные'));
    if (page === 'FoodPage') {
      assert.ok(!html.includes('закрытую на ремонт'));
      assert.ok(html.includes('800–1 300 ₽'));
      assert.ok(html.includes('Цены ориентировочные и могут меняться'));
      assert.ok(!html.includes('place-photo') && !html.includes('photo-placeholder'));
      assert.ok(!html.includes('расчётный ориентир') && !html.includes('источники расходятся'));
      assert.ok(!html.includes('Тип заведения'));
    } else {
      assert.deepEqual([...html.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map(match => [match[1], match[2]]), [['distance', 'По расстоянию'], ['price', 'По стоимости']]);
      assert.ok(html.includes('value="distance" selected=""'));
      assert.equal((html.match(/>Бронирование/g) || []).length, 9);
      assert.equal((html.match(/class="hotel-stars"/g) || []).length, 6);
      assert.ok(!html.includes('на автомобиле') && !html.includes('Сведения о гостиницах'));
      assert.ok(!html.includes('предварительный ориентир') && !html.includes('data-notice'));
    }
  }
  const destinations = [
    ['Ханты-Мансийск, ул. Промышленная, 19', '61.001422', '68.994009'],
    ['Ханты-Мансийск, ул. Мира, 124', '61.019178', '69.08623'],
    ['Ханты-Мансийск, ул. Анны Коньковой, 5', '60.968844', '69.015749'],
  ];
  assert.equal(venues.length, 3);
  for (const [i, [address, latitude, longitude]] of destinations.entries()) {
    assert.equal(venues[i].address, address);
    const bus = new URL(busRouteUrl(venues[i].address, { latitude: 61, longitude: 69 }));
    assert.equal(bus.hostname, 'yandex.ru');
    assert.equal(bus.searchParams.get('rtt'), 'mt');
    assert.equal(bus.searchParams.get('rtext'), `61,69~${address}`);
    assert.equal(new URL(busRouteUrl(venues[i].address)).searchParams.get('rtext'), `~${address}`);
    const taxi = new URL(taxiUrl(venues[i].coordinates));
    assert.equal(taxi.hostname, '3.redirect.appmetrica.yandex.com');
    assert.equal(taxi.searchParams.get('end-lat'), latitude);
    assert.equal(taxi.searchParams.get('end-lon'), longitude);
    assert.equal(taxi.searchParams.get('appmetrica_tracking_id'), '25395763362139037');
  }
  assert.equal(transportApps.length, 5);
  for (const app of transportApps) {
    assert.equal(new URL(app.googlePlay).hostname, 'play.google.com');
    assert.equal(new URL(app.appStore).hostname, 'apps.apple.com');
    assert.ok(app.description);
    assert.equal(readFileSync(app.icon).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  }
  const Transport = (await vite.ssrLoadModule('/src/components/VenueSection.tsx')).default;
  const transportHtml = renderToStaticMarkup(createElement(Transport));
  assert.ok(transportHtml.includes('Скопировать адрес') && transportHtml.includes('На автобусе') && transportHtml.includes('На такси'));
  assert.equal((transportHtml.match(/class="venue-card/g) || []).length, 3);
  assert.equal((transportHtml.match(/>Скопировать адрес</g) || []).length, 3);
  assert.equal((transportHtml.match(/>На автобусе</g) || []).length, 3);
  assert.equal((transportHtml.match(/>На такси</g) || []).length, 3);
  assert.equal((transportHtml.match(/id="transport-apps-title"/g) || []).length, 1);
  assert.equal((transportHtml.match(/class="transport-app-icon"/g) || []).length, 5);
  assert.ok(!transportHtml.includes('Площадка конференции'));
  const Home = (await vite.ssrLoadModule('/src/pages/HomePage.tsx')).default;
  const homeHtml = renderToStaticMarkup(createElement(Home, { onCategory() {} }));
  assert.ok(homeHtml.includes('href="#venue"') && !homeHtml.includes('href="#transport"'));
  assert.ok(homeHtml.includes('href="#souvenirs"') && !homeHtml.includes('Скоро'));
  assert.equal(eventName, 'III Межрегиональный форум работников сферы дополнительного образования детей „ПРОразвитие“');
  assert.ok(homeHtml.includes(eventName) && homeHtml.includes('Путеводитель') && homeHtml.includes('ПРОразвитие'));
  const Souvenirs = (await vite.ssrLoadModule('/src/pages/SouvenirsPage.tsx')).default;
  const souvenirsHtml = renderToStaticMarkup(createElement(Souvenirs));
  assert.equal((souvenirsHtml.match(/class="place-card"/g) || []).length, 3);
  const routes = [...souvenirsHtml.matchAll(/href="(https:\/\/yandex.ru\/maps\/[^\"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')).searchParams.get('rtext'));
  assert.deepEqual(routes, ['~Ханты-Мансийск, ул. Энгельса, 45', '~Ханты-Мансийск, ул. Мира, 11', '~Ханты-Мансийск, ул. Коминтерна, 15']);
  for (const removed of ['ГОРОД ПОД РУКОЙ', 'Почувствуйте себя на своём месте', 'МЕЖДУ ВСТРЕЧАМИ', 'hero-location']) assert.ok(!homeHtml.includes(removed));
  console.log('OK: сохранены 17 заведений, 9 гостиниц и 3 сувенирных магазина; сортировка, 3 площадки, 6 маршрутов, 5 локальных иконок, 10 ссылок магазинов и название форума.');
} finally { await vite.close(); }
