import { useState, useEffect, useRef, useCallback } from 'react';
import { optimizeCloudinaryUrl } from '../../../../core/utils/cloudinaryUtils';

interface GalleryModalProps {
  images: { url: string; title?: string; description?: string }[];
  startIdx: number;
  onClose: () => void;
}

export function GalleryModal({ images, startIdx, onClose }: GalleryModalProps) {
  const [idx, setIdx] = useState(startIdx);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);

  const goTo = useCallback((newIdx: number) => {
    setZoomed(false);
    setImgLoaded(false);
    setIdx(newIdx);
  }, []);

  const goPrev = useCallback(() => goTo((idx - 1 + images.length) % images.length), [idx, images.length, goTo]);
  const goNext = useCallback(() => goTo((idx + 1) % images.length), [idx, images.length, goTo]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [goNext, goPrev, onClose]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [idx]);

  // Mouse move for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 20) isSwiping.current = true;
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    if (touchDeltaX.current < -50) goNext();
    else if (touchDeltaX.current > 50) goPrev();
    isSwiping.current = false;
  };

  const img = images[idx];
  if (!img) return null;

  return (
    <div
      className="gallery-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className="gallery-modal-topbar">
        <div className="gallery-modal-counter">
          <span style={{ fontWeight: 700 }}>{idx + 1}</span>
          <span style={{ opacity: 0.5 }}> / {images.length}</span>
        </div>
        <button
          onClick={onClose}
          className="gallery-modal-close"
          aria-label="Cerrar galería"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Main viewer area */}
      <div
        className="gallery-modal-viewer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev button */}
        <button
          onClick={goPrev}
          className="gallery-modal-nav gallery-modal-nav--prev"
          aria-label="Imagen anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Image container with zoom */}
        <div
          ref={imgContainerRef}
          className={`gallery-modal-img-container ${zoomed ? 'gallery-modal-img-container--zoomed' : ''}`}
          onClick={() => setZoomed(z => !z)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { if (zoomed) setZoomed(false); }}
          style={{
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
          }}
        >
          <img
            key={img.url}
            src={optimizeCloudinaryUrl(img.url, 1600)}
            alt={img.title || ''}
            className={`gallery-modal-img ${imgLoaded ? 'gallery-modal-img--loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
            style={zoomed ? {
              transform: 'scale(2.5)',
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            } : undefined}
          />

          {/* Zoom hint */}
          {!zoomed && imgLoaded && (
            <div className="gallery-modal-zoom-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Click para zoom
            </div>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          className="gallery-modal-nav gallery-modal-nav--next"
          aria-label="Siguiente imagen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Caption */}
      {(img.title || img.description) && (
        <div className="gallery-modal-caption">
          {img.title && <div style={{ fontWeight: 600 }}>{img.title}</div>}
          {img.description && <div style={{ fontSize: '0.8125rem', opacity: 0.6, marginTop: 2 }}>{img.description}</div>}
        </div>
      )}

      {/* Thumbnail strip */}
      <div ref={thumbsRef} className="gallery-modal-thumbs">
        {images.map((thumb, i) => (
          <button
            key={i}
            data-active={i === idx ? 'true' : 'false'}
            onClick={() => goTo(i)}
            aria-label={`Ver imagen de la galería número ${i + 1}`}
            className={`gallery-modal-thumb ${i === idx ? 'gallery-modal-thumb--active' : ''}`}
          >
            <img
              src={optimizeCloudinaryUrl(thumb.url, 160)}
              alt={`Miniatura de imagen número ${i + 1}`}
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
