import { useId, useState } from 'react';
import { FieldShell } from './FieldShell';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  inputMode?: 'text' | 'numeric' | 'decimal';
  prefix?: string;
  /** Devuelve el mensaje de error, o null si está bien. Se corre al salir del campo. */
  validate?: (v: string) => string | null;
}

/**
 * Campo de texto. El foco usa la clase `.admin-input` con :focus-visible en CSS
 * — el admin viejo mutaba `e.target.style.borderColor` en línea, lo que borraba
 * el anillo de foco del navegador y dejaba ciego a quien navega con teclado.
 */
export function TextField({
  label, value, onChange, hint, placeholder, required,
  multiline, rows = 4, inputMode, prefix, validate,
}: Props) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Validación al salir del campo, no en cada tecla: corregir mientras se
  // escribe hace que el error parpadee antes de terminar de tipear.
  const handleBlur = () => {
    setTouched(true);
    if (validate) setError(validate(value));
  };

  const handleChange = (v: string) => {
    onChange(v);
    if (touched && validate) setError(validate(v));
  };

  const common = {
    id,
    value,
    placeholder,
    'aria-invalid': error ? true : undefined,
    onBlur: handleBlur,
    className: 'admin-input',
    style: prefix ? { paddingLeft: 34 } : undefined,
  };

  return (
    <FieldShell label={label} hint={hint} error={error || undefined} required={required} htmlFor={id}>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span aria-hidden="true" style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, fontWeight: 600, opacity: 0.55, pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        {multiline ? (
          <textarea {...common} rows={rows} onChange={e => handleChange(e.target.value)}
            style={{ ...common.style, resize: 'vertical' }} />
        ) : (
          <input {...common} inputMode={inputMode} onChange={e => handleChange(e.target.value)} />
        )}
      </div>
    </FieldShell>
  );
}
