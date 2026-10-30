import yugra from '../assets/images/hotel-yugra.webp';
import olympic from '../assets/images/hotel-olympic.webp';
import sovetnik from '../assets/images/hotel-sovetnik.webp';
import taray from '../assets/images/hotel-taray.webp';

export interface HotelPhoto { src: string; alt: string; }
export type HotelSort = 'distance' | 'price';

export function sortHotels(sort: HotelSort) {
  const value = (hotel: Hotel) => {
    const text = sort === 'distance' ? hotel.distance : hotel.price;
    const number = text.match(/\d[\d\s\u00a0\u202f]*(?:[.,]\d+)?/)?.[0];
    return number ? Number(number.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.')) : Infinity;
  };
  return [...hotels].sort((a, b) => value(a) - value(b));
}
export interface Hotel {
  id: string; name: string; address: string; price: string;
  time: string; distance: string; description: string;
  route: string; booking: string; stars?: number;
  // Карточка показывает только первую фотографию, если она предоставлена.
  photos?: readonly HotelPhoto[];
}

export const hotels: Hotel[] = [
  {
    "id": "hotel-0",
    "name": "Гостиница «Олимпийская»",
    "photos": [{ src: olympic, alt: 'Здание гостиницы «Олимпийская» на ул. Энгельса, 45' }],
    "stars": 4,
    "address": "Ханты-Мансийск, ул. Энгельса, 45",
    "price": "от 4 400 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈4 мин на автомобиле",
    "distance": "1,5 км по автомобильному маршруту",
    "description": "Гостиница с рестораном рядом с центром города, откуда удобно добираться до конференционной площадки.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%AD%D0%BD%D0%B3%D0%B5%D0%BB%D1%8C%D1%81%D0%B0%2C%2045~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://olympic.ugrahotels.ru/offers/"
  },
  {
    "id": "hotel-1",
    "name": "Гостиница «Тарей»",
    "photos": [{ src: taray, alt: 'Здание гостиницы «Тарей» на ул. Ленина, 64' }],
    "stars": 4,
    "address": "Ханты-Мансийск, ул. Ленина, 64",
    "price": "от 8 165 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈9 мин на автомобиле",
    "distance": "2,63 км по автомобильному маршруту",
    "description": "Гостиница на улице Ленина с рестораном в здании и номерами для деловых поездок.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%2C%2064~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://hoteltaray.ru/booking/?room-type=247203"
  },
  {
    "id": "hotel-2",
    "name": "Гостиница «СоветникЪ»",
    "photos": [{ src: sovetnik, alt: 'Здание гостиницы «СоветникЪ» на ул. Рознина, 136' }],
    "stars": 3,
    "address": "Ханты-Мансийск, ул. Рознина, 136",
    "price": "≈6 500–7 500 ₽ за ночь — предварительный ориентир по предложениям сервисов бронирования; тип номера и условия размещения для одного гостя не подтверждены",
    "time": "≈7 мин на автомобиле",
    "distance": "2,47 км по автомобильному маршруту",
    "description": "Гостиница с вариантами размещения с кухонным уголком — удобно для более продолжительной поездки.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%A0%D0%BE%D0%B7%D0%BD%D0%B8%D0%BD%D0%B0%2C%20136~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://www.putevka.com/hotels/russia/khanty-mansiysk/na_roznina"
  },
  {
    "id": "hotel-3",
    "name": "Гостиничный комплекс «Миснэ»",
    "address": "Ханты-Мансийск, ул. Гагарина, 54",
    "price": "от 7 500 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈9 мин на автомобиле",
    "distance": "3,4 км по автомобильному маршруту",
    "description": "Гостиничный комплекс с собственным рестораном рядом с лесными прогулочными тропами.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%93%D0%B0%D0%B3%D0%B0%D1%80%D0%B8%D0%BD%D0%B0%2C%2054~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://misne.ru/booking?room-type=37374"
  },
  {
    "id": "hotel-4",
    "name": "Гостиница «Кристалл»",
    "address": "Ханты-Мансийск, ул. Красноармейская, 14",
    "price": "от 4 700 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈11 мин на автомобиле",
    "distance": "4 км по автомобильному маршруту",
    "description": "Гостиница с отдельными номерами и Wi-Fi для спокойного проживания во время поездки.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B0%D1%80%D0%BC%D0%B5%D0%B9%D1%81%D0%BA%D0%B0%D1%8F%2C%2014~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://xn--80aaiscajkawjsofjg5e.xn--p1ai/bron.htm"
  },
  {
    "id": "hotel-5",
    "name": "Гостевой дом «Континенталь Green Dream»",
    "address": "Ханты-Мансийск, ул. Энтузиастов, 14",
    "price": "от 4 500 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈9 мин на автомобиле",
    "distance": "3,3 км по автомобильному маршруту",
    "description": "Гостевой дом с одноместными номерами и Wi-Fi в спокойном жилом районе.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%AD%D0%BD%D1%82%D1%83%D0%B7%D0%B8%D0%B0%D1%81%D1%82%D0%BE%D0%B2%2C%2014~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://travel.yandex.ru/hotels/khanty-mansiysk/kontinental/"
  },
  {
    "id": "hotel-6",
    "name": "Гостиничный комплекс «На семи холмах»",
    "stars": 2,
    "address": "Ханты-Мансийск, ул. Спортивная, 24/9",
    "price": "от 3 200 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈10 мин на автомобиле",
    "distance": "4,3 км по автомобильному маршруту",
    "description": "Гостиничный комплекс на Спортивной с одноместными номерами и оборудованными местами для приёма пищи.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%A1%D0%BF%D0%BE%D1%80%D1%82%D0%B8%D0%B2%D0%BD%D0%B0%D1%8F%2C%2024%2F9~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://7hills.ugrahotels.ru/offers/"
  },
  {
    "id": "hotel-7",
    "name": "Отель «Югра»",
    "photos": [{ src: yugra, alt: 'Здание отеля «Югра» на ул. Комсомольская, 32' }],
    "stars": 4,
    "address": "Ханты-Мансийск, ул. Комсомольская, 32",
    "price": "от 7 600 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈7 мин на автомобиле",
    "distance": "2,02 км по автомобильному маршруту",
    "description": "Современный отель на Комсомольской с рестораном и пространством для деловых мероприятий.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%9A%D0%BE%D0%BC%D1%81%D0%BE%D0%BC%D0%BE%D0%BB%D1%8C%D1%81%D0%BA%D0%B0%D1%8F%2C%2032~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://ugra-hotel.ru/booking/"
  },
  {
    "id": "hotel-8",
    "name": "Отель «Авиатор»",
    "stars": 2,
    "address": "Ханты-Мансийск, ул. Мира, 130",
    "price": "от 3 200 ₽ за отдельный номер на одну ночь для 1 взрослого",
    "time": "≈12 мин на автомобиле",
    "distance": "8,9 км по автомобильному маршруту",
    "description": "Отель рядом с аэропортом с парковкой, удобный для гостей, прибывающих самолётом.",
    "route": "https://yandex.ru/maps/?rtext=%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%9C%D0%B8%D1%80%D0%B0%2C%20130~%D0%A5%D0%B0%D0%BD%D1%82%D1%8B-%D0%9C%D0%B0%D0%BD%D1%81%D0%B8%D0%B9%D1%81%D0%BA%2C%20%D0%9F%D1%80%D0%BE%D0%BC%D1%8B%D1%88%D0%BB%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F%2C%2019&rtt=auto",
    "booking": "https://booking-111751.agast.ru/"
  }
];
