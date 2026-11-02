import { useState } from 'react';

export interface CardPhoto {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  position?: string;
}

export default function CardPhotos({ photos, name, position = 'center' }: { photos: readonly CardPhoto[]; name: string; position?: string }) {
  const [index, setIndex] = useState(0);
  const photo = photos[index];
  if (!photo) return null;

  return <div className="place-photo card-photos" role="group" aria-label={`Фотографии: ${name}`}>
    <img src={photo.src} alt={photo.alt} width={photo.width ?? 960} height={photo.height ?? 640}
      style={{ objectPosition: photo.position ?? position }} loading="lazy" decoding="async" />
    {photos.length > 1 && <>
      <div className="photo-controls" aria-label="Выбор фотографии">
        {photos.map((item, number) => <button key={item.src} type="button"
          aria-label={`Фото ${number + 1} из ${photos.length}: ${name}`} aria-pressed={number === index}
          onClick={() => setIndex(number)}>{number + 1}</button>)}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">Фото {index + 1} из {photos.length}: {photo.alt}</span>
    </>}
  </div>;
}
