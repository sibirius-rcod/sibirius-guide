import star from '../assets/images/pattern-star.webp';
import arcs from '../assets/images/pattern-arcs.webp';
import flower from '../assets/images/pattern-flower.webp';
import checker from '../assets/images/pattern-checker.webp';

export default function Pattern({ small = false }: { small?: boolean }) {
  return <div className={`brand-pattern${small ? ' small' : ''}`} aria-hidden="true">
    {[star, arcs, flower, checker].map((src) => <img key={src} src={src} alt="" width="250" height="250" />)}
  </div>;
}
