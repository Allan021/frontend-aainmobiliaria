import type { ComponentType } from 'react';
import { useAdminTheme } from '../theme';

export interface Choice<T extends string> {
  value: T;
  label: string;
  hint: string;
  Icon: ComponentType<{ size?: number }>;
}

interface Props<T extends string> {
  legend: string;
  choices: Choice<T>[];
  value: T;
  onChange: (v: T) => void;
}

/**
 * Elección visual con icono y explicación, en vez de pestañas con jerga.
 * Antes eran tabs "propiedad / lote / lotificacion": nadie sin contexto sabe
 * cuál le toca, y la elección cambiaba en silencio lo que se guardaba.
 */
export function ChoiceCards<T extends string>({ legend, choices, value, onChange }: Props<T>) {
  const t = useAdminTheme();

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontSize: 13.5, fontWeight: 600, color: t.text, marginBottom: 8, padding: 0 }}>
        {legend}
      </legend>
      <div className="choice-cards">
        {choices.map(({ value: v, label, hint, Icon }) => {
          const on = v === value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={on}
              className="choice-card"
              style={{
                border: `2px solid ${on ? t.accent : t.border}`,
                background: on ? (t.isDark ? 'rgba(127,181,150,0.10)' : '#EEF5F0') : t.surface,
                color: on ? t.accent : t.textMuted,
              }}
            >
              <Icon size={24} />
              <span style={{ fontSize: 14, fontWeight: 700, color: on ? t.accent : t.text }}>{label}</span>
              <span style={{ fontSize: 12, color: t.textDim, lineHeight: 1.4 }}>{hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
