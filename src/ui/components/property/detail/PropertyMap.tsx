const DEPT_COORDS: Record<string, { lat: number; lng: number }> = {
  'Yoro':                { lat: 15.3992, lng: -87.8028 },
  'Cortés':              { lat: 15.4997, lng: -88.0249 },
  'Cortes':              { lat: 15.4997, lng: -88.0249 },
  'Francisco Morazán':   { lat: 14.0818, lng: -87.2068 },
  'Francisco Morazan':   { lat: 14.0818, lng: -87.2068 },
  'Atlántida':           { lat: 15.7636, lng: -86.7844 },
  'Atlantida':           { lat: 15.7636, lng: -86.7844 },
  'Comayagua':           { lat: 14.4516, lng: -87.6222 },
  'Choluteca':           { lat: 13.3005, lng: -87.1934 },
  'El Paraíso':          { lat: 13.8592, lng: -86.5944 },
  'Olancho':             { lat: 14.8000, lng: -86.1000 },
  'Santa Bárbara':       { lat: 14.9186, lng: -88.2301 },
  'Colón':               { lat: 15.9000, lng: -85.5000 },
};

function getMapUrl(departamento: string): string {
  const coords = DEPT_COORDS[departamento] || { lat: 15.3992, lng: -87.8028 };
  const { lat, lng } = coords;
  const margin = 0.05;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - margin}%2C${lat - margin}%2C${lng + margin}%2C${lat + margin}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function parseMapUrl(input: string, departamento: string): { src: string; externalLink?: string } {
  if (!input) {
    return { src: getMapUrl(departamento) };
  }

  const trimmed = input.trim();

  // 1. If it's an iframe code, extract the src attribute
  if (trimmed.startsWith('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return { src: srcMatch[1] };
    }
  }

  // 2. If it's an embeddable Google Maps or OpenStreetMap URL, return it directly
  if (
    trimmed.includes('/embed') ||
    trimmed.includes('/export') ||
    trimmed.includes('openstreetmap.org/export/embed')
  ) {
    return { src: trimmed };
  }

  // 3. Otherwise, it's a standard link (Google Maps short link, directions link, etc.)
  // We fall back to showing OpenStreetMap but provide the external link as a button overlay
  return {
    src: getMapUrl(departamento),
    externalLink: trimmed
  };
}

interface PropertyMapProps {
  departamento: string;
  municipio: string;
  mapUrl?: string;
}

export function PropertyMap({ departamento, municipio, mapUrl = '' }: PropertyMapProps) {
  const { src, externalLink } = parseMapUrl(mapUrl, departamento);

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--main-border, #E6E0D2)', position: 'relative' }}>
      <iframe
        src={src}
        width="100%"
        height="400"
        style={{ border: 'none', display: 'block' }}
        loading="lazy"
        title={`Ubicación: ${municipio}, ${departamento}`}
        sandbox="allow-scripts allow-same-origin"
      />
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(17,17,19,0.85)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '0.5rem 0.75rem',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FAF8F3' }}>
          {municipio}, {departamento}
        </span>
      </div>

      {externalLink && (
        <a
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: '#D4B254', color: '#111113',
            borderRadius: 10, padding: '0.625rem 1rem',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FAF8F3'; e.currentTarget.style.color = '#111113'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#D4B254'; e.currentTarget.style.color = '#111113'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Abrir en Google Maps
        </a>
      )}
    </div>
  );
}
