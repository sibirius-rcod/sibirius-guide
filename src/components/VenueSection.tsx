import { ArrowUpRight } from 'lucide-react';
import { venues } from '../data/venues';
import { transportApps } from '../data/transport';
import VenueCard from './VenueCard';

export default function VenueSection() {
  return <section className="venue-section" id="venue" aria-labelledby="venue-title">
    <div className="section-heading"><h2 id="venue-title" tabIndex={-1}>Места проведения</h2></div>
    <VenueCard venue={venues[0]} />
    <div className="venue-grid">{venues.slice(1).map(venue => <VenueCard key={venue.id} venue={venue} />)}</div>
    <section className="transport-apps" aria-labelledby="transport-apps-title">
      <h3 id="transport-apps-title">Приложения для поездок</h3>
      <div className="transport-app-grid">{transportApps.map(app => <article key={app.name} className="transport-app">
        <div className="transport-app-heading">
          <img className="transport-app-icon" src={app.icon} width="56" height="56" alt="" loading="lazy" />
          <div><h4>{app.name}</h4><p>{app.description}</p></div>
        </div>
        <div className="place-actions">
          <a className="button button-light" href={app.googlePlay} aria-label={`${app.name} — Google Play`}>Google Play<ArrowUpRight size={14} aria-hidden="true" /></a>
          <a className="button button-light" href={app.appStore} aria-label={`${app.name} — App Store`}>App Store<ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
      </article>)}</div>
    </section>
  </section>;
}
