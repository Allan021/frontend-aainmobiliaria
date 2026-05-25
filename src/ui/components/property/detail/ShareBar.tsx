import { useState } from 'react';
import { WhatsAppIcon } from '../../shared/Icon';
import type { Property } from '../../../../core/domain/entities/types';

interface ShareBarProps {
  property: Property;
}

export function ShareBar({ property }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined'
    ? window.location.href
    : `https://www.aabienes.com/propiedad/${property.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waShare = () => {
    const text = encodeURIComponent(`${property.title} — A&A Inmobiliaria\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: property.title, url }).catch(() => {});
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <button
        onClick={copyLink}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0.4rem 0.75rem', borderRadius: 8,
          background: copied ? '#F0FDF4' : 'var(--main-bg, #F3EFE6)',
          border: copied ? '1px solid #86EFAC' : '1px solid var(--main-border, #E6E0D2)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.8125rem', fontWeight: 600,
          color: copied ? '#166534' : 'var(--main-text, #111113)',
          transition: 'all 0.2s',
        }}
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        {copied ? '¡Copiado!' : 'Copiar enlace'}
      </button>

      <button
        onClick={waShare}
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: '#F0FDF4', border: '1px solid #86EFAC',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Compartir por WhatsApp"
      >
        <WhatsAppIcon size={16} />
      </button>

      {hasNativeShare && (
        <button
          onClick={nativeShare}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--main-bg, #F3EFE6)', border: '1px solid var(--main-border, #E6E0D2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Compartir"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--main-text-dim, #5A5A63)" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      )}
    </div>
  );
}
