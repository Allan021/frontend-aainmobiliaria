import { useEffect, useState, type ReactNode } from 'react';
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../../../../core/utils/cloudinaryUtils';
import { IconCamera } from '../../shared/rs-icons';

interface GalleryImage {
  url: string;
  label?: string;
}

interface Category {
  label: string;
  count: number;
}

interface Props {
  images: GalleryImage[];
  alt: string;
  badges?: ReactNode;
  favoriteButton?: ReactNode;
  categories: Category[];
  activeLabel: string | null;
  onSelectCategory: (label: string | null) => void;
  onOpenLightbox: (idx: number, label: string | null) => void;
  threeDLabel?: string;
  onThreeDClick?: () => void;
  onMapClick?: () => void;
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
  background: active ? '#1F5B42' : 'var(--pub-surface)',
  border: `1px solid ${active ? '#1F5B42' : 'var(--pub-border)'}`,
  color: active ? '#FFFFFF' : 'var(--pub-muted2)',
  borderRadius: 10, padding: '8px 15px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
});

export function PropertyGallery({
  images, alt, badges, favoriteButton, categories, activeLabel, onSelectCategory,
  onOpenLightbox, threeDLabel, onThreeDClick, onMapClick,
}: Props) {
  const [idx, setIdx] = useState(0);
  const shown = activeLabel ? images.filter(i => i.label === activeLabel) : images;

  useEffect(() => { setIdx(0); }, [activeLabel]);

  const safeIdx = Math.min(idx, Math.max(0, shown.length - 1));
  const current = shown[safeIdx];
  const goPrev = () => setIdx(i => (i - 1 + shown.length) % shown.length);
  const goNext = () => setIdx(i => (i + 1) % shown.length);

  return (
    <div>
      {(categories.length > 0 || threeDLabel || onMapClick) && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
          <button onClick={() => onSelectCategory(null)} style={tabStyle(activeLabel === null)}>
            Todas <span style={{ opacity: 0.7 }}>({images.length})</span>
          </button>
          {categories.map(c => (
            <button key={c.label} onClick={() => onSelectCategory(c.label)} style={tabStyle(activeLabel === c.label)}>
              {c.label} <span style={{ opacity: 0.7 }}>({c.count})</span>
            </button>
          ))}
          {threeDLabel && onThreeDClick && (
            <button onClick={onThreeDClick} style={tabStyle(false)}>{threeDLabel}</button>
          )}
          {onMapClick && (
            <button onClick={onMapClick} style={tabStyle(false)}>Ubicación</button>
          )}
        </div>
      )}

      <div
        className="ficha-gallery"
        onClick={() => shown.length > 0 && onOpenLightbox(safeIdx, activeLabel)}
        style={{
          position: 'relative', borderRadius: 18, overflow: 'hidden', height: 440,
          background: 'var(--pub-border)', cursor: shown.length > 0 ? 'zoom-in' : 'default',
        }}
      >
        {current ? (
          <img
            key={current.url}
            src={optimizeCloudinaryUrl(current.url, 1400)}
            srcSet={cloudinarySrcSet(current.url, 1400)}
            sizes="(max-width: 768px) 100vw, 1280px"
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            height: '100%', display: 'grid', placeItems: 'center',
            background: 'repeating-linear-gradient(45deg, var(--pub-border) 0 14px, var(--pub-bg) 14px 28px)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--pub-dim)',
          }}>FOTO PENDIENTE</div>
        )}

        {badges}
        {favoriteButton}

        {shown.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); goPrev(); }} aria-label="Foto anterior" style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(17,17,19,0.55)', color: '#FAF8F3', display: 'grid', placeItems: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); goNext(); }} aria-label="Foto siguiente" style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(17,17,19,0.55)', color: '#FAF8F3', display: 'grid', placeItems: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}

        {shown.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: 'rgba(17,17,19,0.7)', color: '#FAF8F3', fontSize: 12.5, fontWeight: 600,
            padding: '6px 12px', borderRadius: 999,
          }}>{safeIdx + 1} / {shown.length}</div>
        )}

        {shown.length > 0 && (
          <button onClick={e => { e.stopPropagation(); onOpenLightbox(safeIdx, activeLabel); }} style={{
            position: 'absolute', bottom: 14, right: 14,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(17,17,19,0.8)', color: '#FAF8F3', fontSize: '12.5px', fontWeight: 600,
            padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <IconCamera size={13} /> Ver todas las fotos
          </button>
        )}
      </div>

      {shown.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
          {shown.map((img, i) => (
            <button key={img.url + i} onClick={() => setIdx(i)} style={{
              flexShrink: 0, width: 76, height: 58, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
              border: i === safeIdx ? '2px solid #1F5B42' : '2px solid transparent',
            }}>
              <img src={optimizeCloudinaryUrl(img.url, 160)} alt="" loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
