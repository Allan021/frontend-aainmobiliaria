import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QueryProvider } from '../../providers/QueryProvider';
import { isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { useHondurasData } from '../../hooks/useHondurasData';
import { propertyAdapter } from '../../../infrastructure/api/propertyAdapter';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import type { Property, PropertyImage } from '../../../core/domain/entities/types';
import { IconCamera, IconCheckCircle, IconTrash, IconMapPin, IconEye, IconList } from '../shared/rs-icons';

const DEP_CODES: Record<string, string> = {
  'Francisco Morazán': 'FM', 'Cortés': 'CO', 'Atlántida': 'ATL', 'Comayagua': 'CM',
  'Yoro': 'YO', 'Choluteca': 'CH', 'Olancho': 'OL', 'La Paz': 'LP', 'Intibucá': 'IN',
  'El Paraíso': 'EP', 'Copán': 'CP', 'Santa Bárbara': 'SB', 'Lempira': 'LE',
  'Ocotepeque': 'OC', 'Colón': 'CL', 'Valle': 'VA', 'Gracias a Dios': 'GD', 'Islas de la Bahía': 'IB',
};

const EMPTY_FORM = {
  title: '', type: 'Casa', departamento: 'Yoro', municipio: '',
  price: '', currency: 'L', area_varas: '', area_m2: '',
  bedrooms: '', bathrooms: '', parking: '', description: '',
  lat: null as number | null, lng: null as number | null,
};

/** Mini mapa: clic marca la ubicación de la propiedad */
function LocationPicker({ initial, onPick }: { initial?: [number, number] | null; onPick: (lat: number, lng: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView(initial || [14.75, -86.6], initial ? 14 : 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    const icon = L.divIcon({ className: 'map-pin-wrap', html: '<div class="map-price-pin">Aquí</div>', iconSize: [0, 0] });
    if (initial) markerRef.current = L.marker(initial, { icon }).addTo(map);
    map.on('click', e => {
      if (markerRef.current) markerRef.current.setLatLng(e.latlng);
      else markerRef.current = L.marker(e.latlng, { icon }).addTo(map);
      onPick(e.latlng.lat, e.latlng.lng);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: 300, borderRadius: 14, overflow: 'hidden', zIndex: 0, border: '1.5px solid var(--main-border, #E6E0D2)' }} />;
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [{ n: 1, label: 'Datos' }, { n: 2, label: 'Fotos' }, { n: 3, label: 'Listo' }];
  return (
    <div className="rs-steps" role="list" aria-label="Progreso de publicación">
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'contents' }}>
          {i > 0 && <div className="rs-steps__line" />}
          <div role="listitem" className={`rs-steps__item ${current === s.n ? 'rs-steps__item--active' : ''} ${current > s.n ? 'rs-steps__item--done' : ''}`}>
            <span className="rs-steps__num">{current > s.n ? '✓' : s.n}</span>
            <span className="rs-steps__label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublishInner() {
  const { departamentos } = useHondurasData();
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [step, setStep] = useState<'form' | 'photos' | 'done'>('form');
  const [property, setProperty] = useState<Property | null>(null);
  const [photos, setPhotos] = useState<PropertyImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Modo edición: /publicar?id=<uuid>
  useEffect(() => {
    if (!isLoggedIn()) { requireLogin(); return; }
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { setLoadingExisting(false); return; }
    setEditId(id);
    propertyAdapter.getById(id)
      .then(p => {
        setProperty(p);
        setPhotos(p.images || []);
        setForm({
          title: p.title || '',
          type: p.type || 'Casa',
          departamento: p.departamento || 'Yoro',
          municipio: p.municipio || '',
          price: p.price != null ? String(p.price) : '',
          currency: p.currency || 'L',
          area_varas: p.area_varas || '',
          area_m2: p.area_m2 || '',
          bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
          bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
          parking: p.parking != null ? String(p.parking) : '',
          description: p.description || '',
          lat: p.lat ?? null,
          lng: p.lng ?? null,
        });
      })
      .catch(() => setError('No se pudo cargar la propiedad.'))
      .finally(() => setLoadingExisting(false));
  }, []);

  const dep = departamentos.find(d => d.nombre === form.departamento);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.lat == null) { setError('Marque la ubicación en el mapa: haga clic sobre el punto de su propiedad.'); return; }
    setSaving(true);
    const payload: Partial<Property> = {
      title: form.title,
      type: form.type as Property['type'],
      departamento: form.departamento,
      dep_code: DEP_CODES[form.departamento] || undefined,
      municipio: form.municipio,
      price: Number(form.price),
      currency: form.currency,
      area_varas: form.area_varas || undefined,
      area_m2: form.area_m2 || undefined,
      description: form.description,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      parking: form.parking ? Number(form.parking) : null,
      lat: form.lat,
      lng: form.lng,
    };
    try {
      let saved: Property;
      if (editId) {
        saved = await propertyAdapter.update(editId, payload);
        saved.images = photos;
      } else {
        saved = await propertyAdapter.create({ ...payload, status: 'disponible' });
      }
      setProperty(saved);
      setStep('photos');
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || !property) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        await propertyAdapter.uploadImage(property.id, file);
      }
      // Re-sincroniza para obtener ids de las imágenes nuevas (permite borrarlas)
      const fresh = await propertyAdapter.getById(property.id);
      setPhotos(fresh.images || []);
    } catch (err) {
      setError((err as Error).message || 'Error subiendo imagen');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (img: PropertyImage) => {
    if (!property) return;
    setPhotos(ps => ps.filter(p => p.id !== img.id));
    try {
      await propertyAdapter.removeImage(property.id, img.id);
    } catch {
      setPhotos(ps => [...ps, img]);
      setError('No se pudo eliminar la foto.');
    }
  };

  if (loadingExisting) {
    return (
      <div className="rs-page" style={{ maxWidth: 720 }}>
        <div className="rs-skeleton" style={{ height: 34, width: '55%', marginBottom: 12 }} />
        <div className="rs-skeleton" style={{ height: 16, width: '75%', marginBottom: 28 }} />
        <div className="rs-skeleton" style={{ height: 46, marginBottom: 14 }} />
        <div className="rs-skeleton" style={{ height: 46, marginBottom: 14 }} />
        <div className="rs-skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (step === 'done' && property) {
    return (
      <div className="rs-page" style={{ maxWidth: 560, textAlign: 'center', paddingTop: '4rem' }}>
        <div className="rs-empty__icon" style={{ width: 72, height: 72 }}>
          <IconCheckCircle size={34} />
        </div>
        <h1 className="rs-page__title">{editId ? '¡Cambios guardados!' : '¡Su propiedad está publicada!'}</h1>
        <p className="rs-page__sub" style={{ margin: '10px auto 0' }}>
          La publicación es anónima: los interesados contactan a través de A&A Inmobiliaria y nosotros coordinamos con usted.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <a href={`/propiedad/${property.id}`} className="rs-btn rs-btn--primary"><IconEye size={16} /> Ver publicación</a>
          <a href="/mis-propiedades" className="rs-btn rs-btn--secondary"><IconList size={16} /> Mis propiedades</a>
        </div>
      </div>
    );
  }

  if (step === 'photos' && property) {
    return (
      <div className="rs-page" style={{ maxWidth: 680 }}>
        <div className="rs-page__eyebrow">{editId ? 'Editar publicación' : 'Nueva publicación'}</div>
        <h1 className="rs-page__title">Fotos de la propiedad</h1>
        <p className="rs-page__sub">Las propiedades con 5 o más fotos reciben hasta 3× más interesados.</p>
        <Steps current={2} />

        {error && <div className="rs-alert rs-alert--error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}

        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: '2px dashed var(--color-pine-300, #7FB596)', borderRadius: 16,
          padding: '2.5rem 1rem', cursor: 'pointer', background: 'var(--color-pine-50, #EEF5F0)',
          color: 'var(--color-pine-700, #174834)', fontWeight: 700, fontSize: '0.9375rem', gap: 10,
          transition: 'border-color 0.2s, background 0.2s',
        }}>
          <IconCamera size={28} />
          {uploading ? 'Subiendo…' : 'Toque para elegir fotos'}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-pine-600, #1F5B42)', opacity: 0.85 }}>
            JPG o PNG · puede elegir varias a la vez
          </span>
          <input type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={e => uploadFiles(e.target.files)} disabled={uploading} />
        </label>

        {photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginTop: 18 }}>
            {photos.map(img => (
              <div key={img.id || img.url} className="rs-card" style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
                <img src={optimizeCloudinaryUrl(img.url, 260)} alt="Foto de la propiedad"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                {img.id && (
                  <button type="button" onClick={() => deletePhoto(img)} aria-label="Eliminar foto"
                    className="rs-icon-btn"
                    style={{ position: 'absolute', top: 6, right: 6, width: 32, height: 32, background: 'rgba(255,255,255,0.92)', color: '#8C3A2E', borderColor: 'transparent' }}>
                    <IconTrash size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={() => setStep('form')} className="rs-btn rs-btn--ghost" type="button">← Volver a datos</button>
          <button onClick={() => setStep('done')} disabled={uploading} className="rs-btn rs-btn--primary" style={{ flex: 1 }}>
            {photos.length > 0 ? 'Finalizar' : 'Finalizar sin fotos'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-page" style={{ maxWidth: 720 }}>
      <div className="rs-page__eyebrow">{editId ? 'Editar publicación' : 'Publicación gratuita'}</div>
      <h1 className="rs-page__title">{editId ? 'Edite su propiedad' : 'Publique su propiedad'}</h1>
      <p className="rs-page__sub">
        Anónimo de principio a fin: los interesados contactan por el número de A&A Inmobiliaria, nunca el suyo.
      </p>
      <Steps current={1} />

      {error && <div className="rs-alert rs-alert--error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="rs-section-title">Información básica</div>

        <div>
          <label className="rs-label" htmlFor="pub-title">Título del anuncio</label>
          <input id="pub-title" className="rs-input" required value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Ej: Casa de 3 habitaciones en Col. Las Palmas" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label className="rs-label" htmlFor="pub-type">Tipo</label>
            <select id="pub-type" className="rs-input" value={form.type} onChange={e => set('type', e.target.value)}>
              {['Casa', 'Terreno', 'Lote', 'Comercial'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="rs-label" htmlFor="pub-price">Precio</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <select aria-label="Moneda" className="rs-input" value={form.currency} onChange={e => set('currency', e.target.value)} style={{ width: 74, flexShrink: 0 }}>
                <option value="L">L</option>
                <option value="$">$</option>
              </select>
              <input id="pub-price" className="rs-input" required type="number" min={1} inputMode="numeric"
                value={form.price} onChange={e => set('price', e.target.value)} placeholder="1500000" />
            </div>
          </div>
        </div>

        <div className="rs-section-title" style={{ marginTop: 8 }}>Ubicación</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label className="rs-label" htmlFor="pub-dep">Departamento</label>
            <select id="pub-dep" className="rs-input" value={form.departamento}
              onChange={e => { set('departamento', e.target.value); set('municipio', ''); }}>
              {departamentos.map(d => <option key={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="rs-label" htmlFor="pub-muni">Municipio</label>
            <select id="pub-muni" className="rs-input" required value={form.municipio} onChange={e => set('municipio', e.target.value)}>
              <option value="">Seleccione…</option>
              {(dep?.municipios || []).map(m => <option key={m.id}>{m.nombre}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="rs-label">Punto en el mapa</label>
          <LocationPicker
            initial={form.lat != null && form.lng != null ? [form.lat, form.lng] : null}
            onPick={(lat, lng) => { set('lat', lat); set('lng', lng); }}
          />
          {form.lat != null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-pine-600, #1F5B42)', fontWeight: 700, marginTop: 8 }}>
              <IconMapPin size={14} /> Ubicación marcada ({form.lat.toFixed(5)}, {form.lng?.toFixed(5)})
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--main-text-dim, #9A9383)', marginTop: 8 }}>
              Haga clic en el mapa para marcar dónde está su propiedad. Solo se muestra la zona aproximada al público.
            </div>
          )}
        </div>

        <div className="rs-section-title" style={{ marginTop: 8 }}>Detalles</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label className="rs-label" htmlFor="pub-beds">Habitaciones</label>
            <input id="pub-beds" className="rs-input" type="number" min={0} inputMode="numeric" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="3" />
          </div>
          <div>
            <label className="rs-label" htmlFor="pub-baths">Baños</label>
            <input id="pub-baths" className="rs-input" type="number" min={0} step="0.5" inputMode="decimal" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="2" />
          </div>
          <div>
            <label className="rs-label" htmlFor="pub-park">Parqueos</label>
            <input id="pub-park" className="rs-input" type="number" min={0} inputMode="numeric" value={form.parking} onChange={e => set('parking', e.target.value)} placeholder="1" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label className="rs-label" htmlFor="pub-varas">Área (varas²)</label>
            <input id="pub-varas" className="rs-input" value={form.area_varas} onChange={e => set('area_varas', e.target.value)} placeholder="Ej: 350 varas²" />
          </div>
          <div>
            <label className="rs-label" htmlFor="pub-m2">Área (m²)</label>
            <input id="pub-m2" className="rs-input" value={form.area_m2} onChange={e => set('area_m2', e.target.value)} placeholder="Ej: 244 m²" />
          </div>
        </div>

        <div>
          <label className="rs-label" htmlFor="pub-desc">Descripción</label>
          <textarea id="pub-desc" className="rs-input" required rows={4} value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describa su propiedad: estado, ubicación, servicios, extras…" />
        </div>

        <button type="submit" disabled={saving} className="rs-btn rs-btn--primary" style={{ padding: '1rem', fontSize: '0.9375rem' }}>
          {saving ? 'Guardando…' : editId ? 'Guardar cambios y continuar' : 'Continuar a fotos'}
        </button>
      </form>
    </div>
  );
}

export function PublishForm() {
  return (
    <QueryProvider>
      <PublishInner />
    </QueryProvider>
  );
}
