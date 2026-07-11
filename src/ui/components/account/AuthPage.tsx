import { useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { IconLock } from '../shared/rs-icons';

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
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const error = (mode === 'login' ? login.error : register.error) as Error | null;

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

          {error && (
            <div style={{
              background: '#F9EBE7', color: '#8C3A2E', border: '1px solid #EBD2CB',
              borderRadius: 11, padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, marginBottom: 18,
            }} role="alert">
              {error.message}
            </div>
          )}

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
