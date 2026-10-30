import type { Venue } from './venues';
import smartTransport from '../assets/apps/smart-transport.png';
import yandexMaps from '../assets/apps/yandex-maps.png';
import yandexGo from '../assets/apps/yandex-go.png';
import avtoliga from '../assets/apps/avtoliga.png';
import drivee from '../assets/apps/drivee.png';

export function busRouteUrl(address: string, origin?: { latitude: number; longitude: number }) {
  const start = origin ? `${origin.latitude},${origin.longitude}` : '';
  return `https://yandex.ru/maps/?rtext=${encodeURIComponent(`${start}~${address}`)}&rtt=mt`;
}

// Формат ссылки: https://yandex.ru/support/taxi-distr/ru/api/deeplinks
export function taxiUrl({ latitude, longitude }: Venue['coordinates']) {
  const params = new URLSearchParams({
    'end-lat': String(latitude),
    'end-lon': String(longitude),
    ref: 'sibirius',
    appmetrica_tracking_id: '25395763362139037',
  });
  return `https://3.redirect.appmetrica.yandex.com/route?${params}`;
}

// Проверены страницы Google Play и российского App Store, 30.10.2026.
export const transportApps = [
  { name: 'Умный транспорт', icon: smartTransport, description: 'Движение общественного транспорта на карте', googlePlay: 'https://play.google.com/store/apps/details?id=ru.bus62.SmartTransport&hl=ru', appStore: 'https://apps.apple.com/ru/app/умный-транспорт/id966468854' },
  { name: 'Яндекс Карты', icon: yandexMaps, description: 'Карта города и построение маршрутов', googlePlay: 'https://play.google.com/store/apps/details?id=ru.yandex.yandexmaps&hl=ru', appStore: 'https://apps.apple.com/ru/app/яндекс-карты-и-навигатор/id313877526' },
  { name: 'Яндекс Go', icon: yandexGo, description: 'Заказ такси', googlePlay: 'https://play.google.com/store/apps/details?id=ru.yandex.taxi&hl=ru', appStore: 'https://apps.apple.com/ru/app/яндекс-go-такси-еда-доставка/id472650686' },
  { name: 'АвтоЛига', icon: avtoliga, description: 'Заказ такси', googlePlay: 'https://play.google.com/store/apps/details?id=ru.x_cab&hl=ru', appStore: 'https://apps.apple.com/ru/app/автолига-совместные-поездки/id945384208' },
  { name: 'Drivee', icon: drivee, description: 'Заказ поездок', googlePlay: 'https://play.google.com/store/apps/details?id=com.drivee.taxi.rides&hl=ru', appStore: 'https://apps.apple.com/ru/app/drivee-такси-доставка/id6447953294' },
];
