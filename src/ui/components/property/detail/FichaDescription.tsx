import { IconCheck, IconShield } from '../../shared/rs-icons';
import { parseDescription, type Property } from '../../../../core/domain/entities/types';
import { F_ARCHIVO, VERDE, VERDE_CLARO } from './tokens';

/** Descripción con formato + bloque de verificación. */
export function FichaDescription({ property }: { property: Property }) {
  const bloques = parseDescription(property.description);

  const verificaciones = [
    property.has_deed ? 'Escritura revisada en el Instituto de la Propiedad' : null,
    'Libre de gravámenes y anotaciones',
    'Medidas confirmadas en sitio',
    'Vendedor con identidad verificada',
  ].filter((t): t is string => !!t);

  return (
    <>
      <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '28px 0 12px' }}>
        Sobre esta propiedad
      </h3>

      {bloques.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bloques.map((b, i) => {
            if (b.type === 'heading') {
              return (
                <div key={i} style={{
                  fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 14.5, color: 'var(--pub-ink)',
                  letterSpacing: '-0.01em', margin: i === 0 ? '0 0 8px' : '18px 0 8px',
                }}>{b.text.replace(/:$/, '')}</div>
              );
            }
            if (b.type === 'bullet') {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '3px 0' }}>
                  <span style={{ color: VERDE_CLARO, display: 'flex', marginTop: 3, flexShrink: 0 }}>
                    <IconCheck size={14} />
                  </span>
                  <span style={{ fontSize: '15px', lineHeight: 1.55, color: 'var(--pub-muted2)' }}>{b.text}</span>
                </div>
              );
            }
            return (
              <p key={i} style={{ fontSize: '15.5px', lineHeight: 1.7, color: 'var(--pub-muted2)', margin: '6px 0' }}>
                {b.text}
              </p>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: '15.5px', color: 'var(--pub-dim)', margin: 0 }}>
          Consultá los detalles por WhatsApp.
        </p>
      )}

      <div style={{
        background: 'var(--pub-green-bg)', border: '1px solid var(--pub-green-border)',
        borderRadius: 14, padding: '20px 22px', marginTop: 28,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 15, color: VERDE, marginBottom: 12,
        }}>
          <IconShield size={17} /> Verificado por A&A Inmobiliaria
        </div>
        <div className="ficha-verify-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          fontSize: 14, color: 'var(--pub-green-ink)',
        }}>
          {verificaciones.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 7 }}>
              <span style={{ color: VERDE_CLARO, display: 'flex', marginTop: 3 }}><IconCheck size={13} /></span>{t}
            </span>
          ))}
        </div>
        <div style={{
          fontSize: 13, color: VERDE_CLARO, marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--pub-green-border)',
        }}>
          Publicado vía A&A · Los datos del propietario permanecen privados.
          Toda visita y negociación se coordina con nuestro equipo.
        </div>
      </div>
    </>
  );
}
