import { BusFront, Utensils, BedDouble, Gift } from 'lucide-react';

export const categories = [
  { id: 'transport', title: 'Места проведения', subtitle: 'Адреса и маршруты', icon: BusFront, color: 'purple' },
  { id: 'food', title: 'Где поесть', subtitle: 'Кафе и рестораны', icon: Utensils, color: 'orange' },
  { id: 'hotels', title: 'Проживание', subtitle: 'Отели города', icon: BedDouble, color: 'green' },
  { id: 'souvenirs', title: 'Сувениры', subtitle: 'Что привезти', icon: Gift, color: 'lilac' },
] as const;

export function routeUrl(address: string) {
  const destination = `Ханты-Мансийск, ${address.replace(/, \d+ этаж$/, '')}`;
  return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(destination)}&rtt=auto`;
}

export function shortPrice(price: string) {
  return price.replace(/^≈/, '').match(/^(?:от\s+)?[\d\s]+(?:–[\d\s]+)?\s₽/)?.[0] || 'Цена уточняется';
}
