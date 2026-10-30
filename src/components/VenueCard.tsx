import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { BusFront, CarFront, Copy, MapPin } from 'lucide-react';
import type { Venue } from '../data/venues';
import { busRouteUrl, taxiUrl } from '../data/transport';

export default function VenueCard({ venue }: { venue: Venue }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [locating, setLocating] = useState(false);
  const alive = useRef(true);
  const pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      if (alive.current) setCopyStatus('Адрес скопирован');
    } catch {
      const previous = document.activeElement as HTMLElement | null;
      const field = document.createElement('textarea');
      field.value = venue.address;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Доступно ручное копирование. */ }
      field.remove();
      previous?.focus({ preventScroll: true });
      if (alive.current) setCopyStatus(copied ? 'Адрес скопирован' : 'Не удалось скопировать. Выделите адрес выше.');
    }
  };

  const openBusRoute = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !navigator.geolocation) return;
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setLocating(true);
    const open = (coords?: GeolocationCoordinates) => {
      if (!alive.current) return;
      pending.current = false;
      setLocating(false);
      window.location.assign(busRouteUrl(venue.address, coords));
    };
    try {
      navigator.geolocation.getCurrentPosition(
        position => open(position.coords),
        () => open(),
        { timeout: 5000, maximumAge: 60000 },
      );
    } catch { open(); }
  };

  return <article className={`venue-card${venue.image ? '' : ' venue-card-compact'}`} aria-labelledby={`${venue.id}-title`}>
    {venue.image && <div className="venue-image"><img {...venue.image} loading="lazy" /></div>}
    <div className="venue-content">
      <h3 id={`${venue.id}-title`}>{venue.name}</h3>
      {venue.organization && <p className="venue-organization">{venue.organization}</p>}
      <div className="place-detail address-detail"><MapPin size={18} aria-hidden="true" /><span className="transport-address">{venue.address}</span></div>
      <div className="venue-actions">
        <button type="button" className="button button-soft venue-copy" onClick={copyAddress}><Copy size={17} aria-hidden="true" />Скопировать адрес</button>
        <a className="button button-soft" href={busRouteUrl(venue.address)} onClick={openBusRoute} aria-busy={locating}><BusFront size={17} aria-hidden="true" />На автобусе</a>
        <a className="button button-soft" href={taxiUrl(venue.coordinates)}><CarFront size={17} aria-hidden="true" />На такси</a>
      </div>
      <p className="transport-status" role="status">{copyStatus}</p>
      <p className="transport-status" role="status">{locating ? 'Определяем местоположение…' : ''}</p>
    </div>
  </article>;
}
