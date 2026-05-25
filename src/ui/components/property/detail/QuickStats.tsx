import type { Property } from '../../../../core/domain/entities/types';

interface QuickStatsProps {
  property: Property;
}

export function QuickStats({ property }: QuickStatsProps) {
  const items = [];

  items.push({
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    label: 'Área',
    value: `${property.area_varas} varas²`,
  });

  if (property.dimensions) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
          <path d="M21 3H3v18M21 3l-6 6M21 3l-6 6m0 0H9m6 0v6" />
        </svg>
      ),
      label: 'Dimensiones',
      value: property.dimensions,
    });
  }

  items.push({
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: 'Tipo',
    value: property.type,
  });

  items.push({
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    label: 'Pago',
    value: property.financing ? 'Financiamiento' : 'Solo contado',
  });

  return (
    <div style={{ borderBottom: '1px solid var(--main-border, #E6E0D2)', background: 'var(--main-card-bg, #fff)' }} className="quick-stats-strip">
      <div
        style={{
          maxWidth: 1280, margin: '0 auto', padding: '0.875rem 1.5rem',
          display: 'flex', gap: '2rem', alignItems: 'center',
          overflowX: 'auto', whiteSpace: 'nowrap',
        }}
      >
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
            {i > 0 && <div style={{ width: 1, height: 32, background: 'var(--main-border, #E6E0D2)', flexShrink: 0 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--main-text-dim, #9A9383)', lineHeight: 1.2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--main-text, #111113)', lineHeight: 1.3 }}>
                  {item.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
