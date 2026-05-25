import { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon } from '../shared/Icon';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onWhatsApp: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const NAV_ITEMS = [
  { to: 'home', label: 'Inicio' },
  { to: 'catalog', label: 'Propiedades' },
  { to: 'lotificaciones', label: 'Lotificaciones' },
  { to: 'about', label: 'Nosotros' },
];

export function Header({ currentRoute, onNavigate, onWhatsApp, theme = 'light', toggleTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuAnimating(true);
      setTimeout(() => { setMenuOpen(false); setMenuAnimating(false); }, 250);
    } else {
      setMenuOpen(true);
    }
  };

  const navigate = (to: string) => {
    onNavigate(to);
    setMenuOpen(false);
  };

  const isHome = currentRoute === 'home';
  const transparent = isHome && !scrolled && !menuOpen;

  // Dark-mode-aware background
  const solidBg = isDark
    ? 'rgba(17,17,19,0.95)'
    : 'rgba(250,248,243,0.96)';
  const headerBg = transparent ? 'rgba(0,0,0,0)' : solidBg;
  const headerBorder = transparent
    ? 'rgba(255,255,255,0.08)'
    : isDark ? 'rgba(38,38,43,0.8)' : '#E6E0D2';
  const backdropBlur = !transparent ? 'blur(24px) saturate(160%)' : 'none';

  // Text colors
  const logoTextColor = transparent ? '#FAF8F3' : isDark ? '#FAF8F3' : '#111113';
  const logoSubColor = transparent ? 'rgba(212,178,84,0.9)' : '#D4B254';
  const navColor = transparent ? 'rgba(250,248,243,0.70)' : isDark ? '#9A9383' : '#5A5A63';
  const navActiveColor = transparent ? '#FAF8F3' : isDark ? '#FAF8F3' : '#111113';
  const hamburgerBg = transparent ? 'rgba(255,255,255,0.1)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const hamburgerBorder = transparent ? 'rgba(255,255,255,0.12)' : isDark ? 'rgba(38,38,43,0.9)' : '#E6E0D2';
  const hamburgerBar = transparent ? '#FAF8F3' : isDark ? '#C9C2B1' : '#111113';

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          backdropFilter: backdropBlur,
          transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1280, margin: '0 auto',
            padding: '0 1.5rem',
            height: scrolled ? 66 : 80,
            display: 'flex', alignItems: 'center', gap: '2.5rem',
            transition: 'height 0.3s ease',
          }}
        >
          {/* Brand */}
          <a
            onClick={() => navigate('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 9,
              background: transparent ? 'rgba(255,255,255,0.12)' : '#111113',
              border: transparent ? '1px solid rgba(255,255,255,0.14)' : isDark ? '1px solid rgba(38,38,43,0.8)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
              transition: 'background 0.3s, border 0.3s',
            }}>
              <img src="/logo-mark.jpg" alt="A&A" style={{ width: 40, height: 40, objectFit: 'cover', mixBlendMode: 'screen' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: logoTextColor, letterSpacing: '-0.02em', lineHeight: 1.2, transition: 'color 0.3s' }}>
                A&amp;A Inmobiliaria
              </div>
              <div style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: logoSubColor, fontWeight: 600, marginTop: 1, transition: 'color 0.3s' }}>
                TU PROPIEDAD · NUESTRA MISIÓN
              </div>
            </div>
          </a>

          {/* Desktop nav — centered */}
          <nav style={{ flex: 1, display: 'flex', gap: '1.75rem', alignItems: 'center', justifyContent: 'center' }} className="header-nav-desktop">
            {NAV_ITEMS.map((item, i) => {
              const active = currentRoute === item.to;
              return (
                <a
                  key={i}
                  onClick={() => navigate(item.to)}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? navActiveColor : navColor,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    position: 'relative',
                    paddingBottom: 2,
                    transition: 'color 0.2s',
                    letterSpacing: '-0.005em',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = navActiveColor; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? navActiveColor : navColor; }}
                >
                  {item.label}
                  {active && (
                    <div style={{
                      position: 'absolute', bottom: -2, left: 0, right: 0,
                      height: 1.5, borderRadius: 1, background: '#D4B254',
                    }} />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }} className="header-ctas-desktop">
            {/* Dark mode toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
                style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: transparent
                    ? 'rgba(255,255,255,0.08)'
                    : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${transparent
                    ? 'rgba(255,255,255,0.12)'
                    : isDark ? 'rgba(38,38,43,0.8)' : '#E6E0D2'}`,
                  color: transparent ? 'rgba(250,248,243,0.75)' : isDark ? '#9A9383' : '#5A5A63',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#D4B254';
                  e.currentTarget.style.color = '#D4B254';
                  e.currentTarget.style.background = 'rgba(212,178,84,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = transparent
                    ? 'rgba(255,255,255,0.12)'
                    : isDark ? 'rgba(38,38,43,0.8)' : '#E6E0D2';
                  e.currentTarget.style.color = transparent
                    ? 'rgba(250,248,243,0.75)'
                    : isDark ? '#9A9383' : '#5A5A63';
                  e.currentTarget.style.background = transparent
                    ? 'rgba(255,255,255,0.08)'
                    : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
                }}
              >
                {isDark ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}

            {/* Divider */}
            <div style={{
              width: 1, height: 20,
              background: transparent ? 'rgba(255,255,255,0.12)' : isDark ? 'rgba(38,38,43,0.9)' : '#E6E0D2',
              flexShrink: 0, marginLeft: 2, marginRight: 2,
            }} />

            <a
              href="/login"
              style={{
                fontSize: '0.875rem', fontWeight: 500,
                color: transparent ? 'rgba(250,248,243,0.75)' : isDark ? '#9A9383' : '#5A5A63',
                textDecoration: 'none',
                padding: '0.4375rem 0.875rem', borderRadius: 8,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = transparent ? '#FAF8F3' : isDark ? '#FAF8F3' : '#111113';
                (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = transparent ? 'rgba(250,248,243,0.75)' : isDark ? '#9A9383' : '#5A5A63';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              Iniciar sesión
            </a>
            <button
              onClick={onWhatsApp}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.625rem 1.25rem', borderRadius: '9999px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.3)';
              }}
            >
              <WhatsAppIcon size={15} />
              WhatsApp
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={toggleMenu}
            className="header-hamburger"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            style={{
              width: 38, height: 38, borderRadius: 9,
              background: hamburgerBg,
              border: `1px solid ${hamburgerBorder}`,
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4.5,
              padding: 0, flexShrink: 0, marginLeft: 'auto',
              transition: 'all 0.2s',
            }}
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: menuOpen ? (i === 1 ? 0 : 18) : i === 1 ? 14 : 18,
                  height: 1.5, borderRadius: 1,
                  background: hamburgerBar,
                  transformOrigin: 'center',
                  transform: menuOpen
                    ? (i === 0 ? 'rotate(45deg) translateY(6px)' : i === 2 ? 'rotate(-45deg) translateY(-6px)' : 'scaleX(0)')
                    : 'none',
                  transition: 'transform 0.25s ease, width 0.2s ease, opacity 0.2s',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div ref={menuRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}>
          {/* Backdrop */}
          <div
            onClick={toggleMenu}
            style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,11,0.55)', backdropFilter: 'blur(8px)' }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: isDark ? '#111113' : '#FAF8F3',
              borderBottom: `1px solid ${isDark ? '#1A1A1D' : '#E6E0D2'}`,
              paddingTop: 90, paddingBottom: '1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem',
              boxShadow: '0 20px 60px -12px rgba(17,17,19,0.30)',
              animation: menuAnimating ? 'slideUp 0.25s ease' : 'slideDown 0.28s ease',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: '1rem' }}>
              {NAV_ITEMS.map((item, i) => {
                const active = currentRoute === item.to;
                return (
                  <a
                    key={i}
                    onClick={() => navigate(item.to)}
                    style={{
                      fontSize: '1rem', fontWeight: active ? 700 : 500,
                      color: active ? (isDark ? '#FAF8F3' : '#111113') : isDark ? '#9A9383' : '#5A5A63',
                      padding: '0.8125rem 0.875rem',
                      borderRadius: 10,
                      cursor: 'pointer', textDecoration: 'none',
                      background: active ? (isDark ? 'rgba(212,178,84,0.10)' : '#F0EBE0') : 'transparent',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    {active && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4B254', flexShrink: 0 }} />
                    )}
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: '0.875rem', borderTop: `1px solid ${isDark ? '#1A1A1D' : '#E6E0D2'}` }}>
              {/* Dark mode row */}
              {toggleTheme && (
                <button
                  onClick={toggleTheme}
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    background: isDark ? 'rgba(212,178,84,0.06)' : '#F3EFE6',
                    border: `1px solid ${isDark ? 'rgba(212,178,84,0.15)' : '#E6E0D2'}`,
                    borderRadius: 12,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: isDark ? 'rgba(212,178,84,0.12)' : 'rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isDark ? '#D4B254' : '#5A5A63',
                    }}>
                      {isDark ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: isDark ? '#C9C2B1' : '#111113' }}>
                      {isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    </span>
                  </div>
                  {/* Toggle pill */}
                  <div style={{
                    width: 46, height: 26, borderRadius: 13,
                    background: isDark ? '#D4B254' : '#C9C2B1',
                    position: 'relative', transition: 'background 0.3s',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: isDark ? 23 : 3,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
                      transition: 'left 0.3s cubic-bezier(0.22,1,0.36,1)',
                    }} />
                  </div>
                </button>
              )}

              <button
                onClick={onWhatsApp}
                style={{
                  width: '100%', padding: '0.875rem 1.25rem',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  border: 'none', borderRadius: '9999px',
                  color: '#fff', fontSize: '0.9375rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.3)';
                }}
              >
                <WhatsAppIcon size={17} />
                Contactar por WhatsApp
              </button>
              <a
                href="/login"
                style={{
                  display: 'block', textAlign: 'center', padding: '0.875rem',
                  border: `1px solid ${isDark ? '#26262B' : '#E6E0D2'}`, borderRadius: 12,
                  color: isDark ? '#C9C2B1' : '#111113', fontSize: '0.9375rem', fontWeight: 500,
                  textDecoration: 'none',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for non-home pages */}
      {!isHome && <div style={{ height: 80 }} />}

      <style>{`
        @media (min-width: 768px) {
          .header-hamburger { display: none !important; }
          .header-nav-desktop { display: flex !important; }
          .header-ctas-desktop { display: flex !important; }
        }
        @media (max-width: 767px) {
          .header-nav-desktop { display: none !important; }
          .header-ctas-desktop { display: none !important; }
          .header-hamburger { display: flex !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
