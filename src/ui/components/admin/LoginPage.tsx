import { useState, useEffect, useRef } from 'react';
import { Eyebrow } from '../shared/Button';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { QueryProvider } from '../../providers/QueryProvider';
import { Sun, Moon } from 'lucide-react';

/* ── Theme helpers ─────────────────────────── */
function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('aa_theme') as 'light' | 'dark') || 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('aa_theme', theme);
}

/* ── Google SVG icon ─────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/* ── Login Navbar ───────────────────────────── */
function LoginNavbar({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        borderColor: isDark ? '#26262B' : '#E6E0D2',
        background: isDark ? 'rgba(17,17,19,0.92)' : 'rgba(250,248,243,0.86)',
        backdropFilter: 'blur(16px) saturate(140%)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-3.5 cursor-pointer no-underline">
          <div className="w-[44px] h-[44px] rounded-lg bg-obsidian-900 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo-mark.webp" alt="A&A" className="w-[44px] h-[44px] object-cover" style={{ mixBlendMode: 'screen' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: isDark ? '#FAF8F3' : '#111113', lineHeight: 1.2, letterSpacing: '-0.01em' }}>A&A Inmobiliaria</div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: '#D4B254', fontWeight: 600, marginTop: 2 }}>TU PROPIEDAD · NUESTRA MISIÓN</div>
          </div>
        </a>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{
              width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              color: isDark ? '#C9C2B1' : '#5A5A63',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a href="/" style={{
            fontSize: '0.8125rem', fontWeight: 500, color: isDark ? '#C9C2B1' : '#5A5A63',
            textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
            transition: 'color 0.2s',
          }}>← Volver al sitio</a>
        </div>
      </div>
    </header>
  );
}

/* ── Login Footer ───────────────────────────── */
function LoginFooter({ isDark }: { isDark: boolean }) {
  return (
    <footer style={{
      background: isDark ? '#0A0A0B' : '#111113',
      padding: '2rem 1.5rem',
      borderTop: `1px solid ${isDark ? '#1A1A1D' : '#26262B'}`,
    }}>
      <div className="max-w-[1280px] mx-auto flex flex-wrap justify-between items-center gap-4">
        <div style={{ fontSize: '0.75rem', color: '#5A5A63', fontWeight: 500 }}>
          © {new Date().getFullYear()} A&A Inmobiliaria · El Progreso, Yoro, Honduras
        </div>
        <div className="flex gap-2 items-center">
          <a href="/" style={{
            fontSize: '0.75rem', color: '#C9C2B1', fontWeight: 500,
            textDecoration: 'none', padding: '0.375rem 0.75rem',
            border: '1px solid #26262B', borderRadius: '0.375rem',
          }}>Ir al sitio público</a>
        </div>
      </div>
    </footer>
  );
}

/* ── Divider ────────────────────────────────── */
function Divider({ isDark, text }: { isDark: boolean; text: string }) {
  const lineColor = isDark ? '#26262B' : '#E6E0D2';
  const textColor = isDark ? '#5A5A63' : '#9A9383';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.25rem 0' }}>
      <div style={{ flex: 1, height: 1, background: lineColor }} />
      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: textColor, letterSpacing: '0.05em' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: lineColor }} />
    </div>
  );
}

/* ── Tab Switch ─────────────────────────────── */
function TabSwitch({ active, onChange, isDark }: { active: 'login' | 'register'; onChange: (t: 'login' | 'register') => void; isDark: boolean }) {
  const bg = isDark ? '#111113' : '#F3F0EB';
  const activeBg = isDark ? '#26262B' : '#FFFFFF';
  const activeText = isDark ? '#FAF8F3' : '#111113';
  const inactiveText = isDark ? '#5A5A63' : '#9A9383';

  return (
    <div style={{
      display: 'flex', background: bg, borderRadius: '0.5rem', padding: '3px',
      marginBottom: '1.5rem',
    }}>
      {(['login', 'register'] as const).map(tab => (
        <button key={tab} onClick={() => onChange(tab)} style={{
          flex: 1, padding: '0.625rem', borderRadius: '0.375rem', border: 'none',
          background: active === tab ? activeBg : 'transparent',
          color: active === tab ? activeText : inactiveText,
          fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.2s',
        }}>
          {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   Main Login / Register Form
   ════════════════════════════════════════════════ */
function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);
  const login = useLogin();
  const register = useRegister();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyTheme(getStoredTheme()); }, []);

  useEffect(() => {
    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      const stagger = (mod as any).stagger;
      if (!animate || !stagger) return;

      if (leftRef.current) {
        animate(leftRef.current, {
          opacity: [0, 1],
          x: [-40, 0],
          duration: 800,
          ease: 'outExpo',
          delay: 100,
        });
        if (statsRef.current) {
          const els = statsRef.current.querySelectorAll('.lstat');
          animate(els, {
            opacity: [0, 1],
            y: [16, 0],
            duration: 500,
            ease: 'outExpo',
            delay: stagger(90, { start: 500 }),
          });
        }
      }

      if (rightRef.current) {
        animate(rightRef.current, {
          opacity: [0, 1],
          x: [40, 0],
          duration: 800,
          ease: 'outExpo',
          delay: 200,
        });
      }
    });
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');
    if (token) {
      localStorage.setItem('aa_token', token);
      window.location.href = '/admin';
    }
    if (errorParam) {
      setError('Error al iniciar sesión con Google.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const isDark = theme === 'dark';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await login.mutateAsync({ email, password });
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await register.mutateAsync({ email, password, name });
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => { window.location.href = '/admin'; }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Theme palette
  const pageBg = isDark ? '#111113' : '#FAF8F3';
  const cardBorder = isDark ? '#26262B' : '#E6E0D2';
  const inputBg = isDark ? '#111113' : '#FAF8F3';
  const inputBorder = isDark ? '#26262B' : '#E6E0D2';
  const inputColor = isDark ? '#FAF8F3' : '#111113';
  const labelColor = isDark ? '#5A5A63' : '#9A9383';
  const textColor = isDark ? '#FAF8F3' : '#111113';
  const subtitleColor = isDark ? '#9A9383' : '#5A5A63';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', border: `1px solid ${inputBorder}`,
    borderRadius: '0.5rem', fontSize: '0.875rem', color: inputColor, fontWeight: 500,
    outline: 'none', background: inputBg, transition: 'all 0.2s',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: labelColor, marginBottom: '0.375rem',
    display: 'block', transition: 'color 0.3s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <LoginNavbar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main — 2-column */}
      <div style={{ flex: 1, display: 'flex', background: pageBg, transition: 'background 0.3s ease' }}>

        {/* Left — Brand panel (hidden mobile) */}
        <div ref={leftRef} style={{
          flex: 1, position: 'relative', display: 'none',
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          padding: '3rem', background: isDark ? '#0A0A0B' : '#111113', overflow: 'hidden',
          opacity: 0,
        }} className="lg:flex">
          <div style={{ position: 'absolute', inset: 0, opacity: 0.12, background: "url('/montana.jpg') center/cover no-repeat" }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,17,19,0.85) 0%, rgba(10,10,11,0.95) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px', textAlign: 'center' }}>
            <div style={{
              width: '5rem', height: '5rem', borderRadius: '1.25rem', margin: '0 auto 2rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo-monogram.svg" alt="A&A" style={{ width: '2.75rem' }} />
            </div>

            <h2 style={{
              fontSize: '2.25rem', fontWeight: 700, color: '#FAF8F3',
              lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1rem',
            }}>
              Publica tu <span style={{ color: '#D4B254' }}>propiedad</span> con nosotros.
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: '#9A9383', marginBottom: '2.5rem' }}>
              Crea tu cuenta y publica terrenos, lotes o casas en la plataforma de bienes raíces
              líder de El Progreso, Yoro. Tu propiedad será vista por cientos de compradores activos.
            </p>

            {/* Publish CTA */}
            <div style={{
              background: 'rgba(212,178,84,0.08)', border: '1px solid rgba(212,178,84,0.2)',
              borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '0.625rem', letterSpacing: '0.15em', color: '#D4B254', fontWeight: 600, marginBottom: '0.5rem' }}>PRÓXIMAMENTE</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FAF8F3', marginBottom: '0.375rem' }}>Publica tu solar por L 1,000</div>
              <p style={{ fontSize: '0.8125rem', color: '#9A9383', lineHeight: 1.5, margin: 0 }}>
                Pronto podrás subir tu propiedad directamente. Incluye galería de fotos, ubicación y plan de financiamiento.
              </p>
            </div>

            {/* Trust indicators */}
            <div ref={statsRef} style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              {[
                { num: '50+', label: 'Propiedades' },
                { num: '200+', label: 'Clientes' },
                { num: '4.9★', label: 'Rating' },
              ].map(s => (
                <div key={s.label} className="lstat" style={{ textAlign: 'center', opacity: 0 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D4B254' }}>{s.num}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#5A5A63', fontWeight: 500, letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div ref={rightRef} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', background: pageBg, transition: 'background 0.3s ease',
          opacity: 0,
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Mobile brand (hidden desktop) */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem',
                background: '#111113', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                <img src="/logo-monogram.svg" alt="A&A" style={{ width: '1.5rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: textColor }}>A&A Inmobiliaria</div>
                <div style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: '#D4B254', fontWeight: 600 }}>EL PROGRESO, YORO</div>
              </div>
            </div>

            {/* Tab switch */}
            <TabSwitch active={mode} onChange={setMode} isDark={isDark} />

            <Eyebrow>{mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a A&A'}</Eyebrow>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', marginBottom: '0.5rem',
              letterSpacing: '-0.025em', color: textColor, transition: 'color 0.3s',
            }}>{mode === 'login' ? 'Iniciar sesión' : 'Crear tu cuenta'}</h1>
            <p style={{ fontSize: '0.8125rem', color: subtitleColor, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {mode === 'login'
                ? 'Ingresa tus credenciales o usa Google para acceder.'
                : 'Regístrate gratis y en el futuro podrás publicar tus propiedades.'}
            </p>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '0.875rem', borderRadius: '0.5rem', cursor: 'pointer',
                background: isDark ? '#1A1A1D' : '#FFFFFF',
                border: `1px solid ${cardBorder}`,
                color: textColor, fontWeight: 600, fontSize: '0.875rem',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4B254'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(212,178,84,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <GoogleIcon />
              {mode === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}
            </button>

            <div style={{ margin: '1.25rem 0' }}>
              <Divider isDark={isDark} text="o con correo electrónico" />
            </div>

            {/* Error / Success messages */}
            {error && (
              <div style={{
                background: isDark ? 'rgba(140,58,46,0.15)' : 'rgba(140,58,46,0.08)',
                border: '1px solid rgba(140,58,46,0.2)', color: '#8C3A2E',
                fontSize: '0.8125rem', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                marginBottom: '1rem', fontWeight: 500,
              }}>{error}</div>
            )}
            {success && (
              <div style={{
                background: isDark ? 'rgba(52,168,83,0.15)' : 'rgba(52,168,83,0.08)',
                border: '1px solid rgba(52,168,83,0.2)', color: '#1e7e34',
                fontSize: '0.8125rem', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                marginBottom: '1rem', fontWeight: 500,
              }}>{success}</div>
            )}

            {/* ─── LOGIN FORM ──────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={labelStyle}>Correo electrónico</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tucorreo@email.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#D4B254'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Contraseña</span>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{ ...inputStyle, letterSpacing: '0.1em' }}
                    onFocus={(e) => e.target.style.borderColor = '#D4B254'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  />
                </div>
                <button type="submit" disabled={login.isPending} style={{
                  width: '100%', padding: '0.875rem', borderRadius: '0.5rem',
                  background: '#111113', color: '#FAF8F3', fontWeight: 600,
                  fontSize: '0.875rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s', marginTop: '0.25rem',
                  opacity: login.isPending ? 0.7 : 1,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#26262B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#111113'; }}
                >
                  {login.isPending ? 'Ingresando...' : 'Ingresar al sistema'}
                </button>
              </form>
            )}

            {/* ─── REGISTER FORM ──────────── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={labelStyle}>Nombre completo</span>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Juan Martínez" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#D4B254'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Correo electrónico</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tucorreo@email.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#D4B254'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Contraseña</span>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#D4B254'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Confirmar contraseña</span>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña" required
                    style={{ ...inputStyle, letterSpacing: '0.1em' }}
                    onFocus={(e) => e.target.style.borderColor = '#D4B254'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  />
                </div>
                <button type="submit" disabled={register.isPending} style={{
                  width: '100%', padding: '0.875rem', borderRadius: '0.5rem',
                  background: '#111113', color: '#FAF8F3', fontWeight: 600,
                  fontSize: '0.875rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s', marginTop: '0.25rem',
                  opacity: register.isPending ? 0.7 : 1,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#26262B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#111113'; }}
                >
                  {register.isPending ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
                </button>

                {/* Future publish teaser — mobile only */}
                <div className="lg:hidden" style={{
                  background: isDark ? 'rgba(212,178,84,0.06)' : 'rgba(212,178,84,0.05)',
                  border: `1px solid ${isDark ? 'rgba(212,178,84,0.15)' : 'rgba(212,178,84,0.12)'}`,
                  borderRadius: '0.75rem', padding: '1rem', marginTop: '0.5rem',
                }}>
                  <div style={{ fontSize: '0.625rem', letterSpacing: '0.12em', color: '#D4B254', fontWeight: 600, marginBottom: '0.25rem' }}>PRÓXIMAMENTE</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: textColor, marginBottom: '0.25rem' }}>Publica tu solar por L 1,000</div>
                  <p style={{ fontSize: '0.75rem', color: subtitleColor, lineHeight: 1.4, margin: 0 }}>
                    Pronto podrás subir tu propiedad con galería, ubicación y financiamiento.
                  </p>
                </div>
              </form>
            )}

            <p style={{
              textAlign: 'center', fontSize: '0.75rem', color: subtitleColor,
              marginTop: '1.5rem', lineHeight: 1.5,
            }}>
              {mode === 'login'
                ? <>¿No tienes cuenta? <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#D4B254', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', padding: 0 }}>Crea una gratis</button></>
                : <>¿Ya tienes cuenta? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#D4B254', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', padding: 0 }}>Inicia sesión</button></>
              }
            </p>
          </div>
        </div>
      </div>

      <LoginFooter isDark={isDark} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <QueryProvider>
      <LoginForm />
    </QueryProvider>
  );
}
