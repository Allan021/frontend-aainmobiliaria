import { IconCheck } from '../../shared/rs-icons';
import { useAdminTheme } from './theme';
import { STEPS } from './types';

interface Props {
  current: number;
  furthest: number;
  onGoTo: (index: number) => void;
}

/** Progreso del alta. Deja volver a cualquier paso ya visitado — nunca
 *  saltar adelante, para que el orden guíe a quien no sabe qué sigue. */
export function StepNav({ current, furthest, onGoTo }: Props) {
  const t = useAdminTheme();

  return (
    <nav aria-label="Progreso" className="step-nav">
      <ol>
        {STEPS.map((step, i) => {
          const activo = i === current;
          const hecho = i < furthest;
          const alcanzable = i <= furthest;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => alcanzable && onGoTo(i)}
                disabled={!alcanzable}
                aria-current={activo ? 'step' : undefined}
                className="step-nav__item"
                style={{
                  color: activo ? t.accent : hecho ? t.textMuted : t.textDim,
                  fontWeight: activo ? 700 : 600,
                  cursor: alcanzable ? 'pointer' : 'default',
                }}
              >
                <span
                  className="step-nav__dot"
                  style={{
                    background: activo ? t.accent : hecho ? t.ok : 'transparent',
                    borderColor: activo ? t.accent : hecho ? t.ok : t.border,
                    color: activo || hecho ? '#FFFFFF' : t.textDim,
                  }}
                >
                  {hecho ? <IconCheck size={12} /> : i + 1}
                </span>
                <span className="step-nav__label">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
