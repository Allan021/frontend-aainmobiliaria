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
  background: active ? 'var(--pub-ink)' : 'transparent',
  border: `1px solid ${active ? 'var(--pub-ink)' : 'var(--pub-border2)'}`,
  color: active ? 'var(--pub-bg)' : 'var(--pub-muted2)',
  borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600,
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
  // Con 3+ fotos: principal + dos mosaicos a la derecha (solo desktop, ver CSS)
  const mosaic = shown.length >= 3;

  return (
    <div>
      {(categories.length > 0 || threeDLabel || onMapClick) && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
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

      <div className={`ficha-gallery fx-gallery${mosaic ? ' fx-gallery--mosaic' : ''}`}>
        <div
          className="fx-gallery__main"
          onClick={() => shown.length > 0 && onOpenLightbox(safeIdx, activeLabel)}
          style={{ cursor: shown.length > 0 ? 'zoom-in' : 'default' }}
        >
          {current ? (
            <img
              key={current.url}
              src={optimizeCloudinaryUrl(current.url, 1400)}
              srcSet={cloudinarySrcSet(current.url, 1400)}
              sizes="(max-width: 1024px) 100vw, 880px"
              alt={alt}
              fetchPriority={safeIdx === 0 ? 'high' : undefined}
            />
          ) : (
            <div style={{
              height: '100%', display: 'grid', placeItems: 'center',
              background: 'repeating-linear-gradient(45deg, var(--pub-border) 0 14px, var(--pub-bg) 14px 28px)',
              fontSize: 13, fontWeight: 600, color: 'var(--pub-dim)',
            }}>Foto pendiente</div>
          )}

          {badges}
          {favoriteButton}

          {shown.length > 1 && (
            <>
              <button className="fx-gbtn" style={{ left: 14 }} onClick={e => { e.stopPropagation(); goPrev(); }} aria-label="Foto anterior">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button className="fx-gbtn" style={{ right: 14 }} onClick={e => { e.stopPropagation(); goNext(); }} aria-label="Foto siguiente">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </>
          )}

          {shown.length > 0 && (
            <button onClick={e => { e.stopPropagation(); onOpenLightbox(safeIdx, activeLabel); }} style={{
              position: 'absolute', bottom: 14, left: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(17,17,19,0.78)', color: '#FAF8F3', fontSize: 13, fontWeight: 600,
              padding: '9px 15px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <IconCamera size={14} /> {safeIdx + 1} / {shown.length} · Ver todas
            </button>
          )}
        </div>

        {mosaic && [1, 2].map(off => {
          const i = (safeIdx + off) % shown.length;
          const resto = shown.length - 3;
          return (
            <button key={off} type="button" className="fx-gallery__tile"
              aria-label={`Abrir foto ${i + 1} de ${shown.length}`}
              onClick={() => onOpenLightbox(i, activeLabel)}>
              <img src={optimizeCloudinaryUrl(shown[i].url, 640)} alt="" loading="lazy" decoding="async" />
              {off === 2 && resto > 0 && <span className="fx-gallery__more">+{resto} fotos</span>}
            </button>
          );
        })}
      </div>

      {shown.length > 1 && (
        <div className={`fx-thumbs${mosaic ? ' fx-thumbs--mosaic' : ''}`}>
          {shown.map((img, i) => (
            <button key={img.url + i} onClick={() => setIdx(i)} aria-label={`Ver foto ${i + 1}`} style={{
              flexShrink: 0, width: 76, height: 58, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
              border: i === safeIdx ? '2px solid #D4B254' : '2px solid transparent',
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
