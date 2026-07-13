import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QueryProvider } from '../../providers/QueryProvider';
import { isLoggedIn } from '../../hooks/useFavorites';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { useHondurasData } from '../../hooks/useHondurasData';
import { propertyAdapter } from '../../../infrastructure/api/propertyAdapter';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import type { Property, PropertyImage } from '../../../core/domain/entities/types';
import { WhatsAppIcon } from '../shared/Icon';
import { IconHome, IconMountain, IconGrid, IconArea, IconLock, IconHandshake, IconScroll, IconCheck, IconTrash, IconCamera, IconEye, IconList } from '../shared/rs-icons';

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

const DEP_CODES: Record<string, string> = {
  'Francisco Morazán': 'FM', 'Cortés': 'CO', 'Atlántida': 'ATL', 'Comayagua': 'CM',
  'Yoro': 'YO', 'Choluteca': 'CH', 'Olancho': 'OL', 'La Paz': 'LP', 'Intibucá': 'IN',
  'El Paraíso': 'EP', 'Copán': 'CP', 'Santa Bárbara': 'SB', 'Lempira': 'LE',
  'Ocotepeque': 'OC', 'Colón': 'CL', 'Valle': 'VA', 'Gracias a Dios': 'GD', 'Islas de la Bahía': 'IB',
};


function tileUrl(): string {
  const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  return dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
}

const TIPOS = [
  { label: 'Casa', icon: <IconHome size={22} /> },
  { label: 'Terreno', icon: <IconMountain size={22} /> },
  { label: 'Lote', icon: <IconGrid size={22} /> },
  { label: 'Comercial', icon: <IconArea size={22} /> },
];

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid var(--pub-border2)', borderRadius: 11, padding: '13px 16px',
  fontFamily: F_SANS, fontSize: 15, outlineColor: '#1F5B42',
  background: 'var(--pub-bg)', color: 'var(--pub-ink)',
};

const labelText: React.CSSProperties = {
  fontSize: '13.5px', fontWeight: 700, color: 'var(--pub-muted2)', display: 'block', marginBottom: 7,
};

const primaryBtn: React.CSSProperties = {
  background: '#1F5B42', color: '#EEF5F0', border: 'none',
  fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 16,
  padding: '16px 0', borderRadius: 13, cursor: 'pointer', transition: 'background 0.15s',
};

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: 'var(--pub-muted)', border: '1.5px solid var(--pub-border2)',
  fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
  padding: '15px 26px', borderRadius: 13, cursor: 'pointer', transition: 'background 0.15s',
};

const card: React.CSSProperties = {
  background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 20, padding: 36,
};

/* ── Selector de ubicación (CARTO tiles) ── */
function LocationPicker({ initial, onPick }: { initial?: [number, number] | null; onPick: (lat: number, lng: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView(initial || [15.35, -87.8], initial ? 14 : 9);
    L.tileLayer(tileUrl(), {
      attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20,
    }).addTo(map);
    const icon = L.divIcon({ className: 'map-pin-wrap', html: '<div class="map-price-pin map-price-pin--active">Aquí</div>', iconSize: [0, 0] });
    if (initial) markerRef.current = L.marker(initial, { icon }).addTo(map);
    map.on('click', e => {
      if (markerRef.current) markerRef.current.setLatLng(e.latlng);
      else markerRef.current = L.marker(e.latlng, { icon }).addTo(map);
      onPick(e.latlng.lat, e.latlng.lng);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  return <div ref={ref} style={{ position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden', border: '1.5px solid var(--pub-border2)', zIndex: 0, cursor: 'crosshair' }} />;
}

/* ── Indicador de pasos ── */
function Steps({ current, onGo }: { current: number; onGo: (n: number) => void }) {
  const defs = [
    { n: 1, label: 'Cuenta' }, { n: 2, label: 'Propiedad' }, { n: 3, label: 'Fotos y mapa' }, { n: 4, label: 'Listo' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, fontFamily: F_SANS }} role="list" aria-label="Progreso">
      {defs.map((d, i) => {
        const done = current > d.n;
        const activo = current === d.n;
        return (
          <div key={d.n} style={{ flex: i < defs.length - 1 ? 1 : '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }} role="listitem">
            <button onClick={() => { if (d.n < current && current !== 4) onGo(d.n); }} type="button" style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 14,
              display: 'grid', placeItems: 'center', cursor: d.n < current && current !== 4 ? 'pointer' : 'default',
              border: activo ? '2px solid #1F5B42' : done ? '2px solid #4A7C59' : '2px solid var(--pub-border2)',
              background: activo ? '#1F5B42' : done ? '#4A7C59' : 'var(--pub-surface)',
              color: activo || done ? '#EEF5F0' : 'var(--pub-dim)',
            }}>{done ? <IconCheck size={14} /> : d.n}</button>
            <span className={activo ? '' : 'pub-step-label'} style={{ fontSize: '13.5px', fontWeight: activo ? 700 : 600, color: activo ? 'var(--pub-ink)' : done ? '#4A7C59' : 'var(--pub-dim)', whiteSpace: 'nowrap' }}>{d.label}</span>
            {i < defs.length - 1 && <div style={{ flex: 1, height: 2, background: done ? '#4A7C59' : 'var(--pub-border2)', margin: '0 12px', transition: 'background 0.3s' }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Paso 1: cuenta ── */
function PasoCuenta({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const error = (mode === 'login' ? login.error : register.error) as Error | null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') register.mutate({ email, password, name }, { onSuccess: onDone });
    else login.mutate({ email, password }, { onSuccess: onDone });
  };

  return (
    <div style={card}>
      <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 24, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
        {mode === 'register' ? 'Creá tu cuenta' : 'Entrá a tu cuenta'}
      </h2>
      <p style={{ fontSize: '14.5px', color: 'var(--pub-muted)', margin: '0 0 28px' }}>
        {mode === 'register'
          ? 'Solo para coordinar contigo — tus datos nunca se muestran en el sitio.'
          : 'Bienvenido de nuevo.'}{' '}
        <button type="button" onClick={() => setMode(m => m === 'register' ? 'login' : 'register')} style={{
          color: '#1F5B42', fontWeight: 700, background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: '14.5px', padding: 0,
          textDecoration: 'underline', textUnderlineOffset: 2,
        }}>{mode === 'register' ? '¿Ya tenés cuenta?' : '¿Cuenta nueva?'}</button>
      </p>

      {error && (
        <div style={{ background: '#F9EBE7', color: '#8C3A2E', border: '1px solid #EBD2CB', borderRadius: 11, padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, marginBottom: 18 }} role="alert">
          {error.message}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="pub-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {mode === 'register' && (
            <label style={{ display: 'block' }}>
              <span style={labelText}>Nombre completo</span>
              <input required placeholder="Ej. María Rodríguez" value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoComplete="name" />
            </label>
          )}
          <label style={{ display: 'block' }}>
            <span style={labelText}>Correo electrónico</span>
            <input required type="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} autoComplete="email" inputMode="email" />
          </label>
          <label style={{ display: 'block' }}>
            <span style={labelText}>Contraseña</span>
            <input required type="password" minLength={6} placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>
        </div>

        <div style={{
          background: 'var(--pub-green-bg)', borderRadius: 12, padding: '14px 18px', marginTop: 22,
          fontSize: '13.5px', color: 'var(--pub-green-ink)', display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ color: '#1F5B42', display: 'flex', marginTop: 1 }}><IconLock size={15} /></span>
          <span><strong>Tus datos nunca se muestran en el sitio.</strong> Solo los usamos para coordinar visitas y avisarte cuando haya interesados.</span>
        </div>

        <button type="submit" disabled={pending} style={{ ...primaryBtn, marginTop: 26, width: '100%', opacity: pending ? 0.7 : 1 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#17452F'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1F5B42'; }}
        >{pending ? 'Un momento…' : 'Continuar →'}</button>
      </form>
    </div>
  );
}

function PublishInner() {
  const { departamentos } = useHondurasData();
  const [paso, setPaso] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [photos, setPhotos] = useState<PropertyImage[]>([]);        // modo edición (ya subidas)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);      // modo creación (locales)
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', type: 'Casa', departamento: 'Yoro', municipio: '',
    price: '', currency: 'L', area_varas: '', area_m2: '',
    bedrooms: '', bathrooms: '', parking: '', description: '',
    lat: null as number | null, lng: null as number | null,
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    const logged = isLoggedIn();
    if (!id) {
      setPaso(logged ? 2 : 1);
      setLoadingExisting(false);
      return;
    }
    if (!logged) { window.location.href = `/acceder?next=${encodeURIComponent('/publicar?id=' + id)}`; return; }
    setEditId(id);
    propertyAdapter.getById(id)
      .then(p => {
        setProperty(p);
        setPhotos(p.images || []);
        setForm({
          title: p.title || '', type: p.type || 'Casa',
          departamento: p.departamento || 'Yoro', municipio: p.municipio || '',
          price: p.price != null ? String(p.price) : '', currency: p.currency || 'L',
          area_varas: p.area_varas || '', area_m2: p.area_m2 || '',
          bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
          bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
          parking: p.parking != null ? String(p.parking) : '',
          description: p.description || '',
          lat: p.lat ?? null, lng: p.lng ?? null,
        });
        setPaso(2);
      })
      .catch(() => setError('No se pudo cargar la propiedad.'))
      .finally(() => setLoadingExisting(false));
  }, []);

  const dep = departamentos.find(d => d.nombre === form.departamento);

  const validarPropiedad = (): boolean => {
    setError('');
    if (!form.title.trim()) { setError('Poné un título a tu anuncio.'); return false; }
    if (!form.price || Number(form.price) <= 0) { setError('Ingresá el precio.'); return false; }
    if (!form.municipio) { setError('Seleccioná el municipio.'); return false; }
    if (!form.description.trim()) { setError('Agregá una descripción breve.'); return false; }
    return true;
  };

  const payload = (): Partial<Property> => ({
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
  });

  const enviar = async () => {
    setError('');
    if (form.lat == null) { setError('Marcá la ubicación en el mapa: hacé clic sobre el punto de tu propiedad.'); return; }
    setSaving(true);
    try {
      if (editId) {
        const saved = await propertyAdapter.update(editId, payload());
        setProperty(saved);
      } else {
        // Nueva publicación: entra en revisión (borrador) hasta que A&A la verifique
        const created = await propertyAdapter.create({ ...payload(), status: 'borrador' });
        setProperty(created);
        if (pendingFiles.length > 0) {
          setUploading(true);
          for (const file of pendingFiles) {
            await propertyAdapter.uploadImage(created.id, file).catch(() => {});
          }
          setUploading(false);
        }
      }
      setPaso(4);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message || 'No se pudo enviar');
    } finally {
      setSaving(false);
    }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    if (editId && property) {
      setUploading(true);
      setError('');
      try {
        for (const file of Array.from(files)) await propertyAdapter.uploadImage(property.id, file);
        const fresh = await propertyAdapter.getById(property.id);
        setPhotos(fresh.images || []);
      } catch (err) {
        setError((err as Error).message || 'Error subiendo imagen');
      } finally {
        setUploading(false);
      }
    } else {
      setPendingFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const deletePhoto = async (img: PropertyImage) => {
    if (!property) return;
    setPhotos(ps => ps.filter(p => p.id !== img.id));
    try { await propertyAdapter.removeImage(property.id, img.id); }
    catch { setPhotos(ps => [...ps, img]); }
  };

  const tipoBtn = (t: typeof TIPOS[number]) => {
    const sel = form.type === t.label;
    return (
      <button key={t.label} type="button" onClick={() => set('type', t.label)} style={{
        border: sel ? '2px solid #1F5B42' : '1.5px solid var(--pub-border2)',
        background: sel ? 'var(--pub-green-bg)' : 'var(--pub-bg)',
        color: sel ? '#1F5B42' : 'var(--pub-muted2)',
        borderRadius: 13, padding: '16px 8px', cursor: 'pointer',
        fontFamily: F_SANS, textAlign: 'center', transition: 'all 0.15s',
      }}>
        <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{t.icon}</span>
        <span style={{ display: 'block', fontWeight: 700, fontSize: '13.5px' }}>{t.label}</span>
      </button>
    );
  };

  if (loadingExisting) {
    return (
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px' }}>
        <div className="rs-skeleton" style={{ height: 42, width: '60%', margin: '0 auto 16px' }} />
        <div className="rs-skeleton" style={{ height: 400, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 80px', fontFamily: F_SANS, color: 'var(--pub-ink)' }}>
      {/* Encabezado */}
      {paso < 4 && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--pub-green-bg)', border: '1px solid var(--pub-green-border)', borderRadius: 999,
            padding: '7px 16px', marginBottom: 18,
          }}>
            <span style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: '0.14em', color: '#1F5B42', fontWeight: 500 }}>
              100% GRATIS · SIN COMISIÓN POR PUBLICAR
            </span>
          </div>
          <h1 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 'clamp(30px, 5vw, 42px)', letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.08 }}>
            {editId ? 'Editá tu propiedad.' : <>Publicá tu propiedad.<br /><span style={{ color: '#1F5B42' }}>Nosotros traemos los compradores.</span></>}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--pub-muted)', maxWidth: 560, margin: '0 auto' }}>
            Tus datos quedan privados — A&A atiende cada consulta, coordina las visitas con vos y te acompaña hasta la escritura.
          </p>
        </div>
      )}

      <Steps current={paso} onGo={setPaso} />

      {error && (
        <div style={{ background: '#F9EBE7', color: '#8C3A2E', border: '1px solid #EBD2CB', borderRadius: 12, padding: '13px 18px', fontSize: '13.5px', fontWeight: 600, marginBottom: 18 }} role="alert">
          {error}
        </div>
      )}

      {/* PASO 1: CUENTA */}
      {paso === 1 && <PasoCuenta onDone={() => setPaso(2)} />}

      {/* PASO 2: PROPIEDAD */}
      {paso === 2 && (
        <div style={card}>
          <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 24, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Contanos de tu propiedad</h2>
          <p style={{ fontSize: '14.5px', color: 'var(--pub-muted)', margin: '0 0 28px' }}>Entre más completa la información, más rápido encontramos comprador.</p>

          <span style={labelText}>¿Qué vendés?</span>
          <div className="pub-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
            {TIPOS.map(tipoBtn)}
          </div>

          <label style={{ display: 'block', marginBottom: 22 }}>
            <span style={labelText}>Título del anuncio</span>
            <input placeholder="Ej. Casa Res. Los Almendros" value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} />
          </label>

          <div className="pub-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 22 }}>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Precio</span>
              <input placeholder="Ej. 850000" type="number" min={1} inputMode="numeric" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} />
            </label>
            <div>
              <span style={labelText}>Moneda</span>
              <div style={{ display: 'flex', border: '1.5px solid var(--pub-border2)', borderRadius: 11, overflow: 'hidden' }}>
                {[{ v: 'L', l: 'Lempiras' }, { v: '$', l: 'Dólares' }].map(m => {
                  const sel = form.currency === m.v;
                  return (
                    <button key={m.v} type="button" onClick={() => set('currency', m.v)} style={{
                      flex: 1, border: 'none', padding: '13px 0',
                      fontFamily: F_SANS, fontWeight: sel ? 700 : 600, fontSize: 14, cursor: 'pointer',
                      background: sel ? '#1F5B42' : 'var(--pub-bg)', color: sel ? '#EEF5F0' : 'var(--pub-muted)', transition: 'all 0.15s',
                    }}>{m.l}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pub-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 22 }}>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Departamento</span>
              <select className="pub-select pub-select--lg" style={{ width: '100%' }}
                value={form.departamento} onChange={e => { set('departamento', e.target.value); set('municipio', ''); }}>
                {departamentos.map(d => <option key={d.id}>{d.nombre}</option>)}
              </select>
            </label>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Municipio</span>
              <select className="pub-select pub-select--lg" style={{ width: '100%' }}
                value={form.municipio} onChange={e => set('municipio', e.target.value)}>
                <option value="">Seleccioná…</option>
                {(dep?.municipios || []).map(m => <option key={m.id}>{m.nombre}</option>)}
              </select>
            </label>
          </div>

          <div className="pub-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Varas²</span>
              <input placeholder="350" value={form.area_varas} onChange={e => set('area_varas', e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Habitaciones</span>
              <input placeholder="3" type="number" min={0} inputMode="numeric" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Baños</span>
              <input placeholder="2" type="number" min={0} step="0.5" inputMode="decimal" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={labelText}>Parqueos</span>
              <input placeholder="2" type="number" min={0} inputMode="numeric" value={form.parking} onChange={e => set('parking', e.target.value)} style={inputStyle} />
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: 22 }}>
            <span style={labelText}>Descripción breve</span>
            <textarea placeholder="Ej. Casa en circuito cerrado, sala amplia, patio con espacio para ampliar…" rows={3}
              value={form.description} onChange={e => set('description', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </label>

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {!editId && !isLoggedIn() && (
              <button type="button" onClick={() => setPaso(1)} style={ghostBtn}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--pub-border)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >← Atrás</button>
            )}
            <button type="button" onClick={() => { if (validarPropiedad()) { setPaso(3); window.scrollTo({ top: 0 }); } }}
              style={{ ...primaryBtn, flex: 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#17452F'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1F5B42'; }}
            >Continuar →</button>
          </div>
        </div>
      )}

      {/* PASO 3: FOTOS + MAPA */}
      {paso === 3 && (
        <div style={card}>
          <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 24, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Fotos y ubicación</h2>
          <p style={{ fontSize: '14.5px', color: 'var(--pub-muted)', margin: '0 0 28px' }}>Las propiedades con 5+ fotos reciben el triple de consultas.</p>

          <span style={labelText}>Fotos</span>
          <div className="pub-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 26 }}>
            <label style={{
              aspectRatio: '1', border: '2px dashed #1F5B42', borderRadius: 12,
              display: 'grid', placeItems: 'center', background: 'var(--pub-green-bg)', cursor: 'pointer',
            }}>
              <div style={{ textAlign: 'center', color: '#1F5B42' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><IconCamera size={22} /></div>
                <div style={{ fontSize: '11.5px', fontWeight: 700 }}>{uploading ? 'Subiendo…' : 'Subir fotos'}</div>
              </div>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} disabled={uploading}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>

            {/* Modo edición: fotos ya subidas */}
            {editId && photos.map(img => (
              <div key={img.id || img.url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--pub-border)' }}>
                <img src={optimizeCloudinaryUrl(img.url, 260)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {img.id && (
                  <button type="button" onClick={() => deletePhoto(img)} aria-label="Eliminar foto" style={{
                    position: 'absolute', top: 6, right: 6, width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
                    display: 'grid', placeItems: 'center', color: '#8C3A2E',
                  }}><IconTrash size={14} /></button>
                )}
              </div>
            ))}

            {/* Modo creación: previews locales */}
            {!editId && pendingFiles.map((f, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--pub-border)' }}>
                <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setPendingFiles(fs => fs.filter((_, j) => j !== i))} aria-label="Quitar foto" style={{
                  position: 'absolute', top: 6, right: 6, width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
                  display: 'grid', placeItems: 'center', color: '#8C3A2E',
                }}><IconTrash size={14} /></button>
              </div>
            ))}

            {/* Placeholders */}
            {Array.from({ length: Math.max(0, 3 - (editId ? photos.length : pendingFiles.length)) }).map((_, i) => (
              <div key={`ph-${i}`} style={{
                aspectRatio: '1', border: '1.5px dashed var(--pub-border2)', borderRadius: 12,
                display: 'grid', placeItems: 'center', background: 'var(--pub-bg)',
              }}>
                <span style={{ fontFamily: F_MONO, fontSize: 10, color: 'var(--pub-dim)' }}>FOTO {(editId ? photos.length : pendingFiles.length) + i + 2}</span>
              </div>
            ))}
          </div>

          <span style={labelText}>Marcá la ubicación en el mapa</span>
          <LocationPicker
            initial={form.lat != null && form.lng != null ? [form.lat, form.lng] : null}
            onPick={(lat, lng) => { set('lat', lat); set('lng', lng); }}
          />
          <div style={{ fontSize: '12.5px', color: form.lat != null ? '#1F5B42' : 'var(--pub-dim)', margin: '8px 0 26px', fontWeight: form.lat != null ? 700 : 400 }}>
            {form.lat != null
              ? 'Ubicación marcada. En el sitio se muestra solo la zona aproximada — nunca la dirección exacta.'
              : 'Hacé clic sobre el punto de tu propiedad. En el sitio se muestra solo la zona aproximada.'}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => setPaso(2)} style={ghostBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--pub-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >← Atrás</button>
            <button type="button" onClick={enviar} disabled={saving || uploading} style={{ ...primaryBtn, flex: 1, opacity: saving || uploading ? 0.7 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#17452F'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1F5B42'; }}
            >{saving || uploading ? 'Enviando…' : editId ? 'Guardar cambios →' : 'Enviar a revisión →'}</button>
          </div>
        </div>
      )}

      {/* PASO 4: LISTO */}
      {paso === 4 && property && (
        <div style={{ ...card, padding: '48px 36px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--pub-green-bg)',
            display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#1F5B42',
          }}><IconCheck size={30} /></div>
          <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 28, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {editId ? '¡Cambios guardados!' : '¡Recibimos tu propiedad!'}
          </h2>
          {editId ? (
            <p style={{ fontSize: '15.5px', color: 'var(--pub-muted)', margin: '0 auto 28px', maxWidth: 480, lineHeight: 1.65 }}>
              Tu publicación quedó actualizada.
            </p>
          ) : (
            <>
              <p style={{ fontSize: '15.5px', color: 'var(--pub-muted)', margin: '0 auto 8px', maxWidth: 480, lineHeight: 1.65 }}>
                Nuestro equipo verificará la escritura en el <strong style={{ color: 'var(--pub-ink)' }}>Instituto de la Propiedad</strong> y te escribirá por WhatsApp en las próximas <strong style={{ color: 'var(--pub-ink)' }}>24 horas</strong> para publicarla.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--pub-bg)', border: '1px solid var(--pub-border2)', borderRadius: 12,
                padding: '12px 20px', margin: '20px 0 28px', fontSize: '13.5px', color: 'var(--pub-muted2)', flexWrap: 'wrap', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: F_MONO, color: '#B8862E' }}>EN REVISIÓN</span>
                <span>→</span><span>Verificación legal</span><span>→</span><span style={{ color: 'var(--pub-dim)' }}>Publicada</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }))} style={{
              background: '#25D366', color: '#0A3D22', fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
              padding: '14px 26px', borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
            ><WhatsAppIcon size={15} color="#0A3D22" /> Dar seguimiento por WhatsApp</button>
            <a href="/mis-propiedades" style={{
              border: '1.5px solid var(--pub-border2)', color: 'var(--pub-muted2)', fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
              padding: '14px 26px', borderRadius: 12, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--pub-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            ><IconList size={15} /> Mis propiedades</a>
            {editId && (
              <a href={`/propiedad/${property.id}`} style={{
                border: '1.5px solid var(--pub-border2)', color: 'var(--pub-muted2)', fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
                padding: '14px 26px', borderRadius: 12, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}><IconEye size={15} /> Ver publicación</a>
            )}
          </div>
        </div>
      )}

      {/* Garantías */}
      <div className="pub-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 36 }}>
        {[
          { icon: <IconLock size={20} />, t: 'Tus datos, privados', d: 'Nadie ve tu nombre ni tu número. A&A filtra a los curiosos.' },
          { icon: <IconHandshake size={20} />, t: 'Nosotros negociamos', d: 'Coordinamos visitas y negociamos por vos con compradores reales.' },
          { icon: <IconScroll size={20} />, t: 'Cierre con escritura', d: 'Acompañamiento legal completo hasta la firma de escritura pública.' },
        ].map(g => (
          <div key={g.t} style={{ textAlign: 'center', padding: '18px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#1F5B42' }}>{g.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{g.t}</div>
            <div style={{ fontSize: 13, color: 'var(--pub-muted)', lineHeight: 1.5 }}>{g.d}</div>
          </div>
        ))}
      </div>
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
