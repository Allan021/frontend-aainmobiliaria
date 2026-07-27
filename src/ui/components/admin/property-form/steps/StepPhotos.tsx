import { useRef, useState } from 'react';
import { IconCamera, IconX, IconStar, IconChevronLeft, IconSpinner, IconSparkles } from '../../../shared/rs-icons';
import { api } from '../../../../../infrastructure/api/client';
import { useAdminTheme } from '../theme';
import type { ImageItem, PropertyKind } from '../types';

interface Props {
  images: ImageItem[];
  setImages: (fn: (prev: ImageItem[]) => ImageItem[]) => void;
  kind: PropertyKind;
  propertyId?: string;
  housePreviewUrl: string | null;
  onHousePreview: (url: string | null) => void;
}

const MAX = 10;

export function StepPhotos({ images, setImages, kind, propertyId, housePreviewUrl, onHousePreview }: Props) {
  const t = useAdminTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [aiError, setAiError] = useState('');

  const add = (files: File[]) => {
    const libres = MAX - images.length;
    if (files.length > libres) setError(`Solo entran ${MAX} fotos. Agregamos las primeras ${libres}.`);
    const nuevas = files.slice(0, libres).map(file => ({
      type: 'file' as const, file, preview: URL.createObjectURL(file),
    }));
    if (nuevas.length) setImages(prev => [...prev, ...nuevas]);
  };

  const quitar = async (index: number) => {
    const img = images[index];
    if (img.type === 'file') {
      if (img.preview) URL.revokeObjectURL(img.preview);
      setImages(prev => prev.filter((_, i) => i !== index));
      return;
    }
    if (!img.id || !propertyId) {
      setImages(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setImages(prev => prev.map((im, i) => i === index ? { ...im, deleting: true } : im));
    try {
      await api.delete(`/properties/${propertyId}/images/${img.id}`);
      setImages(prev => prev.filter((_, i) => i !== index));
    } catch {
      setImages(prev => prev.map((im, i) => i === index ? { ...im, deleting: false } : im));
      setError('No se pudo borrar la foto. Probá de nuevo.');
    }
  };

  // La portada es images[0]. Antes eso no se decía en ningún lado ni se podía
  // cambiar: había que borrar todo y volver a subir en otro orden.
  const hacerPortada = (index: number) => {
    setImages(prev => {
      const copia = [...prev];
      const [img] = copia.splice(index, 1);
      return [img, ...copia];
    });
  };

  const mover = (index: number, delta: number) => {
    const destino = index + delta;
    if (destino < 0 || destino >= images.length) return;
    setImages(prev => {
      const copia = [...prev];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  };

  const generarVista = async (url: string, index: number) => {
    if (!propertyId) return;
    setAiError('');
    setAiLoading(index);
    try {
      const res = await api.post<{ url: string }>(`/properties/${propertyId}/house-preview`, { imageUrl: url });
      onHousePreview(res.url);
    } catch (err) {
      setAiError((err as Error).message || 'No se pudo generar la vista.');
    } finally {
      setAiLoading(null);
    }
  };

  const guardadas = images.filter(i => i.type === 'existing');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>Fotos</h3>
        <p style={{ fontSize: 14, color: t.textMuted, margin: '6px 0 0', lineHeight: 1.55 }}>
          La primera es la portada — es la que ve la gente en el buscador. Podés cambiarla cuando quieras.
        </p>
      </div>

      {images.length < MAX && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); add(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))); }}
          onClick={() => inputRef.current?.click()}
          className="photo-dropzone"
          style={{
            borderColor: dragOver ? t.accent : t.border,
            background: dragOver ? (t.isDark ? 'rgba(127,181,150,0.08)' : '#F1F7F2') : 'transparent',
            color: t.textMuted,
          }}
        >
          <input ref={inputRef} type="file" multiple accept="image/*" hidden
            onChange={e => { add(Array.from(e.target.files || [])); if (inputRef.current) inputRef.current.value = ''; }} />
          <IconCamera size={30} />
          <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Elegir fotos</span>
          <span style={{ fontSize: 12.5, color: t.textDim }}>
            Tocá acá o arrastralas · {images.length} de {MAX}
          </span>
        </div>
      )}

      {error && <div role="alert" style={{ fontSize: 13, color: t.danger, fontWeight: 600 }}>{error}</div>}

      {images.length > 0 && (
        <ul className="photo-grid">
          {images.map((img, i) => (
            <li key={img.id || img.preview || i} className="photo-tile"
              style={{ borderColor: i === 0 ? t.accent : t.border, opacity: img.deleting ? 0.5 : 1 }}>
              <img src={img.preview || img.url} alt={i === 0 ? 'Foto de portada' : `Foto ${i + 1}`} />

              {i === 0 && (
                <span className="photo-tile__badge" style={{ background: t.accent }}>
                  <IconStar size={11} /> Portada
                </span>
              )}

              {img.deleting && <span className="photo-tile__overlay"><IconSpinner size={20} /></span>}

              {!img.deleting && (
                <div className="photo-tile__actions">
                  {i > 0 && (
                    <>
                      <button type="button" onClick={() => hacerPortada(i)}
                        className="admin-icon-btn admin-icon-btn--dark" aria-label={`Usar la foto ${i + 1} como portada`}>
                        <IconStar size={15} />
                      </button>
                      <button type="button" onClick={() => mover(i, -1)}
                        className="admin-icon-btn admin-icon-btn--dark" aria-label={`Mover la foto ${i + 1} hacia atrás`}>
                        <IconChevronLeft size={15} />
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => quitar(i)}
                    className="admin-icon-btn admin-icon-btn--dark" aria-label={`Quitar la foto ${i + 1}`}>
                    <IconX size={15} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Vista realista con IA — solo terrenos ya guardados con fotos */}
      {kind === 'terreno' && (
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 700, color: t.text }}>
            <IconSparkles size={17} /> Mostrar cómo se vería con una casa
          </div>
          <p style={{ fontSize: 13.5, color: t.textMuted, margin: '6px 0 12px', lineHeight: 1.55 }}>
            Elegí una foto del terreno y la IA dibuja una casa encima, para que el cliente se lo imagine.
          </p>

          {!propertyId ? (
            // Antes el botón existía y no hacía nada en una propiedad nueva
            <div style={{ fontSize: 13, color: t.textDim, fontStyle: 'italic' }}>
              Disponible después de guardar la propiedad por primera vez.
            </div>
          ) : guardadas.length === 0 ? (
            <div style={{ fontSize: 13, color: t.textDim, fontStyle: 'italic' }}>
              Primero guardá al menos una foto.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {guardadas.map((img, i) => (
                  <button key={img.id || i} type="button"
                    onClick={() => img.url && generarVista(img.url, i)}
                    disabled={aiLoading !== null}
                    className="photo-ai-pick"
                    style={{ borderColor: t.border }}
                    aria-label={`Generar vista con casa desde la foto ${i + 1}`}>
                    <img src={img.preview || img.url} alt="" />
                    {aiLoading === i && <span className="photo-tile__overlay"><IconSpinner size={18} /></span>}
                  </button>
                ))}
              </div>
              {aiError && <div role="alert" style={{ fontSize: 13, color: t.danger, marginTop: 8 }}>{aiError}</div>}
              {housePreviewUrl && (
                <figure style={{ margin: '14px 0 0' }}>
                  <figcaption style={{ fontSize: 12.5, fontWeight: 600, color: t.textDim, marginBottom: 6 }}>
                    Vista generada
                  </figcaption>
                  <img src={housePreviewUrl} alt="Vista de la propiedad generada con IA"
                    style={{ width: '100%', maxWidth: 340, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }} />
                </figure>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
