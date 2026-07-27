import { useEffect, useRef, useState } from 'react';
import { IconX, IconChevronLeft, IconChevronRight, IconSpinner, IconCheck, IconTrash } from '../../shared/rs-icons';
import { ConfirmModal } from '../ConfirmModal';
import { useDeleteProperty } from '../../../hooks/useProperties';
import type { Property } from '../../../../core/domain/entities/types';
import { useAdminTheme } from './theme';
import { usePropertyForm } from './usePropertyForm';
import { usePropertySubmit } from './usePropertySubmit';
import { StepNav } from './StepNav';
import { StepAi } from './steps/StepAi';
import { StepBasics } from './steps/StepBasics';
import { StepLocation } from './steps/StepLocation';
import { StepPhotos } from './steps/StepPhotos';
import { StepReview } from './steps/StepReview';
import { STEPS } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

export function PropertyDrawer({ open, onClose, property }: Props) {
  const t = useAdminTheme();
  const f = usePropertyForm(property, open);
  const deleteProperty = useDeleteProperty();

  // Editar arranca en "Lo básico": el paso de IA solo tiene sentido al crear
  const primerPaso = property ? 1 : 0;
  const [step, setStep] = useState(primerPaso);
  const [furthest, setFurthest] = useState(primerPaso);
  const [housePreview, setHousePreview] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { submit, phase, busy, error } = usePropertySubmit({
    form: f.form, kind: f.kind, images: f.images, property, onDone: onClose,
  });

  useEffect(() => {
    if (!open) return;
    setStep(primerPaso);
    setFurthest(primerPaso);
    setHousePreview(property?.house_preview_url || null);
  }, [open, property, primerPaso]);

  // Al cambiar de paso el scroll vuelve arriba: si no, el paso nuevo aparece
  // a media altura y parece que no pasó nada.
  useEffect(() => { panelRef.current?.scrollTo({ top: 0 }); }, [step]);

  const irA = (i: number) => {
    setStep(i);
    setFurthest(prev => Math.max(prev, i));
  };

  const intentarCerrar = () => {
    if (f.dirty && !busy) { setConfirmClose(true); return; }
    onClose();
  };

  // Escape cierra, con la misma confirmación que la X
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') intentarCerrar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!open) return null;

  const esUltimo = step === STEPS.length - 1;
  const etiquetaGuardar = property ? 'Guardar cambios' : 'Publicar propiedad';

  const textoFase =
    phase.kind === 'uploading' ? `Subiendo foto ${phase.current} de ${phase.total}…`
    : phase.kind === 'posting' ? 'Publicando en Facebook…'
    : phase.kind === 'saving' ? 'Guardando…'
    : null;

  return (
    <div className="drawer-backdrop" onClick={intentarCerrar}>
      <div
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={property ? 'Editar propiedad' : 'Publicar propiedad'}
        onClick={e => e.stopPropagation()}
        // Los tokens van como custom properties para que admin-form.css pinte
        // los controles sin repetir estilos en línea en cada campo
        style={{
          background: t.bg,
          borderColor: t.border,
          '--admin-text': t.text,
          '--admin-text-muted': t.textMuted,
          '--admin-surface': t.surface,
          '--admin-border': t.border,
        } as React.CSSProperties}
      >
        <header className="drawer-panel__head" style={{ borderColor: t.border, background: t.bg }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
              {property ? 'Editar propiedad' : 'Publicar una propiedad'}
            </h2>
            <p style={{ fontSize: 13, color: t.textDim, margin: '3px 0 0' }}>
              Paso {step + 1} de {STEPS.length} · {STEPS[step].label}
            </p>
          </div>
          <button type="button" onClick={intentarCerrar} className="admin-icon-btn" aria-label="Cerrar">
            <IconX size={20} />
          </button>
        </header>

        <StepNav current={step} furthest={furthest} onGoTo={irA} />

        <div className="drawer-panel__body" ref={panelRef}>
          {f.draftFound && step === 0 && (
            <div className="draft-banner" style={{ borderColor: t.accent, background: t.isDark ? 'rgba(127,181,150,0.10)' : '#EEF5F0' }}>
              <span style={{ fontSize: 13.5, color: t.text, fontWeight: 600 }}>
                Tenés una propiedad a medio cargar.
              </span>
              <span style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="admin-btn admin-btn--primary" onClick={() => { f.restoreDraft(); irA(1); }}>
                  Seguir con esa
                </button>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={f.discardDraft}>
                  Empezar de cero
                </button>
              </span>
            </div>
          )}

          {step === 0 && (
            <StepAi
              onApply={(values, kind) => { f.patch(values); if (kind) f.setKind(kind); irA(1); }}
              onSkip={() => irA(1)}
            />
          )}
          {step === 1 && (
            <StepBasics form={f.form} set={f.set} patch={f.patch} kind={f.kind} setKind={f.setKind} />
          )}
          {step === 2 && (
            <StepLocation form={f.form} set={f.set} patch={f.patch} />
          )}
          {step === 3 && (
            <StepPhotos
              images={f.images}
              setImages={fn => { f.setImages(fn); f.setDirty(true); }}
              kind={f.kind}
              propertyId={property?.id}
              housePreviewUrl={housePreview}
              onHousePreview={setHousePreview}
            />
          )}
          {step === 4 && (
            <StepReview
              form={f.form} set={f.set} kind={f.kind} images={f.images}
              propertyId={property?.id} onGoToStep={irA}
            />
          )}
        </div>

        <footer className="drawer-panel__foot" style={{ borderColor: t.border, background: t.bg }}>
          <button
            type="button"
            onClick={() => irA(Math.max(primerPaso, step - 1))}
            disabled={step === primerPaso || busy}
            className="admin-btn admin-btn--ghost"
          >
            <IconChevronLeft size={16} /> Atrás
          </button>

          {esUltimo ? (
            <button type="button" onClick={submit} disabled={busy} className="admin-btn admin-btn--primary admin-btn--lg">
              {busy ? <IconSpinner size={16} /> : <IconCheck size={16} />}
              {textoFase || etiquetaGuardar}
            </button>
          ) : (
            <button type="button" onClick={() => irA(step + 1)} className="admin-btn admin-btn--primary admin-btn--lg">
              Siguiente <IconChevronRight size={16} />
            </button>
          )}

          {property && !busy && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="admin-btn admin-btn--danger">
              <IconTrash size={15} /> Eliminar
            </button>
          )}

          <span role="status" aria-live="polite" className="drawer-panel__status">
            {phase.kind === 'done' && phase.facebook === 'ok' && (
              <span style={{ color: t.ok, fontWeight: 700 }}>Publicada en Facebook</span>
            )}
            {phase.kind === 'done' && phase.facebook === 'error' && (
              <span style={{ color: '#B8862E', fontWeight: 600 }}>Guardada · Facebook falló</span>
            )}
            {error && <span style={{ color: t.danger, fontWeight: 600 }}>{error}</span>}
          </span>
        </footer>
      </div>

      {confirmClose && (
        <ConfirmModal
          title="¿Salir sin guardar?"
          message={property
            ? 'Los cambios que hiciste se van a perder.'
            : 'Guardamos lo que llevás como borrador para que puedas seguir después.'}
          onConfirm={async () => { setConfirmClose(false); onClose(); }}
          onCancel={() => setConfirmClose(false)}
          m={themeForModal(t)}
        />
      )}

      {confirmDelete && property && (
        <ConfirmModal
          title={`¿Eliminar "${property.title}"?`}
          message={(property as any).property_type === 'lotificadora'
            ? 'Se borran todos los lotes y los pagos de esta lotificación. No se puede deshacer.'
            : 'Si estaba publicada en Facebook, también se borra ese post. No se puede deshacer.'}
          onConfirm={async () => {
            await deleteProperty.mutateAsync(property.id);
            setConfirmDelete(false);
            onClose();
          }}
          onCancel={() => setConfirmDelete(false)}
          m={themeForModal(t)}
        />
      )}
    </div>
  );
}

function themeForModal(t: ReturnType<typeof useAdminTheme>) {
  return {
    mainBg: t.bg, mainSurface: t.surface, mainBorder: t.border,
    mainText: t.text, mainTextMuted: t.textMuted, mainTextDim: t.textDim,
    mainCardBg: t.surface, mainTopbarBg: t.bg,
  };
}
