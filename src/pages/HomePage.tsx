import { ArrowUpRight } from 'lucide-react';
import { eventName, forum } from '../config';
import { categories } from '../data/guide';
import Pattern from '../components/Pattern';
import VenueSection from '../components/VenueSection';

export default function HomePage() {
  return <>
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-content" aria-label={eventName}>
        <p className="hero-kicker">{forum.heading}</p>
        <h1 id="home-title" tabIndex={-1}>Путеводитель<br />участника<span className="title-dot">.</span></h1>
        <p className="hero-event">{forum.title}</p>
        <p className="hero-description">Форум {forum.audience}</p>
      </div>
      <div className="hero-art" aria-hidden="true"><Pattern /><span className="hero-art-caption">НОВЫЕ МЕСТА. НОВЫЕ ВОЗМОЖНОСТИ.</span></div>
    </section>
    <section className="categories-section" aria-labelledby="categories-title">
      <div className="section-heading"><h2 id="categories-title">Что вас интересует?</h2></div>
      <div className="category-grid">{categories.map(({ id, title, subtitle, icon: Icon, color }) => {
        const content = <><span className={`category-icon ${color}`}><Icon size={27} strokeWidth={1.7} /></span><ArrowUpRight className="category-arrow" size={22} /><span className="category-title">{title}</span><span className="category-subtitle">{subtitle}</span></>;
        return <a className={`category-card ${color}`} key={id} href={id === 'transport' ? '#venue' : `#${id}`}>{content}</a>;
      })}</div>
    </section>
    <VenueSection />
  </>;
}
