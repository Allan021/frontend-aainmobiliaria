import { useState } from 'react';
import { useHondurasData } from '../../hooks/useHondurasData';
import { SelectField } from '../shared/SelectField';

interface FilterBarProps {
  filters: { dep?: string; pay?: string; type?: string };
  setFilters: (f: { dep?: string; pay?: string; type?: string }) => void;
}

const TYPE_FILTERS = [
  {
    key: 'all', label: 'Todas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'terreno', label: 'Terrenos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 17l4-8 4 4 4-6 6 10H3z" />
      </svg>
    ),
  },
  {
    key: 'lote', label: 'Lotes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 9h20M12 9v12" />
      </svg>
    ),
  },
  {
    key: 'casa', label: 'Casas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'financing', label: 'Financiamiento',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    key: 'lotificadora', label: 'Lotificaciones',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 10H3M21 6H3M21 14H3M21 18H3" />
      </svg>
    ),
  },
];

function CategoryChip({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '0.75rem 1rem', minWidth: 80,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: active ? '#111113' : '#9A9383',
        position: 'relative',
        transition: 'color 0.2s',
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#111113'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#9A9383'; }}
    >
      <div style={{ transition: 'transform 0.15s' }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.6875rem', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {/* Active underline */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: `translateX(-50%) scaleX(${active ? 1 : 0})`,
        width: 32, height: 2, background: '#111113', borderRadius: 1,
        transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1)',
        transformOrigin: 'center',
      }} />
    </button>
  );
}


export function FilterBar({ filters, setFilters }: FilterBarProps) {
  const { departamentos } = useHondurasData();
  const [activeType, setActiveType] = useState<string>(() => {
    if (filters.pay === 'financing') return 'financing';
    return filters.type || 'all';
  });

  const handleType = (key: string) => {
    setActiveType(key);
    if (key === 'all') {
      setFilters({ ...filters, pay: undefined, type: undefined });
    } else if (key === 'financing') {
      setFilters({ ...filters, pay: 'financing', type: undefined });
    } else {
      setFilters({ ...filters, pay: undefined, type: key });
    }
  };

  const depOptions = [
    { value: '', label: 'Todos los departamentos' },
    ...departamentos.map(d => ({ value: String(d.id), label: d.nombre })),
  ];

  const hasActiveFilters = filters.dep || filters.pay || filters.type;

  return (
    <div>
      {/* Category chips */}
      <div style={{
        borderBottom: '1px solid #E6E0D2',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {TYPE_FILTERS.map(f => (
            <CategoryChip
              key={f.key}
              icon={f.icon}
              label={f.label}
              active={activeType === f.key}
              onClick={() => handleType(f.key)}
            />
          ))}
        </div>
      </div>

      {/* Department filter — SelectField dropdown */}
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          minWidth: 220, padding: '0.5rem 0.875rem',
          borderRadius: 10, border: `1.5px solid ${filters.dep ? '#111113' : '#E6E0D2'}`,
          background: '#fff', transition: 'border-color 0.15s',
        }}>
          <SelectField
            options={depOptions}
            value={filters.dep || ''}
            onChange={v => setFilters({ ...filters, dep: v || undefined })}
            placeholder="Todos los departamentos"
            theme="light"
            fontSize="0.8125rem"
            fontWeight={filters.dep ? 600 : 500}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => { setFilters({}); setActiveType('all'); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600, color: '#D4B254',
              textDecoration: 'underline', textUnderlineOffset: 3,
              fontFamily: 'inherit', padding: '0.25rem 0',
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
