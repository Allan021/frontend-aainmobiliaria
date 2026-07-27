import { IconMic, IconStopCircle } from '../../../shared/rs-icons';
import { useAdminTheme } from '../theme';

interface Props {
  listening: boolean;
  onToggle: () => void;
}

/** Botón de dictado. Rojo mientras escucha para que se vea que el micrófono está abierto. */
export function MicButton({ listening, onToggle }: Props) {
  const t = useAdminTheme();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={listening}
      aria-label={listening ? 'Dejar de dictar' : 'Dictar por voz'}
      className={`mic-btn${listening ? ' is-listening' : ''}`}
      style={{
        borderColor: listening ? '#8C3A2E' : t.border,
        background: listening ? '#8C3A2E' : t.surface,
        color: listening ? '#FFFFFF' : t.textMuted,
      }}
    >
      {listening ? <IconStopCircle size={17} /> : <IconMic size={17} />}
      {listening ? 'Detener' : 'Dictar'}
    </button>
  );
}
