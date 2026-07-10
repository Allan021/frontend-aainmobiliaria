import { useState, useEffect, useRef } from 'react';
import { WhatsAppButton } from '../shared/WhatsAppButton';

interface HeaderProps {
  currentRoute: string;
  onNavigate?: (route: string) => void;
  onWhatsApp?: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const NAV_ITEMS = [
  { to: 'home', label: 'Inicio' },
  { to: 'buscar', label: 'Buscar' },
  { to: 'catalog', label: 'Propiedades' },
  { to: 'lotificaciones', label: 'Lotificaciones' },
  { to: 'publicar', label: 'Publicar' },
  { to: 'about', label: 'Nosotros' },
];

const NAV_URLS: Record<string, string> = {
  home: '/',
  buscar: '/buscar',
  catalog: '/propiedades',
  lotificaciones: '/lotificaciones',
  publicar: '/publicar',
  about: '/nosotros',
};

export function Header({ currentRoute, onNavigate, onWhatsApp, theme: propTheme, toggleTheme: propToggleTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    setLogged(!!localStorage.getItem('aa_token'));
  }, []);

  // Sitio público siempre claro — dark mode solo existe en el admin
  useEffect(() => {
    setTheme('light');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('aa_pub_theme');
  }, [propTheme]);

  const isDark = false;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
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

  const navigate = (to: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(to);
    }
    setMenuOpen(false);
  };

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp();
    } else {
      window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
    }
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
            href="/"
            onClick={(e) => {
              navigate('home', e);
            }}
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
              <img src="/logo-mark.webp" alt="A&A" width={40} height={40} style={{ width: 40, height: 40, objectFit: 'cover', mixBlendMode: 'screen' }} />
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
                  href={NAV_URLS[item.to] || '#'}
                  onClick={(e) => {
                    navigate(item.to, e);
                  }}
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
            {logged && (
              <a
                href="/favoritos"
                aria-label="Mis favoritos"
                title="Mis favoritos"
                style={{
                  width: 36, height: 36, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: transparent ? 'rgba(250,248,243,0.75)' : isDark ? '#9A9383' : '#5A5A63',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = transparent ? 'rgba(250,248,243,0.75)' : isDark ? '#9A9383' : '#5A5A63'; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </a>
            )}
            <a
              href={logged ? '/mis-propiedades' : '/acceder'}
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
              {logged ? 'Mi cuenta' : 'Iniciar sesión'}
            </a>
            <WhatsAppButton
              onClick={handleWhatsApp}
              size="md"
              label="WhatsApp"
            />
          </div>

          {/* Mobile: hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }} className="header-hamburger">
            {/* Hamburger */}
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              style={{
                width: 38, height: 38, borderRadius: 9,
                background: hamburgerBg,
                border: `1px solid ${hamburgerBorder}`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4.5,
                padding: 0, flexShrink: 0,
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
                    href={NAV_URLS[item.to] || '#'}
                    onClick={(e) => {
                      navigate(item.to, e);
                    }}
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
              <WhatsAppButton
                onClick={handleWhatsApp}
                size="lg"
                label="Contactar por WhatsApp"
                style={{ padding: '0.875rem 1.75rem' }}
              />
              {logged && (
                <a
                  href="/favoritos"
                  style={{
                    display: 'block', textAlign: 'center', padding: '0.875rem',
                    border: `1px solid ${isDark ? '#26262B' : '#E6E0D2'}`, borderRadius: 12,
                    color: isDark ? '#C9C2B1' : '#111113', fontSize: '0.9375rem', fontWeight: 500,
                    textDecoration: 'none',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
                  }}
                >
                  Mis favoritos
                </a>
              )}
              <a
                href={logged ? '/mis-propiedades' : '/acceder'}
                style={{
                  display: 'block', textAlign: 'center', padding: '0.875rem',
                  border: `1px solid ${isDark ? '#26262B' : '#E6E0D2'}`, borderRadius: 12,
                  color: isDark ? '#C9C2B1' : '#111113', fontSize: '0.9375rem', fontWeight: 500,
                  textDecoration: 'none',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                {logged ? 'Mi cuenta' : 'Iniciar sesión'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for non-home pages */}
      {!isHome && <div style={{ height: 80 }} />}



    </>
  );
}
