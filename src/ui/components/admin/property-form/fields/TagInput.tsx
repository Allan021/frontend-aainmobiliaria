import { useId, useState } from 'react';
import { IconX } from '../../../shared/rs-icons';
import { FieldShell } from './FieldShell';
import { useAdminTheme } from '../theme';

interface Props {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  max?: number;
  placeholder?: string;
}

/** Lista de etiquetas cortas. Agregar con Enter o con el botón — antes solo
 *  existía Enter y no se avisaba, así que en móvil no había forma de agregar. */
export function TagInput({ label, hint, values, onChange, max = 6, placeholder }: Props) {
  const t = useAdminTheme();
  const id = useId();
  const [draft, setDraft] = useState('');
  const full = values.length >= max;

  const add = () => {
    const v = draft.trim();
    if (!v || full || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      {values.length > 0 && (
        <ul style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, listStyle: 'none', padding: 0 }}>
          {values.map((v, i) => (
            <li key={`${v}-${i}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              border: `1px solid ${t.border}`, borderRadius: 999, padding: '4px 4px 4px 12px',
              fontSize: 12.5, fontWeight: 600, color: t.textMuted,
            }}>
              {v}
              <button
                type="button"
                aria-label={`Quitar ${v}`}
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="admin-icon-btn admin-icon-btn--sm"
                style={{ color: t.textDim }}
              >
                <IconX size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id={id}
          className="admin-input"
          value={draft}
          disabled={full}
          placeholder={full ? `Máximo ${max}` : placeholder}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} disabled={full || !draft.trim()} className="admin-btn admin-btn--ghost">
          Agregar
        </button>
      </div>
    </FieldShell>
  );
}
