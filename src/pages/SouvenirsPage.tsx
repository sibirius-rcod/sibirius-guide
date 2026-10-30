import { ArrowLeft, ArrowUpRight, Clock3, Gift, MapPin, Navigation } from 'lucide-react';
import { souvenirs } from '../data/souvenirs';
import { routeUrl } from '../data/guide';

export default function SouvenirsPage() {
  return <>
    <a className="back-link" href="#home"><ArrowLeft size={18} />На главную</a>
    <section className="food-heading" aria-labelledby="souvenirs-title"><div><span className="eyebrow">ХАНТЫ-МАНСИЙСК · ПУТЕВОДИТЕЛЬ</span><h1 id="souvenirs-title" tabIndex={-1}>Сувениры<span className="title-dot">.</span></h1><p>Что привезти из поездки.</p></div><span className="food-heading-icon souvenir-heading-icon"><Gift size={44} strokeWidth={1.5} /></span></section>
    <section className="food-list" aria-label="Магазины сувениров">
      <div className="places-grid">{souvenirs.map(shop => <article key={shop.id} className="place-card" aria-labelledby={`${shop.id}-title`}><div className="place-content">
        <div className="place-title"><h2 id={`${shop.id}-title`}>{shop.name}</h2></div>
        <div className="place-detail address-detail"><MapPin size={18} aria-hidden="true" /><span>{shop.address}</span></div>
        <div className="place-detail hours"><Clock3 size={18} aria-hidden="true" /><span>{shop.hours}</span></div>
        <div className="place-actions"><a className="button button-soft" href={routeUrl(shop.address)} aria-label={`Маршрут: ${shop.name} (Яндекс Карты)`}><Navigation size={17} />Маршрут<ArrowUpRight size={16} /></a></div>
      </div></article>)}</div>
    </section>
  </>;
}
