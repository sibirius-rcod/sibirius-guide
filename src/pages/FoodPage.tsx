import { useMemo, useState } from 'react';
import { ArrowLeft, Search, X, Utensils } from 'lucide-react';
import { places, findPlaces } from '../data/places';
import PlaceCard from '../components/PlaceCard';

export default function FoodPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => findPlaces(query), [query]);
  const reset = () => { setQuery(''); };
  return <>
    <a className="back-link" href="#home"><ArrowLeft size={18} />На главную</a>
    <section className="food-heading" aria-labelledby="food-title"><div><span className="eyebrow">ХАНТЫ-МАНСИЙСК · ПУТЕВОДИТЕЛЬ</span><h1 id="food-title" tabIndex={-1}>Где поесть<span className="title-dot">.</span></h1><p>Время на обед, чашку кофе и хорошую компанию.</p></div><span className="food-heading-icon"><Utensils size={44} strokeWidth={1.5} /></span></section>
    <section className="food-list" aria-label="Заведения города">
      <div className="food-toolbar"><div className="search-field"><Search size={18} /><input type="search" aria-label="Поиск по названию, адресу или описанию" placeholder="Название, адрес или блюдо" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={18} /></button>}</div></div>
      <p className="result-count" role="status">{filtered.length === places.length ? 'Все места' : 'Найдено мест'}<span>{filtered.length < 10 ? `0${filtered.length}` : filtered.length}</span></p>
      {filtered.length ? <div className="places-grid">{filtered.map(place => <PlaceCard key={`${place.id}:${query.trim().toLocaleLowerCase('ru')}`} place={place} query={query} />)}</div> : <div className="empty-state"><Search size={32} /><h2>Пока ничего не нашлось</h2><p>Попробуйте другое название или адрес.</p><button type="button" className="button button-primary" onClick={reset}>Сбросить поиск</button></div>}
      <p className="food-source">Цены ориентировочные и могут меняться</p>
    </section>
  </>;
}
