import { useEffect, useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../../infrastructure/api/client';
import { IconLock } from '../shared/rs-icons';

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid var(--pub-border2)', borderRadius: 11, padding: '13px 16px',
  fontFamily: F_SANS, fontSize: 15, outlineColor: '#1F5B42',
  background: 'var(--pub-bg)', color: 'var(--pub-ink)',
};

const labelText: React.CSSProperties = {
  fontSize: '13.5px', fontWeight: 700, color: 'var(--pub-muted2)', display: 'block', marginBottom: 7,
};

function redirectAfterAuth(role: string) {
  const next = new URLSearchParams(window.location.search).get('next');
  window.location.href = role === 'admin' || role === 'superadmin' ? '/admin' : (next || '/buscar');
}

function AuthInner() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const error = (mode === 'login' ? login.error : register.error) as Error | null;

  // Retorno del OAuth de Google: ?token=... → guardar sesión y seguir
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('aa_token', token);
      window.location.replace(params.get('next') || '/buscar');
      return;
    }
    if (params.get('error')) setGoogleError('No se pudo completar el acceso con Google. Intentá de nuevo.');
  }, []);

  const googleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login.mutate({ email, password }, { onSuccess: d => redirectAfterAuth(d.user.role) });
    } else {
      register.mutate({ email, password, name }, { onSuccess: d => redirectAfterAuth(d.user.role) });
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', background: 'var(--pub-bg)',
      backgroundImage: 'radial-gradient(ellipse 700px 380px at 50% -10%, rgba(31,91,66,0.07), transparent)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '48px 24px 80px', fontFamily: F_SANS, color: 'var(--pub-ink)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--pub-green-bg)', border: '1px solid var(--pub-green-border)',
            borderRadius: 999, padding: '7px 16px', marginBottom: 18,
          }}>
            <span style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: '0.14em', color: '#1F5B42', fontWeight: 500 }}>
              MI CUENTA · A&A
            </span>
          </div>
          <h1 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 'clamp(28px, 5vw, 36px)', letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.1 }}>
            {mode === 'login' ? 'Bienvenido de nuevo.' : <>Creá tu cuenta.<br /><span style={{ color: '#1F5B42' }}>Es gratis.</span></>}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--pub-muted)', margin: 0 }}>
            Guardá favoritos, publicá tu propiedad y agendá visitas.
          </p>
        </div>

        <div style={{
          background: 'var(--pub-surface)', border: '1px solid var(--pub-border)',
          borderRadius: 20, padding: 'clamp(24px, 5vw, 36px)',
        }}>
          {/* Tabs */}
          <div role="tablist" aria-label="Modo de acceso" style={{
            display: 'flex', border: '1.5px solid var(--pub-border2)', borderRadius: 11,
            overflow: 'hidden', marginBottom: 24,
          }}>
            {(['login', 'register'] as const).map(m => {
              const sel = mode === m;
              return (
                <button key={m} role="tab" aria-selected={sel} onClick={() => setMode(m)} type="button" style={{
                  flex: 1, border: 'none', padding: '13px 0',
                  fontFamily: F_SANS, fontWeight: sel ? 700 : 600, fontSize: 14, cursor: 'pointer',
                  background: sel ? '#1F5B42' : 'var(--pub-bg)',
                  color: sel ? '#EEF5F0' : 'var(--pub-muted)',
                  transition: 'all 0.15s',
                }}>
                  {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </button>
              );
            })}
          </div>

          {(error || googleError) && (
            <div style={{
              background: '#F9EBE7', color: '#8C3A2E', border: '1px solid #EBD2CB',
              borderRadius: 11, padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, marginBottom: 18,
            }} role="alert">
              {googleError || error?.message}
            </div>
          )}

          {/* Google */}
          <button type="button" onClick={googleLogin} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: '1.5px solid var(--pub-border2)', background: 'var(--pub-surface)',
            color: 'var(--pub-ink)', fontFamily: F_SANS, fontWeight: 700, fontSize: 15,
            padding: '13px 0', borderRadius: 12, cursor: 'pointer', marginBottom: 18, transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1F5B42'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--pub-border2)'; }}
          >
            <GoogleLogo /> Continuar con Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--pub-border2)' }} />
            <span style={{ fontSize: 12, color: 'var(--pub-dim)', fontWeight: 600 }}>o con tu correo</span>
            <div style={{ flex: 1, height: 1, background: 'var(--pub-border2)' }} />
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mode === 'register' && (
              <label style={{ display: 'block' }}>
                <span style={labelText}>Nombre completo</span>
                <input required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej. María Rodríguez" style={inputStyle} autoComplete="name" />
              </label>
            )}
            <label style={{ display: 'block' }}>
              <span style={labelText}>Correo electrónico</span>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com" style={inputStyle} autoComplete="email" inputMode="email" />
            </label>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Contraseña</span>
              <div style={{ position: 'relative' }}>
                <input required type={showPass ? 'text' : 'password'} minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" style={{ ...inputStyle, paddingRight: '4.5rem' }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12, fontWeight: 700, color: '#1F5B42', padding: '4px 6px',
                  }}>
                  {showPass ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </label>

            <button type="submit" disabled={pending} style={{
              background: '#1F5B42', color: '#EEF5F0', border: 'none',
              fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 16,
              padding: '16px 0', borderRadius: 13, cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.7 : 1, transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#17452F'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1F5B42'; }}
            >{pending ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>

            <p style={{ fontSize: 12, color: 'var(--pub-dim)', margin: 0, textAlign: 'center', lineHeight: 1.55 }}>
              Al {mode === 'login' ? 'entrar' : 'crear tu cuenta'} aceptás los{' '}
              <a href="/terminos" style={{ color: '#1F5B42', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2 }}>Términos y Condiciones</a>
              {' '}y la{' '}
              <a href="/terminos#privacidad" style={{ color: '#1F5B42', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2 }}>Política de Privacidad</a>.
            </p>
          </form>

          <div style={{
            background: 'var(--pub-green-bg)', borderRadius: 12, padding: '14px 18px', marginTop: 22,
            fontSize: '13.5px', color: 'var(--pub-green-ink)', display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ color: '#1F5B42', display: 'flex', marginTop: 1, flexShrink: 0 }}><IconLock size={15} /></span>
            <span><strong>Tus datos nunca se muestran en el sitio.</strong> Las publicaciones son anónimas — los interesados siempre contactan a través de A&A.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  return (
    <QueryProvider>
      <AuthInner />
    </QueryProvider>
  );
}
