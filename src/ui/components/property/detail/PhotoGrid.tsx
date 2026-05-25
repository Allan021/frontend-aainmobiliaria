import { useState, useRef, useEffect } from 'react';
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../../../../core/utils/cloudinaryUtils';

interface PhotoGridProps {
  images: { url: string; title?: string }[];
  onImageClick: (idx: number) => void;
}

/* ── Mobile Slider ──────────────────────────── */
function MobileSlider({ images, onImageClick }: PhotoGridProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const goTo = (idx: number) => {
    setCurrentSlide(idx);
    sliderRef.current?.scrollTo({ left: idx * sliderRef.current.offsetWidth, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const width = sliderRef.current.offsetWidth;
    const newIdx = Math.round(scrollLeft / width);
    if (newIdx !== currentSlide && newIdx >= 0 && newIdx < images.length) {
      setCurrentSlide(newIdx);
    }
  };

  return (
    <div className="photo-mobile-slider">
      <div
        ref={sliderRef}
        className="photo-mobile-slider__track"
        onScroll={handleScroll}
      >
        {images.map((img, i) => (
          <div key={i} className="photo-mobile-slider__slide" onClick={() => onImageClick(i)}>
            <img
              src={optimizeCloudinaryUrl(img.url, 768)}
              srcSet={cloudinarySrcSet(img.url, 768)}
              sizes="100vw"
              alt={img.title || ''}
              width={768}
              height={432}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* Counter badge */}
      <div className="photo-mobile-slider__counter">
        {currentSlide + 1} / {images.length}
      </div>

      {/* Dots */}
      {images.length > 1 && images.length <= 10 && (
        <div className="photo-mobile-slider__dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`photo-mobile-slider__dot ${i === currentSlide ? 'photo-mobile-slider__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Desktop Grid (Airbnb-style) ─────────────── */
function DesktopGrid({ images, onImageClick }: PhotoGridProps) {
  const main = images[0];
  const rest = images.slice(1, 5);
  const total = images.length;

  return (
    <div className="photo-desktop-grid">
      {/* Main large image — left half */}
      <div
        className="photo-desktop-grid__main"
        onClick={() => onImageClick(0)}
      >
        <img
          src={optimizeCloudinaryUrl(main.url, 800)}
          srcSet={cloudinarySrcSet(main.url, 800)}
          sizes="50vw"
          alt={main.title || ''}
          width={800}
          height={600}
          loading="eager"
          decoding="async"
          draggable={false}
        />
        <div className="photo-desktop-grid__overlay" />
      </div>

      {/* Right 2×2 grid */}
      <div className="photo-desktop-grid__side">
        {[0, 1, 2, 3].map(i => {
          const img = rest[i];
          const isTopRight = i === 1;
          const isBottomRight = i === 3;
          if (!img) return (
            <div
              key={i}
              className="photo-desktop-grid__cell"
              style={{
                background: 'var(--main-bg, #1A1A1D)',
                borderRadius: isTopRight ? '0 12px 0 0' : isBottomRight ? '0 0 12px 0' : 0,
              }}
            />
          );
          return (
            <div
              key={i}
              className="photo-desktop-grid__cell"
              onClick={() => onImageClick(i + 1)}
              style={{
                borderRadius: isTopRight ? '0 12px 0 0' : isBottomRight ? '0 0 12px 0' : 0,
              }}
            >
              <img
                src={optimizeCloudinaryUrl(img.url, 400)}
                srcSet={cloudinarySrcSet(img.url, 400)}
                sizes="25vw"
                alt={img.title || ''}
                width={400}
                height={300}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <div className="photo-desktop-grid__overlay" />
            </div>
          );
        })}
      </div>

      {/* "Ver todas" pill */}
      <button
        onClick={() => onImageClick(0)}
        className="photo-desktop-grid__view-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Ver las {total} fotos
      </button>
    </div>
  );
}

/* ── PhotoGrid Export ────────────────────────── */
export function PhotoGrid({ images, onImageClick }: PhotoGridProps) {
  if (!images.length) return null;

  return (
    <div className="photo-grid-wrap">
      {/* Mobile: slider */}
      <div className="photo-mobile-only">
        <MobileSlider images={images} onImageClick={onImageClick} />
      </div>
      {/* Desktop: Airbnb grid */}
      <div className="photo-desktop-only">
        <DesktopGrid images={images} onImageClick={onImageClick} />
      </div>
    </div>
  );
}
