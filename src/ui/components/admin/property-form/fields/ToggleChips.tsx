import type { ComponentType } from 'react';
import { IconCheck } from '../../../shared/rs-icons';
import { useAdminTheme } from '../theme';

export interface ChipOption<T extends string> {
  key: T;
  label: string;
  Icon?: ComponentType<{ size?: number }>;
}

interface Props<T extends string> {
  legend: string;
  hint?: string;
  options: ChipOption<T>[];
  /** Consulta en vez de un mapa suelto: así el llamador pasa su propio estado
   *  tipado sin que este componente exija una firma de índice. */
  isOn: (key: T) => boolean;
  onToggle: (key: T, next: boolean) => void;
}

/** Interruptores tipo chip. El tilde es SVG, no el carácter "✓". */
export function ToggleChips<T extends string>({ legend, hint, options, isOn: isOnKey, onToggle }: Props<T>) {
  const t = useAdminTheme();

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontSize: 13.5, fontWeight: 600, color: t.text, marginBottom: hint ? 4 : 8, padding: 0 }}>
        {legend}
      </legend>
      {hint && <div style={{ fontSize: 12.5, color: t.textDim, marginBottom: 8 }}>{hint}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(({ key, label, Icon }) => {
          const on = isOnKey(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key, !on)}
              aria-pressed={on}
              className="admin-chip"
              style={{
                border: `1.5px solid ${on ? t.ok : t.border}`,
                background: on ? (t.isDark ? 'rgba(74,124,89,0.15)' : '#E8F0EA') : 'transparent',
                color: on ? t.ok : t.textMuted,
              }}
            >
              {on ? <IconCheck size={15} /> : Icon ? <Icon size={15} /> : null}
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
