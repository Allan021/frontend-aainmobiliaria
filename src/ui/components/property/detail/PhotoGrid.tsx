import type { CSSProperties } from 'react';

interface PhotoGridProps {
  images: { url: string; title?: string }[];
  onImageClick: (idx: number) => void;
}

const pillBtnStyle: CSSProperties = {
  position: 'absolute',
  bottom: 12,
  right: 12,
  background: 'rgba(17,17,19,0.75)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 999,
  padding: '0.4rem 0.875rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#FAF8F3',
  zIndex: 10,
};

export function PhotoGrid({ images, onImageClick }: PhotoGridProps) {
  const main = images[0];
  const rest = images.slice(1, 5);
  const total = images.length;

  if (!main) return null;

  if (images.length === 1) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', background: '#111113' }} className="photo-grid-wrap">
        <img
          src={main.url} alt={main.title || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => onImageClick(0)}
        />
        <button
          onClick={() => onImageClick(0)}
          style={pillBtnStyle}
        >
          1 / 1 foto
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--main-surface, #111113)' }} className="photo-grid-wrap">
      {/* Mobile: show only first image */}
      <div className="photo-mobile-only" style={{ position: 'relative', width: '100%', height: '55vw' }}>
        <img
          src={main.url} alt={main.title || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => onImageClick(0)}
        />
        <button onClick={() => onImageClick(0)} style={pillBtnStyle}>
          1 / {total} fotos
        </button>
      </div>

      {/* Desktop: Airbnb grid */}
      <div
        className="photo-desktop-only"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          height: '60vh',
        }}
      >
        {/* Main large — rounded left */}
        <div
          style={{
            overflow: 'hidden',
            borderRadius: '12px 0 0 12px',
            cursor: 'pointer',
          }}
          onClick={() => onImageClick(0)}
        >
          <img
            src={main.url} alt={main.title || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* Right 2×2 */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {[0, 1, 2, 3].map(i => {
            const img = rest[i];
            const isBottomRight = i === 3;
            if (!img) return <div key={i} style={{ background: 'var(--main-bg, #1A1A1D)', borderRadius: isBottomRight ? '0 0 12px 0' : 0 }} />;
            return (
              <div
                key={i}
                style={{
                  overflow: 'hidden',
                  borderRadius: isBottomRight ? '0 0 12px 0' : 0,
                  cursor: 'pointer',
                }}
                onClick={() => onImageClick(i + 1)}
              >
                <img
                  src={img.url} alt={img.title || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            );
          })}
        </div>

        {/* "Ver todas" pill */}
        <button
          onClick={() => onImageClick(0)}
          style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'var(--main-surface, rgba(255,255,255,0.95))',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--main-border, rgba(17,17,19,0.15))',
            borderRadius: 10,
            padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--main-text, #111113)',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            zIndex: 10,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Ver todas las {total} fotos
        </button>
      </div>
    </div>
  );
}
