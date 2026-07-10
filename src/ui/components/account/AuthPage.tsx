import { useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { IconHome } from '../shared/rs-icons';

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
      minHeight: 'calc(100vh - 80px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(160deg, var(--color-pine-800, #103627) 0%, var(--color-pine-600, #1F5B42) 100%)',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--main-card-bg, #fff)',
        borderRadius: 20, padding: '2.25rem',
        boxShadow: '0 32px 64px -24px rgba(10,40,29,0.5)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 16,
          background: 'var(--color-pine-50, #EEF5F0)', color: 'var(--color-pine-600, #1F5B42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconHome size={22} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--main-text, #111113)', letterSpacing: '-0.02em', margin: 0 }}>
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Cree su cuenta'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--main-text-dim, #9A9383)', marginTop: 6, marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {mode === 'login'
            ? 'Acceda para guardar favoritos y publicar propiedades.'
            : 'Guarde favoritos, publique su propiedad y agende visitas.'}
        </p>

        {/* Tabs */}
        <div role="tablist" aria-label="Modo de acceso" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
          background: 'var(--main-bg, #F3EFE6)', borderRadius: 12, padding: 4, marginBottom: '1.5rem',
        }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} type="button" style={{
              padding: '0.625rem', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.8125rem', fontWeight: 700,
              background: mode === m ? 'var(--color-pine-600, #1F5B42)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--main-text-muted, #5A5A63)',
              transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {error && <div className="rs-alert rs-alert--error" role="alert" style={{ marginBottom: 14 }}>{error.message}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label className="rs-label" htmlFor="auth-name">Nombre</label>
              <input id="auth-name" className="rs-input" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Ej: Juan Pérez" autoComplete="name" />
            </div>
          )}
          <div>
            <label className="rs-label" htmlFor="auth-email">Correo electrónico</label>
            <input id="auth-email" className="rs-input" required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com" autoComplete="email" inputMode="email" />
          </div>
          <div>
            <label className="rs-label" htmlFor="auth-pass">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input id="auth-pass" className="rs-input" required type={showPass ? 'text' : 'password'} minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" style={{ paddingRight: '4.25rem' }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.71875rem', fontWeight: 700, color: 'var(--color-pine-600, #1F5B42)',
                  padding: '0.25rem 0.375rem',
                }}>
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={pending} className="rs-btn rs-btn--primary" style={{ marginTop: 4, padding: '0.9375rem', fontSize: '0.9375rem' }}>
            {pending ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'var(--main-text-dim, #9A9383)', marginTop: '1.25rem', lineHeight: 1.55, textAlign: 'center' }}>
          Sus publicaciones son anónimas: los interesados siempre contactan a través de A&A Inmobiliaria.
        </p>
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
