import { useState } from 'react';

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

interface Props {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  m?: M;
}

const DARK: M = {
  mainBg: '#111113', mainSurface: '#1A1A1D', mainBorder: '#26262B',
  mainText: '#FAF8F3', mainTextMuted: '#9A9383', mainTextDim: '#6B6459',
  mainCardBg: '#16161A', mainTopbarBg: '#111113',
};

export function ConfirmModal({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel, m: mProp }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const m = mProp || DARK;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch {
      setError('No se pudo completar la acción. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes cmSlideIn{from{opacity:0;transform:scale(.95) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div
        onClick={loading ? undefined : onCancel}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: m.mainBg, borderRadius: '1rem', padding: '1.75rem',
            width: '100%', maxWidth: '400px',
            border: `1px solid ${m.mainBorder}`,
            boxShadow: '0 32px 64px rgba(0,0,0,0.48)',
            animation: 'cmSlideIn 0.18s ease-out',
          }}
        >
          {/* Trash icon */}
          <div style={{
            width: 44, height: 44, borderRadius: '0.75rem', marginBottom: '1rem',
            background: 'rgba(140,58,46,0.12)', border: '1px solid rgba(140,58,46,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C44B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>

          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: m.mainText, marginBottom: '0.375rem', lineHeight: 1.3 }}>
            {title}
          </h3>

          {message && (
            <p style={{ fontSize: '0.8125rem', color: m.mainTextMuted, lineHeight: 1.65, margin: '0 0 1.25rem' }}>
              {message}
            </p>
          )}

          {!message && <div style={{ marginBottom: '1.25rem' }} />}

          {error && (
            <div style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem', marginBottom: '1rem',
              background: 'rgba(140,58,46,0.1)', border: '1px solid rgba(196,75,58,0.3)',
              fontSize: '0.8125rem', color: '#C44B3A',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1, padding: '0.6875rem 1rem', borderRadius: '0.5rem',
                border: `1px solid ${m.mainBorder}`, background: m.mainSurface,
                color: m.mainTextMuted, fontSize: '0.875rem', fontWeight: 600,
                cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: '0.6875rem 1rem', borderRadius: '0.5rem',
                border: 'none',
                background: loading ? 'rgba(140,58,46,0.55)' : '#8C3A2E',
                color: '#FAF8F3', fontSize: '0.875rem', fontWeight: 600,
                cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Eliminando…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
