import { forwardRef } from 'react';
import { IconVideo, IconChevronRight } from '../../shared/rs-icons';
import { WhatsAppIcon } from '../../shared/Icon';
import type { Property } from '../../../../core/domain/entities/types';
import { AgendarVisita } from './AgendarVisita';
import { F_ARCHIVO } from './tokens';
import { useCurrency, priceParts } from '../../../hooks/useCurrency';

interface Props {
  property: Property;
  phone: string;
  onConsultar: () => void;
}

/** Columna derecha: agendar visita + contacto directo + tour en video. */
export const FichaSidebar = forwardRef<HTMLDivElement, Props>(
  function FichaSidebar({ property, phone, onConsultar }, agendaRef) {
    const [currency] = useCurrency();
    const { main, alt } = priceParts(property.discount_price ?? property.price, property.currency, currency);
    return (
      <aside className="ficha-sidebar" style={{
        position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div ref={agendaRef}>
          <AgendarVisita property={property} phone={phone} header={
            <div className="fx-side-price">
              <div className="fx-side-price__main">{main}</div>
              <div className="fx-side-price__alt">{alt}</div>
            </div>
          } />
        </div>

        <div style={{ background: '#111113', borderRadius: 20, padding: 24, color: '#FAF8F3' }}>
          <div style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', marginBottom: 6 }}>
            ¿Tenés preguntas sobre esta propiedad?
          </div>
          <div style={{ fontSize: '13.5px', color: '#B9B9C0', marginBottom: 16 }}>
            Nuestro equipo responde en minutos, de lunes a sábado.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onConsultar} className="ficha-cta ficha-cta--wa" style={{ flex: 1 }}>
              <WhatsAppIcon size={13} color="#0A3D22" /> Consultar
            </button>
            <a href={`tel:+${phone.replace(/\D/g, '')}`} className="ficha-cta ficha-cta--call" style={{ flex: 1 }}>
              Llamar ahora
            </a>
          </div>
        </div>

        <div style={{
          background: 'var(--pub-green-bg)', border: '1px solid var(--pub-green-border)',
          borderRadius: 14, padding: '16px 18px', fontSize: 13,
          color: 'var(--pub-green-ink)', lineHeight: 1.55,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <IconVideo size={14} /> ¿Estás en Estados Unidos?
          </span>{' '}
          Pedí un tour en video por WhatsApp y te enviamos los documentos escaneados.{' '}
          <button onClick={onConsultar} style={{
            fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2,
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pub-green-ink)',
            fontFamily: 'inherit', fontSize: 13, padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>Solicitar tour <IconChevronRight size={12} /></button>
        </div>
      </aside>
    );
  }
);
