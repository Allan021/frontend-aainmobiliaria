/**
 * Props que Astro inyecta en componentes isla (React/Svelte/Vue/etc).
 * Extiende la interfaz de Props de cualquier componente que se use
 * con directivas `client:*` en una página .astro.
 *
 * Uso:
 *   export interface MyComponentProps extends AstroIslandProps { ... }
 */
export interface AstroIslandProps {
  'client:load'?: boolean;
  'client:only'?: string;
  'client:idle'?: boolean;
  'client:visible'?: boolean | { rootMargin?: string };
  'client:media'?: string;
}
