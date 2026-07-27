import { useEffect, useState } from 'react';

// Leaflet se cargaba con este mismo bloque copiado en MapView, LocationPicker
// y el mapa de la ficha. Acá una sola vez.
//
// La promesa arranca al evaluar el módulo, no dentro de un efecto: así el chunk
// baja en paralelo con la hidratación de React en vez de esperarla.
// Guardada por `window` porque Astro también renderiza estas islas en el server.
const ready = typeof window === 'undefined' ? null : Promise.all([
  import('leaflet').then(m => m.default),
  import('leaflet/dist/leaflet.css?inline').then(m => m.default),
]);

let cssInjected = false;

function injectCss(css: string) {
  if (cssInjected || document.getElementById('leaflet-css')) { cssInjected = true; return; }
  const style = document.createElement('style');
  style.id = 'leaflet-css';
  style.textContent = css;
  document.head.appendChild(style);
  cssInjected = true;
}

/**
 * Devuelve el módulo de Leaflet una vez cargado (null mientras tanto).
 * `enabled: false` posterga la carga — se usa para no bajar el mapa de la ficha
 * hasta que se acerca al viewport.
 */
export function useLeaflet(enabled = true) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    if (!enabled || !ready || L) return;
    let cancelled = false;
    ready.then(([mod, css]) => {
      if (cancelled) return;
      injectCss(css);
      setL(mod);
    });
    return () => { cancelled = true; };
  }, [enabled, L]);

  return L;
}

/** Observa un elemento y avisa cuando se acerca al viewport. */
export function useNearViewport(ref: React.RefObject<HTMLElement | null>, margin = '400px') {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: margin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin, near]);

  return near;
}
