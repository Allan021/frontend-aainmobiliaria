import { useState, useEffect, useRef } from 'react';
import { Icon } from '../shared/Icon';
import { Sun, Moon, LogOut, ChevronDown, ExternalLink, Menu, X } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' as const },
  { key: 'catalog', label: 'Catálogo', icon: 'pin' as const },
  { key: 'leads', label: 'Leads', icon: 'phone' as const },
  { key: 'sales', label: 'Ventas', icon: 'banknote' as const },
  { key: 'financing', label: 'Financiamiento', icon: 'shield' as const },
];

interface Props {
  route: string;
  setRoute: (r: string) => void;
  userName?: string;
  userEmail?: string;
  pendingLeads?: number;
}

/* ── Theme palettes ─────────────────────────── */
const themes = {
  light: {
    sidebarBg: '#111113',
    sidebarBorder: '#1A1A1D',
    sidebarText: '#FAF8F3',
    sidebarTextMuted: '#C9C2B1',
    sidebarTextDim: '#5A5A63',
    sidebarItemHover: 'rgba(255,255,255,0.05)',
    sidebarActiveItemBg: '#1A1A1D',
    sidebarActiveItemText: '#D4B254',
    sidebarAccent: '#D4B254',
    sidebarCardBg: '#1A1A1D',
    sidebarCardBorder: '#26262B',
    sidebarAvatarBg: '#E6CE84',
    sidebarAvatarText: '#111113',
    toggleTrack: '#26262B',
    toggleThumb: '#FAF8F3',
    toggleIcon: '#D4B254',
  },
  dark: {
    sidebarBg: '#0A0A0B',
    sidebarBorder: '#1A1A1D',
    sidebarText: '#FAF8F3',
    sidebarTextMuted: '#C9C2B1',
    sidebarTextDim: '#5A5A63',
    sidebarItemHover: 'rgba(255,255,255,0.06)',
    sidebarActiveItemBg: '#1A1A1D',
    sidebarActiveItemText: '#D4B254',
    sidebarAccent: '#D4B254',
    sidebarCardBg: '#111113',
    sidebarCardBorder: '#1A1A1D',
    sidebarAvatarBg: '#E6CE84',
    sidebarAvatarText: '#111113',
    toggleTrack: '#36363D',
    toggleThumb: '#D4B254',
    toggleIcon: '#111113',
  },
};

/* ── Theme helpers ─────────────────────────── */
function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('aa_theme') as 'light' | 'dark') || 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('aa_theme', theme);
}

/* ── Theme Toggle ──────────────────────────── */
function ThemeToggle({ theme, toggle, t }: { theme: 'light' | 'dark'; toggle: () => void; t: typeof themes.light }) {
  const isDark = theme === 'dark';
  return (
    <button
      id="theme-toggle-btn"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.375rem 0.5rem', borderRadius: '0.5rem', background: 'none',
        border: 'none', cursor: 'pointer', width: '100%', transition: 'background 0.2s',
        color: t.sidebarTextMuted,
      }}
    >
      <span style={{
        width: 38, height: 22, borderRadius: 999, background: t.toggleTrack,
        position: 'relative', transition: 'background 0.3s ease', flexShrink: 0,
        display: 'inline-block',
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: 999, background: t.toggleThumb,
          position: 'absolute', top: 3, left: 3, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: t.toggleIcon,
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          transform: isDark ? 'translateX(16px)' : 'translateX(0)',
        }}>
          {isDark ? <Moon size={10} strokeWidth={2.5} /> : <Sun size={10} strokeWidth={2.5} />}
        </span>
      </span>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.01em' }}>
        {isDark ? 'Oscuro' : 'Claro'}
      </span>
    </button>
  );
}

/* ── User Dropdown ─────────────────────────── */
function UserDropdown({ userName, userEmail, initials, t }: {
  userName: string; userEmail: string; initials: string; t: typeof themes.light;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aa_token');
    window.location.href = '/admin/login';
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        id="user-menu-btn"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem',
          borderRadius: '0.75rem', background: t.sidebarCardBg, border: `1px solid ${t.sidebarCardBorder}`,
          cursor: 'pointer', width: '100%', transition: 'border-color 0.2s', textAlign: 'left',
          color: t.sidebarText,
        }}
      >
        <div style={{
          width: '2rem', height: '2rem', borderRadius: 999, background: t.sidebarAvatarBg,
          color: t.sidebarAvatarText, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: '0.6875rem', flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.8125rem', fontWeight: 600, color: t.sidebarText,
            lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{userName}</div>
          <div style={{ fontSize: '0.6875rem', color: t.sidebarTextDim, lineHeight: 1.3 }}>Administrador</div>
        </div>
        <ChevronDown size={14} style={{
          color: t.sidebarTextDim, flexShrink: 0,
          transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
          background: t.sidebarCardBg, border: `1px solid ${t.sidebarCardBorder}`,
          borderRadius: '0.75rem', padding: '0.5rem', boxShadow: '0 -8px 30px -8px rgba(0,0,0,0.4)',
          zIndex: 50, animation: 'dropdown-appear 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.5rem' }}>
            <div style={{
              width: '2.25rem', height: '2.25rem', borderRadius: 999, background: t.sidebarAvatarBg,
              color: t.sidebarAvatarText, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
            }}>{initials}</div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: t.sidebarText }}>{userName}</div>
              <div style={{ fontSize: '0.6875rem', color: t.sidebarTextDim }}>{userEmail}</div>
            </div>
          </div>
          <div style={{ height: 1, background: t.sidebarCardBorder, margin: '0.25rem 0' }} />
          <a href="/" target="_blank" rel="noopener" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem',
            borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: t.sidebarTextMuted,
            cursor: 'pointer', textDecoration: 'none', transition: 'background 0.15s',
          }}>
            <ExternalLink size={14} />
            Ver sitio público
          </a>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem',
            borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#E57373',
            cursor: 'pointer', transition: 'background 0.15s', width: '100%', textAlign: 'left',
            background: 'none', border: 'none',
          }}>
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Mobile Hamburger Toggle ───────────────── */
export function SidebarMobileToggle({ isOpen, toggle, isDark }: {
  isOpen: boolean; toggle: () => void; isDark?: boolean;
}) {
  return (
    <button
      id="sidebar-mobile-toggle"
      onClick={toggle}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      style={{
        alignItems: 'center', justifyContent: 'center',
        width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem',
        background: isDark ? '#1A1A1D' : '#FFFFFF',
        border: `1px solid ${isDark ? '#26262B' : '#E6E0D2'}`,
        color: isDark ? '#FAF8F3' : '#111113',
        cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
      }}
      className="sidebar-mobile-toggle"
    >
      {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}

/* ── Main Sidebar ──────────────────────────── */
export function AdminSidebar({
  route, setRoute, userName = 'Allan R.', userEmail = 'admin@aainmobiliaria.com',
  pendingLeads = 0, isOpen = true, onClose,
}: Props & { isOpen?: boolean; onClose?: () => void }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);
  const initials = userName.split(' ').map(s => s[0]).slice(0, 2).join('');
  const t = themes[theme];

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyTheme(getStoredTheme()); }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleNavClick = (key: string) => {
    setRoute(key);
    onClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
        style={{
          width: 256, background: t.sidebarBg, color: t.sidebarText,
          padding: '1.75rem 1.25rem 1.25rem', minHeight: '100vh',
          borderRight: `1px solid ${t.sidebarBorder}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', padding: '0 0.5rem' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: '#0A0A0B',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img src="/logo-mark.webp" alt="A&A" style={{
              width: '2.5rem', height: '2.5rem', objectFit: 'cover', mixBlendMode: 'screen',
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: t.sidebarText, lineHeight: 1.25, letterSpacing: '-0.015em' }}>
              A&A Inmobiliaria
            </div>
            <div style={{ fontSize: '0.5625rem', letterSpacing: '0.18em', color: t.sidebarAccent, marginTop: '0.125rem', fontWeight: 600 }}>
              PANEL INTERNO
            </div>
          </div>
          {/* Mobile close */}
          <button className="sidebar__close-mobile" onClick={onClose} aria-label="Cerrar menú"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: t.sidebarTextMuted, cursor: 'pointer', padding: '0.25rem', borderRadius: '0.375rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Session badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
          margin: '0 0.25rem 1.25rem', borderRadius: '0.5rem',
          background: 'rgba(74, 124, 89, 0.12)', border: '1px solid rgba(74, 124, 89, 0.18)',
          fontSize: '0.6875rem', fontWeight: 500, color: '#6EBF7B', letterSpacing: '0.02em',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: 999, background: '#4ADE80',
            boxShadow: '0 0 6px rgba(74,222,128,0.5)',
            animation: 'sidebar-pulse 2s ease-in-out infinite',
          }} />
          <span>Sesión activa</span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(i => {
            const active = route === i.key;
            return (
              <a key={i.key} id={`sidebar-nav-${i.key}`}
                onClick={() => handleNavClick(i.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  color: active ? t.sidebarActiveItemText : t.sidebarTextMuted,
                  background: active ? t.sidebarActiveItemBg : 'transparent',
                  position: 'relative', userSelect: 'none', textDecoration: 'none',
                }}
              >
                <Icon name={i.icon} size={17} />
                <span style={{ flex: 1 }}>{i.label}</span>
                {i.key === 'leads' && pendingLeads > 0 && (
                  <span style={{
                    minWidth: '1.25rem', height: '1.25rem', borderRadius: 999,
                    background: '#D4B254', color: '#111113',
                    fontSize: '0.625rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                  }}>{pendingLeads > 99 ? '99+' : pendingLeads}</span>
                )}
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 16, borderRadius: '0 2px 2px 0', background: t.sidebarAccent,
                  }} />
                )}
              </a>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Bottom section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ThemeToggle theme={theme} toggle={toggleTheme} t={t} />
          <div style={{ height: 1, background: t.sidebarCardBorder, margin: '0.125rem 0' }} />
          <UserDropdown userName={userName} userEmail={userEmail} initials={initials} t={t} />
        </div>
      </aside>
    </>
  );
}
