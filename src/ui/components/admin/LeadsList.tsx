import { WhatsAppIcon } from '../shared/Icon';
import type { Lead } from '../../../core/domain/entities/types';

const leadColors: Record<string, { bg: string; text: string }> = {
  'pendiente':       { bg: 'rgba(184,134,46,0.12)', text: '#B8862E' },
  'en-conversacion': { bg: 'rgba(74,100,168,0.12)', text: '#5B7AE0' },
  'agendado':        { bg: 'rgba(74,124,89,0.12)',  text: '#4A7C59' },
  'cerrado':         { bg: 'rgba(74,124,89,0.15)',  text: '#4A7C59' },
  'no-prospera':     { bg: 'rgba(140,58,46,0.12)',  text: '#8C3A2E' },
};

const leadLabels: Record<string, string> = {
  'pendiente': 'Pendiente',
  'en-conversacion': 'En conversación',
  'agendado': 'Visita agendada',
  'cerrado': 'Cerrado',
  'no-prospera': 'No prospera',
};

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

interface Props {
  leads: Lead[];
  m?: M;
}

export function LeadsList({ leads, m }: Props) {
  const border = `1px solid ${m?.mainBorder || '#E6E0D2'}`;

  if (leads.length === 0) {
    return (
      <div style={{
        background: m?.mainCardBg || '#FFFFFF', borderRadius: '0.875rem',
        border, padding: '3rem', textAlign: 'center',
        color: m?.mainTextDim || '#9A9383', fontSize: '0.875rem',
        transition: 'background 0.3s ease',
      }}>
        Sin leads registrados aún
      </div>
    );
  }

  return (
    <div style={{
      background: m?.mainCardBg || '#FFFFFF', borderRadius: '0.875rem',
      border, overflow: 'hidden',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: '700px' }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 140px 140px 48px',
            gap: '1rem', padding: '0.75rem 1.25rem',
            borderBottom: border,
            fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#D4B254',
          }}>
            <div>Contacto</div>
            <div>Propiedad</div>
            <div>Fecha</div>
            <div>Estado</div>
            <div></div>
          </div>

          {leads.map((l, i) => {
            const sc = leadColors[l.status] || { bg: 'rgba(90,90,99,0.1)', text: '#5A5A63' };
            const isLast = i === leads.length - 1;
            const initials = l.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('');
            const waNumber = l.phone ? `504${l.phone.replace(/\D/g, '')}` : null;

            return (
              <div key={l.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 140px 140px 48px',
                gap: '1rem', padding: '0.875rem 1.25rem',
                alignItems: 'center',
                borderBottom: isLast ? 'none' : border,
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,178,84,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Contact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <div style={{
                    width: '2.25rem', height: '2.25rem', borderRadius: 999, flexShrink: 0,
                    background: l.status === 'pendiente' ? 'rgba(184,134,46,0.15)' : 'rgba(90,90,99,0.1)',
                    color: l.status === 'pendiente' ? '#B8862E' : (m?.mainTextMuted || '#5A5A63'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.6875rem',
                  }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem', fontWeight: 600,
                      color: m?.mainText || '#111113',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{l.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: m?.mainTextDim || '#9A9383', marginTop: '1px' }}>
                      {l.email}
                    </div>
                  </div>
                </div>

                {/* Property */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8125rem', color: m?.mainText || '#111113',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{l.property_title || '—'}</div>
                  {l.phone && (
                    <div style={{ fontSize: '0.6875rem', color: m?.mainTextDim || '#9A9383', marginTop: '1px' }}>
                      {l.phone}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div style={{ fontSize: '0.75rem', color: m?.mainTextMuted || '#5A5A63', whiteSpace: 'nowrap' }}>
                  {new Date(l.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 10px', borderRadius: '999px',
                    fontSize: '0.6875rem', fontWeight: 600,
                    background: sc.bg, color: sc.text, whiteSpace: 'nowrap',
                  }}>
                    {leadLabels[l.status] || l.status}
                  </span>
                </div>

                {/* WhatsApp action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {waNumber ? (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank" rel="noopener"
                      title={`WhatsApp ${l.phone}`}
                      style={{
                        width: '2rem', height: '2rem', borderRadius: '0.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(37,211,102,0.1)', color: '#25D366',
                        transition: 'background 0.15s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.2)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.1)')}
                    >
                      <WhatsAppIcon size={16} />
                    </a>
                  ) : (
                    <div style={{ width: '2rem' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
