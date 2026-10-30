import { ArrowLeft, BedDouble } from 'lucide-react';
import { useState } from 'react';
import { hotels, sortHotels, type HotelSort } from '../data/hotels';
import HotelCard from '../components/HotelCard';

export default function HotelsPage() {
  const [sort, setSort] = useState<HotelSort>('distance');
  const sorted = sortHotels(sort);
  return <>
    <a className="back-link" href="#home"><ArrowLeft size={18} />На главную</a>
    <section className="food-heading" aria-labelledby="hotels-title"><div><span className="eyebrow">ХАНТЫ-МАНСИЙСК · ПУТЕВОДИТЕЛЬ</span><h1 id="hotels-title" tabIndex={-1}>Проживание<span className="title-dot">.</span></h1><p>Гостиницы для поездки на конференцию.</p></div><span className="food-heading-icon"><BedDouble size={44} strokeWidth={1.5} /></span></section>
    <section className="food-list" aria-label="Гостиницы города">
      <div className="hotel-sort"><label htmlFor="hotel-sort">Сортировка</label><select id="hotel-sort" value={sort} onChange={event => setSort(event.target.value as HotelSort)}><option value="distance">По расстоянию</option><option value="price">По стоимости</option></select></div>
      <p className="result-count">Все гостиницы<span>{hotels.length.toString().padStart(2, '0')}</span></p>
      <div className="places-grid">{sorted.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}</div>
    </section>
  </>;
}
