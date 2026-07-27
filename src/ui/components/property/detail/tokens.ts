// Las tres familias estaban redeclaradas en cada componente de la ficha.
export const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
export const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
export const F_MONO = "'JetBrains Mono', monospace";

export const VERDE = '#1F5B42';
export const VERDE_CLARO = '#4A7C59';
export const TERRACOTA = '#C65D3B';

export const PHONE_FALLBACK = '50499383699';

export function waLink(phone: string, msg: string) {
  const num = phone.replace(/\D/g, '');
  return `https://wa.me/${num.startsWith('504') ? num : '504' + num}?text=${encodeURIComponent(msg)}`;
}
