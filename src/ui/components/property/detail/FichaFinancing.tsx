import { useState } from 'react';
import { fmtUsd, HNL_PER_USD, type Currency } from '../../../hooks/useCurrency';
import type { Property } from '../../../../core/domain/entities/types';
import { F_ARCHIVO, VERDE } from './tokens';

interface Props {
  property: Property;
  currency: Currency;
}

/** Simulador de cuota. Estimación sin intereses — se aclara al pie. */
export function FichaFinancing({ property, currency }: Props) {
  const [prima, setPrima] = useState(20);
  const [plazo, setPlazo] = useState(8);

  const base = property.discount_price ?? property.price;
  const esUsd = currency === 'USD';
  const baseMostrado = esUsd
    ? (property.currency === '$' ? base : Math.round(base / HNL_PER_USD))
    : (property.currency === '$' ? Math.round(base * HNL_PER_USD) : base);

  const cuota = Math.round((baseMostrado * (1 - prima / 100)) / (plazo * 12));
  const montoPrima = Math.round(baseMostrado * (prima / 100));
  const cuotaTexto = esUsd ? `${fmtUsd(cuota)}/mes` : `L ${cuota.toLocaleString('es-HN')}/mes`;
  const primaTexto = esUsd ? fmtUsd(montoPrima) : `L ${montoPrima.toLocaleString('es-HN')}`;

  return (
    <>
      <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '32px 0 12px' }}>
        Financiamiento estimado
      </h3>
      <div style={{
        background: 'var(--pub-surface)', border: '1px solid var(--pub-border)',
        borderRadius: 14, padding: 22,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap', marginBottom: 18,
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--pub-muted)', fontWeight: 600 }}>Cuota mensual estimada</div>
            <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 28, color: VERDE }}>{cuotaTexto}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--pub-muted)', textAlign: 'right' }}>
            Prima {prima}% ({primaTexto})<br />
            Plazo {plazo} {plazo === 1 ? 'año' : 'años'} · propiedades elegibles
          </div>
        </div>

        <div className="ficha-sliders" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--pub-muted2)', display: 'block' }}>
            Prima: {prima}%
            <input type="range" min={20} max={50} step={5} value={prima}
              onChange={e => setPrima(Number(e.target.value))}
              style={{ width: '100%', accentColor: VERDE, marginTop: 6 }}
              aria-label="Porcentaje de prima" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--pub-muted2)', display: 'block' }}>
            Plazo: {plazo} {plazo === 1 ? 'año' : 'años'}
            <input type="range" min={1} max={8} step={1} value={plazo}
              onChange={e => setPlazo(Number(e.target.value))}
              style={{ width: '100%', accentColor: VERDE, marginTop: 6 }}
              aria-label="Plazo en años" />
          </label>
        </div>

        <div style={{ fontSize: 12, color: 'var(--pub-dim)', marginTop: 14 }}>
          Estimación sin intereses de referencia. El plan final se confirma con nuestro equipo según la propiedad.
        </div>
      </div>
    </>
  );
}
