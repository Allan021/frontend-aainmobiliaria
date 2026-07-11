import { WhatsAppIcon } from '../shared/Icon';

interface FooterProps {
  onWhatsApp?: () => void;
}

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

const linkStyle: React.CSSProperties = { color: '#B9B9C0', textDecoration: 'none', transition: 'color 0.15s' };

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={linkStyle}
      onMouseEnter={e => { e.currentTarget.style.color = '#D4B254'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#B9B9C0'; }}
    >{children}</a>
  );
}

export function Footer({ onWhatsApp }: FooterProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onWhatsApp) onWhatsApp();
    else window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
  };

  return (
    <footer style={{ background: '#0A0A0B', color: '#B9B9C0', padding: '64px 24px 32px', fontFamily: F_SANS }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40,
          paddingBottom: 44, borderBottom: '1px solid #232327',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, background: '#0A0A0B', border: '1px solid #232327', borderRadius: 8,
                display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0,
              }}>
                <img src="/logo-mark.webp" alt="A&A Inmobiliaria" width={40} height={40}
                  style={{ width: 40, height: 40, objectFit: 'cover', mixBlendMode: 'screen' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15, color: '#FAF8F3' }}>A&A Inmobiliaria</span>
                <span style={{ fontSize: 9, letterSpacing: '0.18em', color: '#D4B254', fontWeight: 600 }}>TU PROPIEDAD · NUESTRA MISIÓN</span>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, maxWidth: 300 }}>
              Le acompañamos en la búsqueda, revisión legal y firma de escritura de su nueva propiedad. El Progreso, Yoro, Honduras.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.16em', color: '#6E6E78', marginBottom: 16 }}>PROPIEDADES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <FooterLink href="/buscar">Buscar en el mapa</FooterLink>
              <FooterLink href="/buscar">Casas</FooterLink>
              <FooterLink href="/propiedades">Terrenos y lotes</FooterLink>
              <FooterLink href="/lotificaciones">Lotificaciones</FooterLink>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.16em', color: '#6E6E78', marginBottom: 16 }}>A&A</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <FooterLink href="/publicar">Publicar gratis</FooterLink>
              <FooterLink href="/nosotros">Asesoría legal</FooterLink>
              <FooterLink href="/nosotros">Financiamiento</FooterLink>
              <FooterLink href="/nosotros">Nosotros</FooterLink>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.16em', color: '#6E6E78', marginBottom: 16 }}>CONTACTO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <a href="#" onClick={handleWhatsApp} style={{ color: '#25D366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                <WhatsAppIcon size={14} color="#25D366" /> WhatsApp
              </a>
              <span>El Progreso, Yoro</span>
              <span>Lun–Sáb · 8:00 AM – 5:00 PM</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, fontSize: 13, color: '#6E6E78', flexWrap: 'wrap', gap: 12,
        }}>
          <span>© 2026 A&A Inmobiliaria · El Progreso, Yoro, Honduras</span>
          <span>Escrituración verificada en el Instituto de la Propiedad</span>
        </div>
      </div>
    </footer>
  );
}
