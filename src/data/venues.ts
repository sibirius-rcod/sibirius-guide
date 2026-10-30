import technopark from '../assets/images/technopark.webp';
import lyceum from '../assets/images/venue-lyceum.webp';
import school2 from '../assets/images/venue-school-2.webp';

export interface Venue {
  id: string;
  name: string;
  organization?: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  image?: { src: string; alt: string; width: number; height: number };
}

// Координаты домов, а не старых карточек организаций: см. assets/SOURCES.md.
export const venues: readonly Venue[] = [
  {
    id: 'technopark',
    name: 'Технопарк высоких технологий',
    organization: 'АУ ДО «Мастерская талантов «Сибириус»',
    address: 'Ханты-Мансийск, ул. Промышленная, 19',
    coordinates: { latitude: 61.001422, longitude: 68.994009 },
    image: { src: technopark, alt: 'Здание Технопарка высоких технологий в Ханты-Мансийске', width: 1392, height: 752 },
  },
  {
    id: 'lyceum',
    name: 'Югорский физико-математический лицей-интернат',
    address: 'Ханты-Мансийск, ул. Мира, 124',
    coordinates: { latitude: 61.019178, longitude: 69.086230 },
    image: { src: lyceum, alt: 'Здание Югорского физико-математического лицея-интерната на ул. Мира, 124', width: 960, height: 640 },
  },
  {
    id: 'school-2',
    name: 'МБОУ «Средняя общеобразовательная школа № 2»',
    address: 'Ханты-Мансийск, ул. Анны Коньковой, 5',
    coordinates: { latitude: 60.968844, longitude: 69.015749 },
    image: { src: school2, alt: 'Здание МБОУ «СОШ № 2» на ул. Анны Коньковой, 5', width: 960, height: 640 },
  },
];
