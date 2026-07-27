import type { ReactNode } from 'react';
import { useAdminTheme } from '../theme';

interface Props {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Etiqueta + ayuda + error alrededor de cualquier control.
 * Las etiquetas del admin viejo eran 11px en MAYÚSCULAS con tracking 0.1em:
 * bajo el piso legible y el peor formato para leer rápido. Acá 13px normal.
 */
export function FieldShell({ label, hint, error, required, htmlFor, children }: Props) {
  const t = useAdminTheme();

  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: t.text, marginBottom: 5 }}
      >
        {label}
        {required && <span style={{ color: t.danger, marginLeft: 3 }} aria-hidden="true">*</span>}
      </label>

      {hint && (
        <div style={{ fontSize: 12.5, color: t.textDim, marginBottom: 7, lineHeight: 1.45 }}>
          {hint}
        </div>
      )}

      {children}

      {/* El error va debajo del campo, no en un resumen lejano arriba */}
      {error && (
        <div role="alert" style={{ fontSize: 12.5, color: t.danger, fontWeight: 600, marginTop: 5 }}>
          {error}
        </div>
      )}
    </div>
  );
}
