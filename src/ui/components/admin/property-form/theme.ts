import { useEffect, useState } from 'react';

// Los colores del admin estaban recalculados dentro del componente en cada
// render. Acá una sola vez, y el observer de tema vive con ellos.

export interface AdminTheme {
  isDark: boolean;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  danger: string;
  ok: string;
}

// textDim era #9A9383: 3.1:1 sobre #FAF8F3, debajo del mínimo AA de 4.5:1
// (es el hallazgo de contraste de Lighthouse). #6E685D da 5.2:1.
const LIGHT: AdminTheme = {
  isDark: false,
  bg: '#FAF8F3', surface: '#FFFFFF', border: '#E6E0D2',
  text: '#111113', textMuted: '#5A5A63', textDim: '#6E685D',
  accent: '#1F5B42', danger: '#8C3A2E', ok: '#4A7C59',
};

const DARK: AdminTheme = {
  isDark: true,
  bg: '#111113', surface: '#1A1A1D', border: '#26262B',
  text: '#FAF8F3', textMuted: '#C9C2B1', textDim: '#8B8578',
  accent: '#7FB596', danger: '#D98878', ok: '#7FB596',
};

function read(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function useAdminTheme(): AdminTheme {
  const [isDark, setIsDark] = useState(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark ? DARK : LIGHT;
}
