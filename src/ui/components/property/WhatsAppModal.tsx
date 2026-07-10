import { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { WhatsAppButton } from '../shared/WhatsAppButton';
import { Icon } from '../shared/Icon';
import { useCreateLead } from '../../hooks/useLeads';
import { formatPrice, type Property } from '../../../core/domain/entities/types';
import { QueryProvider } from '../../providers/QueryProvider';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { useSettings } from '../../hooks/useSettings';

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

function WhatsAppModalInner({ open: propOpen, onClose: propOnClose, property: propProperty }: Props) {
  const [isOpen, setIsOpen] = useState(propOpen);
  const [activeProperty, setActiveProperty] = useState<Property | null>(propProperty || null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [stage, setStage] = useState<'form' | 'success'>('form');
  const [focusedField, setFocusedField] = useState<'name' | 'email' | null>(null);
  const createLead = useCreateLead();
  const { data: settings } = useSettings();

  useEffect(() => {
    setIsOpen(propOpen);
  }, [propOpen]);

  useEffect(() => {
    setActiveProperty(propProperty || null);
  }, [propProperty]);

  useEffect(() => {
    if (isOpen) {
      setStage('form');
      setForm({ name: '', email: '' });
      setFocusedField(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ property?: Property | null }>;
      setActiveProperty(customEvent.detail?.property || null);
      setIsOpen(true);
    };
    window.addEventListener('open-whatsapp-modal', handleOpen);
    return () => window.removeEventListener('open-whatsapp-modal', handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (propOnClose) propOnClose();
  };

  if (!isOpen) return null;

  const valid = form.name.trim().length > 2 && /^.+@.+\..+$/.test(form.email);

  const handleSubmit = () => {
    createLead.mutate({
      name: form.name,
      email: form.email,
      property_id: activeProperty?.id,
      property_title: activeProperty?.title,
    });

    const phone = settings?.whatsapp_phone || '50499383699';
    const propertyUrl = activeProperty ? `https://www.aabienes.com/propiedad/${activeProperty.id}` : '';
    const text = activeProperty
      ? `Hola A&A Inmobiliaria, estoy interesado en la propiedad: "${activeProperty.title}" (${propertyUrl}). Mi nombre es ${form.name}.`
      : `Hola A&A Inmobiliaria, me gustaría obtener más información sobre sus propiedades. Mi nombre es ${form.name}.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    setStage('success');
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      style={{
        background: 'rgba(10,10,11,0.65)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--main-card-bg, #FFFFFF)',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          border: '1px solid var(--main-border, #E6E0D2)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          aria-label="Cerrar modal"
        >
          <Icon name="close" size={16} color="var(--main-text-dim, #5A5A63)" />
        </button>

        {stage === 'form' ? (
          <>
            <div>
              {/* Eyebrow */}
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#D4B254',
                marginBottom: '0.5rem',
              }}>
                Conexión Inmediata
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--main-text, #111113)',
                margin: '0 0 0.5rem 0',
              }}>
                Chatea con un Asesor
              </h2>

              {/* Description */}
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--main-text-muted, #5A5A63)',
                margin: 0,
              }}>
                Ingresa tu información para brindarte una asesoría personalizada y directa sobre financiamiento y disponibilidad. En segundos te conectaremos.
              </p>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--main-text-dim, #5A5A63)' }}>
                  Nombre completo
                </span>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'name' ? '#D4B254' : 'var(--main-text-dim, #9A9383)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    transition: 'color 0.2s',
                  }}>
                    <Icon name="users" size={16} color="currentColor" />
                  </div>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="María Elena Zúñiga"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      border: `1px solid ${focusedField === 'name' ? '#D4B254' : 'var(--main-border, #C9C2B1)'}`,
                      borderRadius: '8px',
                      fontSize: '15px',
                      color: 'var(--main-text, #111113)',
                      outline: 'none',
                      background: 'var(--main-bg, #fff)',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(212,178,84,0.15)' : 'none',
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--main-text-dim, #5A5A63)' }}>
                  Correo electrónico
                </span>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'email' ? '#D4B254' : 'var(--main-text-dim, #9A9383)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    transition: 'color 0.2s',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="usted@correo.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      border: `1px solid ${focusedField === 'email' ? '#D4B254' : 'var(--main-border, #C9C2B1)'}`,
                      borderRadius: '8px',
                      fontSize: '15px',
                      color: 'var(--main-text, #111113)',
                      outline: 'none',
                      background: 'var(--main-bg, #fff)',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(212,178,84,0.15)' : 'none',
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </label>
            </div>

            {/* Property preview card */}
            {activeProperty && (
              <div style={{
                display: 'flex',
                gap: 12,
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--main-bg, #FAF8F3)',
                border: '1px solid var(--main-border, #E6E0D2)',
                alignItems: 'center',
              }}>
                {activeProperty.images && activeProperty.images.length > 0 && (
                  <img
                    src={optimizeCloudinaryUrl(activeProperty.images[0].url, 120)}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid var(--main-border, rgba(0,0,0,0.06))',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4B254', marginBottom: 2 }}>
                    Consultando sobre
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--main-text, #111113)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeProperty.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--main-text-muted, #5A5A63)' }}>
                      {activeProperty.municipio}, {activeProperty.departamento}
                    </span>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--main-text, #111113)', fontWeight: 850 }}>
                      {formatPrice(activeProperty.discount_price ?? activeProperty.price, activeProperty.currency)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Legal / CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <WhatsAppButton
                onClick={handleSubmit}
                size="lg"
                variant="solid"
                fullWidth
                disabled={!valid}
                label="Iniciar chat de WhatsApp"
                borderRadius="8px"
              />
              <p style={{
                fontSize: '11px',
                lineHeight: 1.4,
                color: 'var(--main-text-dim, #9A9383)',
                textAlign: 'center',
                margin: 0,
              }}>
                Tu privacidad es lo primero. Solo usaremos estos datos para coordinar tu asesoría.
              </p>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-aa-success-bg, #E8F0EA)',
              color: 'var(--color-aa-success, #4A7C59)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--main-text, #111113)',
                margin: '0 0 0.5rem 0',
              }}>
                ¡Todo listo!
              </h2>
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--main-text-muted, #5A5A63)',
                margin: 0,
              }}>
                Hemos abierto WhatsApp con un mensaje pre-configurado para que puedas enviar tu consulta al instante. Un asesor te responderá a la brevedad.
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={handleClose} style={{ width: '100%', borderRadius: '8px' }}>
              Entendido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WhatsAppModal(props: Props) {
  return (
    <QueryProvider>
      <WhatsAppModalInner {...props} />
    </QueryProvider>
  );
}
