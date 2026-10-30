import { useState } from 'react';
import { MapPin, Clock3, Navigation, ArrowUpRight } from 'lucide-react';
import type { Place } from '../data/places';
import { routeUrl, shortPrice } from '../data/guide';

export default function PlaceCard({ place, query = '' }: { place: Place; query?: string }) {
  const [branch, setBranch] = useState(() => place.addresses.find(address => query.trim() && address.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))) || place.addresses[0]);
  return <article className="place-card" aria-labelledby={`${place.id}-title`}>
    <div className="place-content">
      <div className="place-title"><h2 id={`${place.id}-title`}>{place.name}</h2></div>
      <div className="place-detail address-detail"><MapPin size={18} aria-hidden="true" />
        {place.addresses.length > 1 ? <div className="branch-field"><label htmlFor={`${place.id}-branch`}>Выберите адрес · {place.addresses.length} в путеводителе</label><select id={`${place.id}-branch`} value={branch} onChange={e => setBranch(e.target.value)}>{place.addresses.map(address => <option key={address}>{address}</option>)}</select></div> : <span>{branch}</span>}
      </div>
      {place.hours && <div className="place-detail hours"><Clock3 size={18} aria-hidden="true" /><div>{place.hours.map(line => <span key={line}>{line}</span>)}</div></div>}
      <p className="card-copy"><strong className="card-price" aria-label={`На человека: ${shortPrice(place.price)}`}>{shortPrice(place.price)}</strong></p>
      <p className="card-copy">{place.description}</p>
      <div className="place-actions">
        <a className="button button-soft" href={routeUrl(branch)} aria-label={`Маршрут: ${place.name}, ${branch} (Яндекс Карты)`}><Navigation size={17} />Маршрут<ArrowUpRight size={16} /></a>
      </div>

    </div>
  </article>;
}
