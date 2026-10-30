import { MapPin, Navigation, ArrowUpRight } from 'lucide-react';
import type { Hotel } from '../data/hotels';
import { shortPrice } from '../data/guide';

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return <article className="place-card" aria-labelledby={`${hotel.id}-title`}>
        {hotel.photos?.length ? <div className="place-photo hotel-photo"><img src={hotel.photos[0].src} alt={hotel.photos[0].alt} loading="lazy" decoding="async" width="960" height="640" /></div> : null}
        <div className="place-content">
          <div className="place-title"><h2 id={`${hotel.id}-title`}>{hotel.name}{hotel.stars && <span className="hotel-stars" aria-label={`Категория: ${hotel.stars} звезды`}>{'★'.repeat(hotel.stars)}</span>}</h2></div>
          <div className="place-detail address-detail"><MapPin size={18} aria-hidden="true" /><span>{hotel.address}</span></div>
          <p className="card-copy"><strong className="card-price">{shortPrice(hotel.price)}</strong> / ночь</p>
          <div className="place-detail hours"><Navigation size={18} aria-hidden="true" /><span>До Технопарка: {hotel.distance.split(' км')[0]} км</span></div>
          <div className="place-actions"><a className="button button-soft" href={hotel.route} aria-label={`Маршрут от ${hotel.name} до Технопарка`}><Navigation size={17} />Маршрут<ArrowUpRight size={16} /></a><a className="button button-light" href={hotel.booking} target="_blank" rel="noopener noreferrer" aria-label={`Бронирование: ${hotel.name} (новая вкладка)`}>Бронирование<ArrowUpRight size={17} /></a></div>
        </div>
      </article>;
}
