import olymp from '../assets/images/olymp.webp';
import panorama from '../assets/images/panorama.webp';
import travelers from '../assets/images/travelers.webp';
import goodfood from '../assets/images/goodfood.webp';
import proItalia from '../assets/images/food-pro-italia.webp';
import proKhinkali from '../assets/images/food-pro-khinkali.webp';
import olympHall from '../assets/images/food-olymp.webp';
import panoramaInterior from '../assets/images/food-panorama-interior.webp';
import panoramaExterior from '../assets/images/food-panorama-exterior.webp';
import khurmaExterior from '../assets/images/food-khurma-exterior.webp';
import khurmaInterior from '../assets/images/food-khurma-interior.webp';
import khinkaliHall from '../assets/images/food-khinkali-hall.webp';
import khinkaliSeating from '../assets/images/food-khinkali-seating.webp';
import type { CardPhoto } from '../components/CardPhotos';
export interface Place { id: string; name: string; addresses: string[]; hours: string[]; price: string; description: string; image?: string; photos?: readonly CardPhoto[]; }
// Источник: food_khanty_mansiysk_2026_final.md, 29.10.2026.
export const places: Place[] = [
  {
    "id": "olymp",
    "name": "Ресторан «Олимп»",
    "photos": [{ src: olympHall, alt: 'Светлый обеденный зал ресторана «Олимп»' }],
    "addresses": [
      "ул. Энгельса, 45, 1-й этаж"
    ],
    "hours": [
      "Ежедневно 07:00–10:00, 12:00–15:00, 17:00–22:00"
    ],
    "price": "800–1 000 ₽ — стоимость шведского стола: завтрак 800 ₽, обед или ужин 1 000 ₽ (не средний чек по меню).",
    "description": "Ресторан при гостинице «Олимпийская», где можно позавтракать, пообедать или поужинать за шведским столом.",
    "image": olymp
  },
  {
    "id": "panorama",
    "name": "Ресторан «Панорама»",
    "photos": [{ src: panoramaExterior, alt: 'Вход с вывеской ресторана «Панорама»' }, { src: panoramaInterior, alt: 'Интерьер ресторана «Панорама» с фирменной вывеской' }],
    "addresses": [
      "ул. Ленина, 64, 6-й этаж"
    ],
    "hours": [
      "Ежедневно 11:00–23:00"
    ],
    "price": "≈2 000–3 500 ₽ — предварительный справочный диапазон; источники расходятся, актуальная сумма не подтверждена.",
    "description": "Ресторан с красивым видом на город и блюдами сибирской кухни.",
    "image": panorama
  },
  {
    "id": "food-2",
    "name": "Pro Italia",
    "photos": [{ src: proItalia, alt: 'Летняя терраса кафе Pro Italia и вход с вывеской' }],
    "addresses": [
      "ул. Ленина, 39"
    ],
    "hours": [
      "Ежедневно 12:00–23:00"
    ],
    "price": "800–1 300 ₽ — заявленный средний чек в Яндекс Картах (дата обновления цены не указана).",
    "description": "Уютное итальянское кафе: пицца, паста и другие любимые блюда."
  },
  {
    "id": "food-3",
    "name": "«Хинкали желали?»",
    "photos": [{ src: khinkaliHall, alt: 'Светлый зал ресторана «Хинкали желали?» с растениями у окон' }, { src: khinkaliSeating, alt: 'Зона отдыха с креслами и растениями в ресторане «Хинкали желали?»', width: 852, height: 568 }],
    "addresses": [
      "ул. Энгельса, 18"
    ],
    "hours": [
      "Ежедневно 12:00–23:00"
    ],
    "price": "≈800–1 100 ₽ — предварительная оценка по отдельным позициям меню; цена полного заказа с напитком не подтверждена.",
    "description": "Душевный грузинский ресторан с хинкали, хачапури и атмосферой домашнего застолья."
  },
  {
    "id": "food-4",
    "name": "Ресторан «Хурма»",
    "photos": [{ src: khurmaExterior, alt: 'Вход и вывеска ресторана «Хурма»' }, { src: khurmaInterior, alt: 'Зал ресторана «Хурма» с мягкими диванами' }],
    "addresses": [
      "ул. Комсомольская, 31"
    ],
    "hours": [
      "Ежедневно 12:00–22:00"
    ],
    "price": "800–1 300 ₽ — расчётный ориентир по меню доставки за основное блюдо и напиток; цены в зале не подтверждены.",
    "description": "Грузинская кухня с необычными сочетаниями и авторскими вариантами знакомых блюд."
  },
  {
    "id": "food-5",
    "name": "PRO.Хинкали by Novikov",
    "photos": [{ src: proKhinkali, alt: 'Зал ресторана PRO.Хинкали by Novikov', width: 738, height: 492 }],
    "addresses": [
      "ул. Комсомольская, 32, 1-й этаж отеля «Югра»"
    ],
    "hours": [
      "Ежедневно 12:00–22:00; пт–сб 12:00–00:00"
    ],
    "price": "1 100–1 400 ₽ — расчётный ориентир по местному меню за основное блюдо и безалкогольный напиток (не статистический средний чек).",
    "description": "Большой современный грузинский ресторан, где можно собраться компанией за хинкали и хачапури."
  },
  {
    "id": "food-6",
    "name": "BRO Restobar",
    "addresses": [
      "ул. Энгельса, 1, 4-й этаж ТЦ «Гостиный двор»"
    ],
    "hours": [
      "Ежедневно 11:00–23:00; пт–сб 11:00–02:00"
    ],
    "price": "≈1 500 ₽ — заявленный средний чек в 2ГИС (дата обновления цены не указана).",
    "description": "Стейки, бургеры, напитки и отличный вид на центр города."
  },
  {
    "id": "food-7",
    "name": "Chester GastroPub",
    "addresses": [
      "ул. Рознина, 46"
    ],
    "hours": [
      "Ежедневно 12:00–02:00"
    ],
    "price": "≈1 000–1 500 ₽ — предварительная оценка основного блюда и напитка, не подтверждённый средний чек (в сторонних источниках встречается более высокий общий чек).",
    "description": "Атмосферный паб с мясными блюдами, закусками и напитками для вечернего отдыха."
  },
  {
    "id": "food-8",
    "name": "IL Патио",
    "addresses": [
      "ул. Коминтерна, 30, 2-й этаж"
    ],
    "hours": [
      "Ежедневно 11:00–00:00; пт–сб 11:00–01:00"
    ],
    "price": "≈1 000 ₽ — заявленный средний чек в 2ГИС (дата обновления цены не указана).",
    "description": "Итальянский ресторан с пиццей, пастой и приятной атмосферой для обеда или ужина."
  },
  {
    "id": "food-9",
    "name": "Ресто-бар «Планета»",
    "addresses": [
      "ул. Коминтерна, 30, 1-й этаж"
    ],
    "hours": [
      "Ежедневно 12:00–00:00"
    ],
    "price": "1 500–2 500 ₽ — заявленный средний чек в Яндекс Картах (дата обновления цены не указана).",
    "description": "Рестобар с разнообразной кухней, музыкой и пространством для вечерних встреч."
  },
  {
    "id": "food-10",
    "name": "«Шоколадница»",
    "addresses": [
      "ул. Энгельса, 16"
    ],
    "hours": [
      "Ежедневно 07:30–23:00"
    ],
    "price": "≈1 350 ₽ — заявленный средний чек в 2ГИС (это общий чек кофейни, не цена кофе с десертом).",
    "description": "Кофейня с завтраками, десертами и полноценным меню на каждый день."
  },
  {
    "id": "travelers",
    "name": "Traveler’s Coffee",
    "addresses": [
      "ул. Ленина, 39"
    ],
    "hours": [
      "Ежедневно 08:00–23:00"
    ],
    "price": "≈600–900 ₽",
    "description": "Кофе, десерты и уютное место, чтобы отдохнуть или встретиться с коллегами.",
    "image": travelers
  },
  {
    "id": "food-12",
    "name": "STARS COFFEE",
    "addresses": [
      "ул. Энгельса, 18"
    ],
    "hours": [
      "Ежедневно 07:30–23:00"
    ],
    "price": "≈500–800 ₽ — предварительная оценка напитка и десерта; цены именно этого филиала не подтверждены.",
    "description": "Современная кофейня с большим выбором напитков, десертов и перекусов."
  },
  {
    "id": "goodfood",
    "name": "«Гуд Фуд»",
    "addresses": [
      "ул. Ленина, 43, Food Park"
    ],
    "hours": [
      "Ежедневно 09:00–20:00"
    ],
    "price": "400–600 ₽",
    "description": "Блины с разными начинками, домашние обеды и другие блюда для быстрого перекуса.",
    "image": goodfood
  },
  {
    "id": "food-14",
    "name": "Rostic’s",
    "addresses": [
      "ул. Ленина, 43, Food Park"
    ],
    "hours": [
      "Ежедневно 08:00–23:00"
    ],
    "price": "≈450–750 ₽ — предварительная оценка типичного заказа; местные цены и работа точки требуют подтверждения.",
    "description": "Куриные крылышки, бургеры, картошка фри и комбо для быстрого обеда."
  },
  {
    "id": "food-15",
    "name": "ШАУРМА SHOP",
    "addresses": [
      "ул. Чехова, 27"
    ],
    "hours": [
      "Ежедневно 10:00–22:00"
    ],
    "price": "≈550–800 ₽ — предварительная оценка шаурмы с напитком; данные меню неоднозначны, итоговый чек не подтверждён.",
    "description": "Сытная шаурма с разными начинками, которую удобно взять с собой."
  },
  {
    "id": "food-16",
    "name": "Бургер Кинг",
    "addresses": [
      "ул. Объездная, 9, гипермаркет «Лента»"
    ],
    "hours": [
      "Ежедневно 09:00–01:00"
    ],
    "price": "450–600 ₽ — расчётный ориентир по каталогу доставки за бургер и напиток; цены в зале не подтверждены.",
    "description": "Знакомые бургеры, картошка фри и комбо для тех, кто хочет перекусить без долгого ожидания."
  }
];
export function findPlaces(query: string) { const search = query.trim().toLocaleLowerCase('ru'); return places.filter(p => (p.name+' '+p.addresses.join(' ')+' '+p.description).toLocaleLowerCase('ru').includes(search)); }
