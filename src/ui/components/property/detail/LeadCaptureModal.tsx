import { useState, useRef, useEffect } from 'react';

interface LeadCaptureModalProps {
  open: boolean;
  propertyTitle: string;
  onSubmit: (data: { name: string; email: string }) => void;
  onClose: () => void;
}

/**
 * Compact lead-capture modal that asks for name (required) and email (optional)
 * before redirecting to WhatsApp with a personalized message.
 */
export function LeadCaptureModal({ open, propertyTitle, onSubmit, onClose }: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-focus name input when modal opens
  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setError('');
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Ingrese su nombre para continuar');
      nameRef.current?.focus();
      return;
    }
    onSubmit({ name: trimmedName, email: email.trim() });
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    fontWeight: 500,
    border: '1.5px solid var(--main-border, #E6E0D2)',
    borderRadius: 12,
    background: 'var(--main-card-bg, #fff)',
    color: 'var(--main-text, #111113)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(10,10,11,0.5)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--main-card-bg, #fff)',
          borderRadius: 20,
          border: '1.5px solid var(--main-border, #E6E0D2)',
          boxShadow: '0 24px 64px -12px rgba(17,17,19,0.18), 0 8px 24px rgba(17,17,19,0.08)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{
              fontSize: '1.125rem', fontWeight: 700,
              color: 'var(--main-text, #111113)',
              lineHeight: 1.3, letterSpacing: '-0.02em',
            }}>
              ¿Cómo le contactamos?
            </div>
            <div style={{
              fontSize: '0.8125rem', color: 'var(--main-text-dim, #9A9383)',
              marginTop: 4, lineHeight: 1.4,
            }}>
              Será redirigido a WhatsApp con un mensaje personalizado
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--main-border, #E6E0D2)',
              background: 'var(--main-bg, #F3EFE6)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'var(--main-text-dim, #9A9383)', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Property pill */}
        <div style={{ padding: '0.875rem 1.5rem 0' }}>
          <div style={{
            padding: '0.5rem 0.75rem', borderRadius: 10,
            background: 'var(--main-bg, #FBF6E9)',
            border: '1px solid var(--main-border, #F2E4B8)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--sidebar-accent, #8C6F1C)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {propertyTitle}
            </span>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--main-text-dim, #9A9383)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'block', marginBottom: 6,
            }}>
              Nombre <span style={{ color: '#E53E3E' }}>*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              style={{
                ...inputStyle,
                borderColor: error ? '#E53E3E' : 'var(--main-border, #E6E0D2)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#D4B254'}
              onBlur={e => e.currentTarget.style.borderColor = error ? '#E53E3E' : 'var(--main-border, #E6E0D2)'}
              autoComplete="name"
            />
            {error && (
              <div style={{ fontSize: '0.75rem', color: '#E53E3E', marginTop: 4, fontWeight: 500 }}>
                {error}
              </div>
            )}
          </div>

          <div>
            <label style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--main-text-dim, #9A9383)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'block', marginBottom: 6,
            }}>
              Correo electrónico <span style={{ fontSize: '0.6875rem', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: 'var(--main-text-dim, #C9C2B1)' }}>(opcional)</span>
            </label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#D4B254'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--main-border, #E6E0D2)'}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Submit button */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button
            type="submit"
            style={{
              width: '100%', padding: '0.9375rem',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: '0.9375rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 16px rgba(37,211,102,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,211,102,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,211,102,0.25)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
            </svg>
            Continuar a WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}
