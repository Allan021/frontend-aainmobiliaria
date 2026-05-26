import type { Property } from '../../../../core/domain/entities/types';

interface QuickStatsProps {
  property: Property;
}

export function QuickStats({ property }: QuickStatsProps) {
  const items = [];

  items.push({
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    label: 'Área',
    value: [
      property.area_varas ? `${property.area_varas} v²` : '',
      property.area_m2 ? `${property.area_m2} m²` : ''
    ].filter(Boolean).join(' · ') || 'N/A',
  });

  if (property.dimensions) {
    items.push({
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
          <path d="M21 3H3v18M21 3l-6 6M21 3l-6 6m0 0H9m6 0v6" />
        </svg>
      ),
      label: 'Dimensiones',
      value: property.dimensions,
    });
  }

  items.push({
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: 'Tipo',
    value: property.type,
  });

  if (property.municipio) {
    items.push({
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: 'Ubicación',
      value: `${property.municipio}, ${property.departamento}`,
    });
  }

  return (
    <div className="quick-stats-bar">
      <div className="quick-stats-bar__inner">
        {items.map((item, i) => (
          <div key={i} className="quick-stats-bar__item">
            <div className="quick-stats-bar__icon">{item.icon}</div>
            <div>
              <div className="quick-stats-bar__label">{item.label}</div>
              <div className="quick-stats-bar__value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
