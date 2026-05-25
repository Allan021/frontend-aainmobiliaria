import { useState, useEffect, useRef } from 'react';
import { optimizeCloudinaryUrl } from '../../../../core/utils/cloudinaryUtils';

interface GalleryModalProps {
  images: { url: string; title?: string; description?: string }[];
  startIdx: number;
  onClose: () => void;
}

export function GalleryModal({ images, startIdx, onClose }: GalleryModalProps) {
  const [idx, setIdx] = useState(startIdx);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [idx]);

  const img = images[idx];
  if (!img) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#FAF8F3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        zIndex: 1010,
      }}>✕</button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: '#FAF8F3', fontSize: '0.875rem', fontWeight: 600, zIndex: 1010 }}>
        {idx + 1} / {images.length}
      </div>

      {/* Main viewer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 1100, padding: '0 1rem', flex: 1, justifyContent: 'center' }}>
        <button
          onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 22, flexShrink: 0 }}
          aria-label="Imagen anterior"
        >
          ‹
        </button>
        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={optimizeCloudinaryUrl(img.url, 1200)} alt={img.title || ''}
            style={{ maxHeight: '65vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
          />
          {(img.title || img.description) && (
            <div style={{ marginTop: '0.875rem', color: '#FAF8F3' }}>
              {img.title && <div style={{ fontSize: '1rem', fontWeight: 600 }}>{img.title}</div>}
              {img.description && <div style={{ fontSize: '0.875rem', color: '#9A9383', marginTop: 4 }}>{img.description}</div>}
            </div>
          )}
        </div>
        <button
          onClick={() => setIdx(i => (i + 1) % images.length)}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 22, flexShrink: 0 }}
          aria-label="Siguiente imagen"
        >
          ›
        </button>
      </div>

      {/* Thumbnail strip */}
      <div
        ref={thumbsRef}
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '0.75rem 1.5rem',
          width: '100%', maxWidth: 1100, scrollbarWidth: 'none',
          flexShrink: 0,
        }}
      >
        {images.map((thumb, i) => (
          <div
            key={i}
            data-active={i === idx ? 'true' : 'false'}
            onClick={() => setIdx(i)}
            style={{
              width: 64, height: 48, flexShrink: 0, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: i === idx ? '2px solid #D4B254' : '2px solid transparent',
              opacity: i === idx ? 1 : 0.5,
              transition: 'opacity 0.2s, border-color 0.2s',
            }}
          >
            <img src={optimizeCloudinaryUrl(thumb.url, 120)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
