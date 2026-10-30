import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Home, Utensils, BedDouble, MapPin, ArrowUpRight, ArrowRight, Gift } from 'lucide-react';
import HomePage from './pages/HomePage';
import { createFocusVisibilityHandlers } from './components/focusVisibility';
import FoodPage from './pages/FoodPage';
import HotelsPage from './pages/HotelsPage';
import Modal from './components/Modal';
import SouvenirsPage from './pages/SouvenirsPage';
import logo from './assets/images/sibirius-logo.webp';

const navigation = [
  { hash: '#home', title: 'Главная', icon: Home },
  { hash: '#food', title: 'Где поесть', icon: Utensils },
  { hash: '#hotels', title: 'Проживание', icon: BedDouble },
  { hash: '#venue', title: 'Места проведения', icon: MapPin },
];
function currentHash() { return window.location.hash === '#transport' ? '#venue' : window.location.hash || '#home'; }

export default function App() {
  const focusVisibility = useMemo(createFocusVisibilityHandlers, []);
  const [route, setRoute] = useState(() => ({ hash: currentHash() }));
  const page = route.hash === '#food' ? 'food' : route.hash === '#hotels' ? 'hotels' : route.hash === '#souvenirs' ? 'souvenirs' : 'home';
  const [atVenue, setAtVenue] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const initial = useRef(true);
  useEffect(() => {
    const update = () => { setRoute({ hash: currentHash() }); setModal(null); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (window.location.hash === '#transport') window.history.replaceState(null, '', '#venue');
    document.title = page === 'souvenirs' ? 'Сувениры — Сибириус' : page === 'hotels' ? 'Проживание — Сибириус' : page === 'food' ? 'Где поесть — Сибириус' : 'Сибириус — путеводитель участника';
    const focus = !initial.current;
    initial.current = false;
    const frame = requestAnimationFrame(() => {
      if (route.hash === '#venue') {
        document.getElementById('venue')?.scrollIntoView({ behavior: 'instant' });
        if (focus) document.getElementById('venue-title')?.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (focus) document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [route, page]);
  useEffect(() => {
    setAtVenue(false);
    const venue = document.getElementById('venue');
    if (!venue || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setAtVenue(entry.isIntersecting), { rootMargin: '-15% 0px -30% 0px' });
    observer.observe(venue);
    return () => observer.disconnect();
  }, [page]);
  const activeHash = page === 'home' ? atVenue ? '#venue' : '#home' : `#${page}`;
  const navigate = (hash: string) => {
    const next = hash === '#transport' ? '#venue' : hash;
    if (window.location.hash !== next) window.history.pushState(null, '', next);
    setRoute({ hash: next });
    setModal(null);
  };
  return <div {...focusVisibility} onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = (event.target as Element).closest('a[href^="#"]')?.getAttribute('href');
    if (hash && ['#home', '#food', '#hotels', '#venue', '#transport', '#souvenirs'].includes(hash)) { event.preventDefault(); navigate(hash); }
  }}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); document.getElementById('main-content')?.scrollIntoView(); }}>Перейти к содержимому</a>
    <header className="site-header container"><a className="logo-link" href="#home" aria-label="Сибириус — на главную"><img src={logo} width="234" height="71" alt="Мастерская талантов Сибириус" /></a><nav className="desktop-nav" aria-label="Основная навигация">{navigation.map(item => <a key={item.hash} href={item.hash} aria-current={activeHash === item.hash ? 'page' : undefined}>{item.title}</a>)}</nav><button type="button" className="header-menu" aria-label="Открыть меню" aria-haspopup="dialog" onClick={() => setModal('menu')}><Menu size={22} /><span>Меню</span></button></header>
    <main id="main-content" className="container" tabIndex={-1}>{page === 'souvenirs' ? <SouvenirsPage /> : page === 'hotels' ? <HotelsPage /> : page === 'food' ? <FoodPage /> : <HomePage />}</main>
    <footer className="site-footer container"><div className="footer-top"><div><span className="footer-brand">С вами в новом городе.</span><p>Мастерская талантов «Сибириус»</p></div><a href="#home">На главную<ArrowUpRight size={17} /></a></div><div className="footer-bottom"><span>Ханты-Мансийск</span><span>Сибириус · 2026</span></div></footer>
    <nav className="mobile-nav" aria-label="Навигация на мобильном устройстве">{navigation.map(({ hash, title, icon: Icon }) => <a key={hash} href={hash} aria-current={activeHash === hash ? 'page' : undefined}><Icon size={22} />{title}</a>)}<button type="button" onClick={() => setModal('menu')} aria-haspopup="dialog"><Menu size={22} />Меню</button></nav>
    {modal === 'menu' && <Modal title="Ваш путеводитель" onClose={() => setModal(null)}><nav className="menu-links" aria-label="Разделы путеводителя">{navigation.map(({ hash, title, icon: Icon }) => <a key={hash} href={hash}><Icon size={22} /><span>{title}</span><ArrowRight size={19} /></a>)}<a href="#souvenirs" aria-current={page === 'souvenirs' ? 'page' : undefined}><Gift size={22} /><span>Сувениры</span><ArrowRight size={19} /></a></nav><p className="menu-note">Всё нужное для знакомства с Ханты-Мансийском.</p></Modal>}
  </div>;
}
