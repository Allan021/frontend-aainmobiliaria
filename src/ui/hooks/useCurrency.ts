import { useEffect, useState } from 'react';

/** Tipo de cambio de referencia L/USD (aprox., solo para precio alternativo) */
export const HNL_PER_USD = 26.5;

export type Currency = 'L' | 'USD';

function stored(): Currency {
  if (typeof window === 'undefined') return 'L';
  return (localStorage.getItem('aa_currency') as Currency) || 'L';
}

/** Moneda global de visualización — sincronizada entre islas React via CustomEvent */
export function useCurrency(): [Currency, () => void] {
  const [cur, setCur] = useState<Currency>(stored);

  useEffect(() => {
    const onChange = () => setCur(stored());
    window.addEventListener('aa-currency', onChange);
    return () => window.removeEventListener('aa-currency', onChange);
  }, []);

  const toggle = () => {
    const next = stored() === 'L' ? 'USD' : 'L';
    localStorage.setItem('aa_currency', next);
    window.dispatchEvent(new CustomEvent('aa-currency'));
  };

  return [cur, toggle];
}

/** Convierte el precio de la propiedad (en su moneda propia) a L y USD */
function toBoth(price: number, propCurrency: string): { lps: number; usd: number } {
  if (propCurrency === '$' || propCurrency === 'USD') {
    return { lps: Math.round(price * HNL_PER_USD), usd: price };
  }
  return { lps: price, usd: Math.round(price / HNL_PER_USD) };
}

export function fmtLps(lps: number): string {
  if (lps >= 1_000_000) {
    const m = lps / 1_000_000;
    return `L ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)} M`;
  }
  return `L ${lps.toLocaleString('es-HN')}`;
}

export function fmtUsd(usd: number): string {
  return `$ ${usd.toLocaleString('en-US')}`;
}

/** Precio principal + alternativo según la moneda de visualización */
export function priceParts(price: number, propCurrency: string, display: Currency): { main: string; alt: string } {
  const { lps, usd } = toBoth(price, propCurrency);
  return display === 'USD'
    ? { main: fmtUsd(usd), alt: fmtLps(lps) }
    : { main: fmtLps(lps), alt: `≈ ${fmtUsd(usd)}` };
}

/** Formato corto para pins del mapa: "L 680K", "L 2.45M", "$26K" */
export function shortPrice(price: number, propCurrency: string, display: Currency): string {
  const { lps, usd } = toBoth(price, propCurrency);
  if (display === 'USD') {
    return usd >= 1000 ? `$${Math.round(usd / 1000)}K` : `$${usd}`;
  }
  if (lps >= 1_000_000) return `L ${(lps / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  return `L ${Math.round(lps / 1000)}K`;
}
