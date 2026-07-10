import { useEffect, useState } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { WhatsAppIcon } from '../shared/Icon';
import { IconHeart } from '../shared/rs-icons';

interface HeaderProps {
  currentRoute: string;
  onNavigate?: (route: string) => void;
  onWhatsApp?: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const NAV_ITEMS = [
  { to: 'home', label: 'Inicio', url: '/' },
  { to: 'buscar', label: 'Buscar', url: '/buscar' },
  { to: 'catalog', label: 'Propiedades', url: '/propiedades' },
  { to: 'lotificaciones', label: 'Lotificaciones', url: '/lotificaciones' },
  { to: 'about', label: 'Nosotros', url: '/nosotros' },
];

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";

export function Header({ currentRoute, onNavigate, onWhatsApp }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logged, setLogged] = useState(false);
  const [currency, toggleCurrency] = useCurrency();

  useEffect(() => {
    setLogged(!!localStorage.getItem('aa_token'));
    // Sitio público siempre claro — dark mode solo existe en el admin
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('aa_pub_theme');
  }, []);

  const navigate = (to: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(to);
    }
    setMenuOpen(false);
  };

  const handleWhatsApp = () => {
    if (onWhatsApp) onWhatsApp();
    else window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
  };

  const chipOn: React.CSSProperties = {
    fontWeight: 700, fontSize: '12.5px', padding: '4px 11px', borderRadius: 999,
    lineHeight: 1, background: '#D4B254', color: '#111113',
  };
  const chipOff: React.CSSProperties = {
    fontWeight: 700, fontSize: '12.5px', padding: '4px 11px', borderRadius: 999,
    lineHeight: 1, background: 'transparent', color: '#6E6E78',
  };

  return (
    <>
      <header style={{
        background: '#111113', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid #2A2A30', fontFamily: F_SANS,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 16px', minHeight: 64,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Brand */}
          <a href="/" onClick={e => navigate('home', e)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, background: '#D4B254', color: '#111113', borderRadius: 8,
              display: 'grid', placeItems: 'center',
              fontFamily: F_ARCHIVO, fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em',
            }}>A&A</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 16, color: '#FAF8F3' }}>A&A Inmobiliaria</span>
              <span style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#D4B254', fontWeight: 600 }}>TU PROPIEDAD · NUESTRA MISIÓN</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="header-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {NAV_ITEMS.map(item => {
              const active = currentRoute === item.to;
              return (
                <a key={item.to} href={item.url} onClick={e => navigate(item.to, e)}
                  style={{
                    color: active ? '#FAF8F3' : '#B9B9C0',
                    fontSize: '13.5px', fontWeight: active ? 600 : 500,
                    padding: '7px 10px', borderRadius: 8, whiteSpace: 'nowrap',
                    background: active ? '#232327' : 'transparent',
                    textDecoration: 'none', transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#FAF8F3'; e.currentTarget.style.background = '#1C1C1F'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#B9B9C0'; e.currentTarget.style.background = 'transparent'; } }}
                >{item.label}</a>
              );
            })}
            <a href="/publicar" onClick={e => navigate('publicar', e)}
              style={{
                color: '#D4B254', fontSize: '13.5px', fontWeight: 600,
                padding: '7px 10px', borderRadius: 8, border: '1px solid #5E4A11',
                whiteSpace: 'nowrap', textDecoration: 'none', transition: 'background 0.15s',
                marginLeft: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1C1C1F'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >Publicar gratis</a>
          </nav>

          {/* Desktop CTAs */}
          <div className="header-ctas-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button onClick={toggleCurrency} aria-label="Cambiar moneda"
              style={{
                display: 'flex', alignItems: 'center', background: '#1C1C1F',
                border: '1px solid #38383F', borderRadius: 999, padding: 3,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <span style={currency === 'L' ? chipOn : chipOff}>L</span>
              <span style={currency === 'USD' ? chipOn : chipOff}>$</span>
            </button>

            <a href={logged ? '/favoritos' : '/acceder'} title="Favoritos" aria-label="Favoritos"
              style={{ color: '#B9B9C0', display: 'flex', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4B254'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#B9B9C0'; }}
            ><IconHeart size={18} /></a>

            <a href={logged ? '/mis-propiedades' : '/acceder'}
              style={{
                color: '#B9B9C0', fontSize: 13.5, fontWeight: 500, textDecoration: 'none',
                padding: '7px 10px', borderRadius: 8, whiteSpace: 'nowrap', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FAF8F3'; e.currentTarget.style.background = '#1C1C1F'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#B9B9C0'; e.currentTarget.style.background = 'transparent'; }}
            >{logged ? 'Mi cuenta' : 'Entrar'}</a>

            <button onClick={handleWhatsApp}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#25D366', color: '#0A3D22', fontWeight: 700, fontSize: 14,
                padding: '9px 15px', borderRadius: 999, whiteSpace: 'nowrap',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
            ><WhatsAppIcon size={15} color="#0A3D22" /> WhatsApp</button>
          </div>

          {/* Mobile: hamburger */}
          <div className="header-hamburger" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button onClick={toggleCurrency} aria-label="Cambiar moneda"
              style={{
                display: 'flex', alignItems: 'center', background: '#1C1C1F',
                border: '1px solid #38383F', borderRadius: 999, padding: 3, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <span style={currency === 'L' ? chipOn : chipOff}>L</span>
              <span style={currency === 'USD' ? chipOn : chipOff}>$</span>
            </button>
            <button onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              style={{
                width: 38, height: 38, borderRadius: 9, background: '#1C1C1F',
                border: '1px solid #38383F', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4.5, padding: 0,
              }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: menuOpen ? (i === 1 ? 0 : 18) : i === 1 ? 14 : 18,
                  height: 1.5, borderRadius: 1, background: '#FAF8F3',
                  transform: menuOpen
                    ? (i === 0 ? 'rotate(45deg) translateY(6px)' : i === 2 ? 'rotate(-45deg) translateY(-6px)' : 'scaleX(0)')
                    : 'none',
                  transition: 'transform 0.25s ease, width 0.2s ease, opacity 0.2s',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,11,0.55)', backdropFilter: 'blur(8px)' }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: '#111113', borderBottom: '1px solid #2A2A30',
            paddingTop: 76, paddingBottom: '1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem',
            animation: 'slideDown 0.28s ease', fontFamily: F_SANS,
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: '1rem' }}>
              {[...NAV_ITEMS, { to: 'publicar', label: 'Publicar gratis', url: '/publicar' }].map(item => {
                const active = currentRoute === item.to;
                const gold = item.to === 'publicar';
                return (
                  <a key={item.to} href={item.url} onClick={e => navigate(item.to, e)}
                    style={{
                      fontSize: '1rem', fontWeight: active || gold ? 700 : 500,
                      color: gold ? '#D4B254' : active ? '#FAF8F3' : '#B9B9C0',
                      padding: '0.8125rem 0.875rem', borderRadius: 10, textDecoration: 'none',
                      background: active ? '#232327' : 'transparent',
                    }}>{item.label}</a>
                );
              })}
            </nav>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: '0.875rem', borderTop: '1px solid #2A2A30' }}>
              <button onClick={() => { setMenuOpen(false); handleWhatsApp(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#25D366', color: '#0A3D22', fontWeight: 700, fontSize: 15,
                  padding: '0.875rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                <WhatsAppIcon size={16} color="#0A3D22" /> Contactar por WhatsApp
              </button>
              {logged && (
                <a href="/favoritos" style={{
                  display: 'block', textAlign: 'center', padding: '0.875rem',
                  border: '1px solid #38383F', borderRadius: 12,
                  color: '#B9B9C0', fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none',
                }}>Mis favoritos</a>
              )}
              <a href={logged ? '/mis-propiedades' : '/acceder'} style={{
                display: 'block', textAlign: 'center', padding: '0.875rem',
                border: '1px solid #38383F', borderRadius: 12,
                color: '#B9B9C0', fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none',
              }}>{logged ? 'Mi cuenta' : 'Iniciar sesión'}</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
