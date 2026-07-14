import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Eyebrow } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { useCreateProperty, useUpdateProperty, useDeleteProperty } from '../../hooks/useProperties';
import { useHondurasData } from '../../hooks/useHondurasData';
import { SelectField } from '../shared/SelectField';
import { api } from '../../../infrastructure/api/client';
import { aiAdapter } from '../../../infrastructure/api/aiAdapter';
import { ConfirmModal } from './ConfirmModal';
import { LocationPicker } from '../shared/LocationPicker';
import type { Property } from '../../../core/domain/entities/types';

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

interface ImageItem {
  type: 'existing' | 'file';
  id?: string;
  url?: string;
  file?: File;
  preview?: string;
  deleting?: boolean;
  label?: string;
}

function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('aa_theme') as 'light' | 'dark') || 'light';
}

export function NewPropertyDrawer({ open, onClose, property }: Props) {
  const [tab, setTab] = useState<'propiedad' | 'lote' | 'lotificacion'>('propiedad');
  const [form, setForm] = useState({
    title: '', departamento: 'Yoro', dep_code: 'YO', municipio: 'El Progreso',
    area_varas: '', area_m2: '', price: '', discount_price: '', financing: true, contado: true,
    financing_prima: '20', prima_es_fija: false, prima_monto: '',
    plazo_anios: '10', financing_tasa_anual: '12',
    precio_financiado: '',
    description: '', dimensions: '', total_lots: '1', available_lots: '1',
    status: 'disponible',
    map_url: '',
    facebook_title: '',
    facebook_description: '',
    bedrooms: '', bathrooms: '', parking: '',
    has_water: false, has_power: false, has_deed: false,
    highlights: [] as string[],
    lat: null as number | null, lng: null as number | null,
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<{ current: number; total: number } | null>(null);
  const [fbResult, setFbResult] = useState<'idle' | 'posting' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(getStoredTheme() === 'dark');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [housePreviewUrl, setHousePreviewUrl] = useState<string | null>(null);
  const [housePreviewLoading, setHousePreviewLoading] = useState<number | null>(null);
  const [housePreviewError, setHousePreviewError] = useState('');

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const queryClient = useQueryClient();
  const { departamentos } = useHondurasData();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!property?.id) return;
    await deleteProperty.mutateAsync(property.id);
    setConfirmDelete(false);
    onClose();
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (property) {
      setTab(property.property_type === 'lotificadora' ? 'lotificacion' : (property.type === 'Terreno' ? 'lote' : 'propiedad'));
      const plazoMeses = property.financing_plazo_meses || 120;
      setForm({
        title: property.title || '',
        departamento: property.departamento || 'Yoro',
        dep_code: property.dep_code || 'YO',
        municipio: property.municipio || 'El Progreso',
        area_varas: property.area_varas || '',
        area_m2: property.area_m2 || '',
        price: String(property.price || ''),
        discount_price: property.discount_price ? String(property.discount_price) : '',
        financing: property.financing ?? true,
        contado: property.payment_methods?.includes('contado') ?? true,
        financing_prima: String(property.financing_prima || '20'),
        prima_es_fija: property.prima_es_fija ?? false,
        prima_monto: property.prima_monto ? String(property.prima_monto) : '',
        plazo_anios: String(Math.round(plazoMeses / 12) || 10),
        financing_tasa_anual: String(property.financing_tasa_anual || '12'),
        precio_financiado: property.precio_financiado ? String(property.precio_financiado) : '',
        description: property.description || '',
        dimensions: property.dimensions || '',
        total_lots: String(property.total_lots || '1'),
        available_lots: String(property.available_lots || '1'),
        status: property.status || 'disponible',
        map_url: (property as any).map_url || '',
        facebook_title: (property as any).facebook_title || '',
        facebook_description: (property as any).facebook_description || '',
        bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
        bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
        parking: property.parking != null ? String(property.parking) : '',
        has_water: !!property.has_water, has_power: !!property.has_power, has_deed: !!property.has_deed,
        highlights: property.highlights || [],
        lat: property.lat ?? null, lng: property.lng ?? null,
      });
      setImages(
        (property.images || []).map(img => ({
          type: 'existing' as const,
          id: img.id,
          url: img.url,
          preview: img.url,
          label: img.label,
        }))
      );
      setHousePreviewUrl(property.house_preview_url || null);
    } else {
      setTab('propiedad');
      setForm({
        title: '', departamento: 'Yoro', dep_code: 'YO', municipio: 'El Progreso',
        area_varas: '', area_m2: '', price: '', discount_price: '', financing: true, contado: true,
        financing_prima: '20', prima_es_fija: false, prima_monto: '',
        plazo_anios: '10', financing_tasa_anual: '12',
        precio_financiado: '',
        description: '', dimensions: '', total_lots: '1', available_lots: '1',
        status: 'disponible',
        map_url: '',
        facebook_title: '',
        facebook_description: '',
        bedrooms: '', bathrooms: '', parking: '',
        has_water: false, has_power: false, has_deed: false,
        highlights: [],
        lat: null, lng: null,
      });
      setImages([]);
      setHousePreviewUrl(null);
    }
    setError('');
  }, [property, open]);

  if (!open) return null;

  const set = (key: string, value: string | boolean | number | null | string[]) => setForm({ ...form, [key]: value });

  // ── IA: prompt/descripción cruda → campos del formulario ──
  const generarConIA = async () => {
    setAiError('');
    if (aiPrompt.trim().length < 15) { setAiError('Escribí un poco más de contexto (mínimo 15 caracteres).'); return; }
    setAiLoading(true);
    try {
      const d = await aiAdapter.propertyDraft(aiPrompt);
      const dep = d.departamento ? departamentos.find(x => x.nombre.toLowerCase() === d.departamento!.toLowerCase()) : null;
      const muni = dep && d.municipio ? dep.municipios.find(m => m.nombre.toLowerCase() === d.municipio!.toLowerCase()) : null;
      if (d.type) setTab(d.type === 'Terreno' || d.type === 'Lote' ? 'lote' : 'propiedad');
      setForm(f => ({
        ...f,
        title: d.title || f.title,
        description: d.description || f.description,
        price: d.price != null ? String(d.price) : f.price,
        bedrooms: d.bedrooms != null ? String(d.bedrooms) : f.bedrooms,
        bathrooms: d.bathrooms != null ? String(d.bathrooms) : f.bathrooms,
        parking: d.parking != null ? String(d.parking) : f.parking,
        area_varas: d.area_varas || f.area_varas,
        area_m2: d.area_m2 || f.area_m2,
        has_water: d.has_water, has_power: d.has_power, has_deed: d.has_deed,
        highlights: d.highlights?.length ? d.highlights : f.highlights,
        departamento: dep ? dep.nombre : f.departamento,
        dep_code: dep?.code || f.dep_code,
        municipio: muni ? muni.nombre : f.municipio,
      }));
    } catch (err) {
      setAiError((err as Error).message || 'No se pudo generar.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateHousePreview = async (url: string, index: number) => {
    if (!property?.id) return;
    setHousePreviewError('');
    setHousePreviewLoading(index);
    try {
      const res = await api.post<{ url: string }>(`/properties/${property.id}/house-preview`, { imageUrl: url });
      setHousePreviewUrl(res.url);
    } catch (err) {
      setHousePreviewError((err as Error).message || 'No se pudo generar la vista con IA.');
    } finally {
      setHousePreviewLoading(null);
    }
  };

  const handleDimensionsChange = (val: string) => {
    const regex = /([0-9.]+)\s*[xX*]\s*([0-9.]+)/;
    const match = val.match(regex);
    let calculatedM2 = form.area_m2;
    let calculatedVaras = form.area_varas;

    if (match) {
      const w = parseFloat(match[1]);
      const h = parseFloat(match[2]);
      if (!isNaN(w) && !isNaN(h)) {
        const m2 = w * h;
        // In Honduras, 1 m2 is approx 1.43028 varas2
        const varas = m2 * 1.43028;
        calculatedM2 = String(parseFloat(m2.toFixed(2)));
        calculatedVaras = String(Math.round(varas));
      }
    }
    
    setForm(prev => ({
      ...prev,
      dimensions: val,
      area_m2: calculatedM2,
      area_varas: calculatedVaras
    }));
  };

  // ── Theme-aware style helpers ─────────────────────────────
  const bg = isDark ? '#111113' : '#FAF8F3';
  const surface = isDark ? '#1A1A1D' : '#FFFFFF';
  const border = isDark ? '#26262B' : '#E6E0D2';
  const text = isDark ? '#FAF8F3' : '#111113';
  const textMuted = isDark ? '#C9C2B1' : '#5A5A63';
  const textDim = isDark ? '#5A5A63' : '#9A9383';

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: textDim,
    marginBottom: '6px', display: 'block',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: `1px solid ${border}`, borderRadius: '6px',
    fontSize: '14px', color: text, fontWeight: 500,
    outline: 'none', background: surface,
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  // ── Image helpers ─────────────────────────────────────────
  const addFiles = (files: File[]) => {
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      type: 'file' as const,
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...toAdd]);
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    if (img.type === 'file' && img.preview) {
      URL.revokeObjectURL(img.preview);
      setImages(prev => prev.filter((_, i) => i !== index));
      return;
    }
    // Existing image: delete from server if we have propertyId
    if (img.id && property?.id) {
      setImages(prev => prev.map((im, i) => i === index ? { ...im, deleting: true } : im));
      try {
        await api.delete(`/properties/${property.id}/images/${img.id}`);
        setImages(prev => prev.filter((_, i) => i !== index));
        await queryClient.invalidateQueries({ queryKey: ['properties'] });
      } catch (err: any) {
        setImages(prev => prev.map((im, i) => i === index ? { ...im, deleting: false } : im));
        setError('No se pudo eliminar la imagen');
      }
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!form.title.trim()) { setError('El título es requerido'); return; }
    if (!form.price) { setError('El precio es requerido'); return; }

    setIsSubmitting(true);
    setError('');
    setFbResult('idle');
    setUploadStep(null);

    try {
      const backendType = tab === 'propiedad' ? 'Propiedad' : 'Terreno';
      const propertyType = tab === 'lotificacion' ? 'lotificadora' : 'independiente';
      const paymentMethods: string[] = [];
      if (form.contado) paymentMethods.push('contado');
      if (form.financing) paymentMethods.push('financiamiento');

      const existingImages = images
        .filter(img => img.type === 'existing')
        .map((img, i) => ({ url: img.url!, order: i }));

      const payload = {
        title: form.title.trim(),
        type: backendType,
        property_type: propertyType as any,
        departamento: form.departamento,
        dep_code: form.dep_code,
        municipio: form.municipio,
        area_varas: form.area_varas,
        area_m2: form.area_m2,
        dimensions: form.dimensions,
        total_lots: Number(form.total_lots) || 1,
        available_lots: Number(form.available_lots) || 1,
        price: Number(form.price.replace(/,/g, '')) || 0,
        discount_price: form.discount_price ? Number(form.discount_price.replace(/,/g, '')) : undefined,
        financing: form.financing,
        payment_methods: paymentMethods,
        description: form.description,
        financing_prima: form.prima_es_fija ? null : (Number(form.financing_prima) || null),
        prima_es_fija: form.prima_es_fija,
        prima_monto: form.prima_es_fija ? (Number(form.prima_monto) || null) : null,
        financing_plazo_meses: Number(form.plazo_anios) * 12 || null,
        financing_tasa_anual: Number(form.financing_tasa_anual) || null,
        precio_financiado: form.precio_financiado ? (Number(form.precio_financiado.replace(/,/g, '')) || null) : null,
        status: form.status,
        images: existingImages,
        map_url: form.map_url.trim(),
        facebook_title: form.facebook_title.trim(),
        facebook_description: form.facebook_description.trim(),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        parking: form.parking ? Number(form.parking) : null,
        has_water: form.has_water,
        has_power: form.has_power,
        has_deed: form.has_deed,
        highlights: form.highlights,
        lat: form.lat,
        lng: form.lng,
      };

      // 1. Save property
      let propertyId: string;
      if (property) {
        await updateProperty.mutateAsync({ id: property.id, data: payload as any });
        propertyId = property.id;
      } else {
        const created = await createProperty.mutateAsync(payload as any) as any;
        propertyId = created.id;
      }

      // 2. Upload staged files with progress tracking
      const stagedFiles = images.filter(img => img.type === 'file' && img.file);
      if (stagedFiles.length > 0) {
        setUploadStep({ current: 0, total: stagedFiles.length });
        for (let i = 0; i < stagedFiles.length; i++) {
          setUploadStep({ current: i + 1, total: stagedFiles.length });
          await api.upload<{ url: string }>(`/properties/${propertyId}/images`, stagedFiles[i].file!);
        }
      }

      // 3. Refresh listings with new images
      await queryClient.invalidateQueries({ queryKey: ['properties'] });

      // 4. Publish to Facebook AFTER all images are uploaded
      const shouldPostFb = payload.status === 'disponible' && (!property || (property.status !== 'disponible'));
      if (shouldPostFb) {
        setFbResult('posting');
        try {
          await api.post(`/properties/${propertyId}/publish`, {
            facebook_title: form.facebook_title.trim() || undefined,
            facebook_description: form.facebook_description.trim() || undefined,
          });
          setFbResult('ok');
        } catch {
          setFbResult('error');
        }
      }

      // 5. Revoke local blob URLs
      images.filter(img => img.type === 'file' && img.preview).forEach(img => {
        URL.revokeObjectURL(img.preview!);
      });

      // Close after brief moment so user sees FB result
      setTimeout(onClose, shouldPostFb ? 1400 : 400);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la propiedad');
    } finally {
      setIsSubmitting(false);
      setUploadStep(null);
    }
  };

  const activeDept = departamentos.find(d => d.nombre === form.departamento) || departamentos[0];
  const stagedCount = images.filter(i => i.type === 'file').length;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="drawer-container"
        style={{
          background: bg,
          borderLeft: `1px solid ${border}`,
          transition: 'background 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Eyebrow>{property ? 'Edición' : 'Nueva'}</Eyebrow>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', letterSpacing: '-0.025em', color: text }}>
              {property ? 'Editar propiedad' : 'Publicar propiedad'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Icon name="close" size={22} color={textMuted} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${border}` }}>
          {(['propiedad', 'lote', 'lotificacion'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 14px', fontSize: '13px', fontWeight: 600,
              color: tab === t ? text : textDim, fontFamily: 'inherit',
              borderBottom: tab === t ? '2px solid #D4B254' : '2px solid transparent',
              marginBottom: '-1px', textTransform: 'capitalize',
              transition: 'color 0.2s',
            }}>
              {t === 'lotificacion' ? 'Lotificación' : t}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="drawer-two-column">
          {/* Left: form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Asistente IA: pegar prompt/descripción cruda → llena el formulario */}
            <div style={{
              background: isDark ? 'rgba(31,91,66,0.12)' : '#EEF5F0',
              border: `1.5px solid ${isDark ? 'rgba(31,91,66,0.4)' : '#CDE2D4'}`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#7FB596' : '#1F5B42', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
                  <path d="M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2z" />
                </svg>
                Llenado con IA — pegá la descripción cruda o escribí las notas
              </div>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ej: casa de esquina en la 19 de Junio, 3 cuartos, 2 baños, agua y luz, 350 varas, L 2.5M…"
                style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }}
              />
              {aiError && <div style={{ fontSize: 12, color: '#8C3A2E', fontWeight: 600, marginBottom: 8 }}>{aiError}</div>}
              <Button variant="primary" size="sm" onClick={generarConIA}>
                {aiLoading ? 'Generando…' : 'Generar campos con IA'}
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={labelStyle}>Departamento</span>
                <div style={inputStyle}>
                  <SelectField
                    options={departamentos.map(d => ({ value: d.nombre, label: d.nombre }))}
                    value={form.departamento}
                    onChange={nombre => {
                      const d = departamentos.find(d => d.nombre === nombre);
                      setForm(f => ({ ...f, departamento: d?.nombre || nombre, dep_code: d?.code || '', municipio: '' }));
                    }}
                    placeholder="Departamento"
                    theme={isDark ? 'dark' : 'light'}
                    fontSize="0.8125rem"
                    fontWeight={500}
                  />
                </div>
              </div>
              <div>
                <span style={labelStyle}>Municipio</span>
                <div style={inputStyle}>
                  <SelectField
                    options={(activeDept?.municipios || []).map(m => ({ value: m.nombre, label: m.nombre }))}
                    value={form.municipio}
                    onChange={nombre => set('municipio', nombre)}
                    placeholder="Municipio"
                    theme={isDark ? 'dark' : 'light'}
                    fontSize="0.8125rem"
                    fontWeight={500}
                  />
                </div>
              </div>
            </div>

            <div>
              <span style={labelStyle}>Ubicación en el mapa — clic o arrastrá el pin (así sale en el buscador)</span>
              <LocationPicker
                height={220}
                initial={form.lat != null && form.lng != null ? [form.lat, form.lng] : null}
                onPick={(lat, lng) => setForm(f => ({ ...f, lat, lng }))}
              />
              <div style={{ fontSize: 11, color: form.lat != null ? '#4A7C59' : textDim, marginTop: 6, fontWeight: 600 }}>
                {form.lat != null
                  ? `Pin: ${form.lat.toFixed(5)}, ${form.lng?.toFixed(5)} — al público solo se muestra la zona aproximada`
                  : 'Sin pin: la propiedad no aparece en el mapa del buscador'}
              </div>
            </div>

            <div>
              <span style={labelStyle}>Ubicación en Google Maps (Link o Embed)</span>
              <input
                style={inputStyle} value={form.map_url}
                onChange={e => set('map_url', e.target.value)}
                placeholder="Ej: https://maps.app.goo.gl/xxx o iframe embed"
                onFocus={e => e.target.style.borderColor = '#D4B254'}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>

            {tab === 'propiedad' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={labelStyle}>Habitaciones</span>
                  <input type="number" min={0} style={inputStyle} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#D4B254'} onBlur={e => e.target.style.borderColor = border} />
                </div>
                <div>
                  <span style={labelStyle}>Baños</span>
                  <input type="number" min={0} step="0.5" style={inputStyle} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#D4B254'} onBlur={e => e.target.style.borderColor = border} />
                </div>
                <div>
                  <span style={labelStyle}>Parqueos</span>
                  <input type="number" min={0} style={inputStyle} value={form.parking} onChange={e => set('parking', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#D4B254'} onBlur={e => e.target.style.borderColor = border} />
                </div>
              </div>
            )}

            <div>
              <span style={labelStyle}>Servicios y documentos</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {([
                  { key: 'has_water', label: 'Agua potable' },
                  { key: 'has_power', label: 'Energía eléctrica' },
                  { key: 'has_deed', label: 'Escritura en regla' },
                ] as const).map(t => {
                  const on = form[t.key];
                  return (
                    <button key={t.key} type="button" onClick={() => set(t.key, !on)} aria-pressed={on} style={{
                      padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                      border: on ? '1.5px solid #4A7C59' : `1.5px solid ${border}`,
                      background: on ? (isDark ? 'rgba(74,124,89,0.15)' : '#E8F0EA') : 'transparent',
                      color: on ? '#4A7C59' : textDim,
                      transition: 'all 0.15s',
                    }}>
                      {on ? '✓ ' : ''}{t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span style={labelStyle}>Lo especial (chips en la ficha) — Enter para agregar</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: form.highlights.length ? 8 : 0 }}>
                {form.highlights.map((h, i) => (
                  <span key={`${h}-${i}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    border: `1px solid ${border}`, borderRadius: 999, padding: '5px 10px',
                    fontSize: 12, fontWeight: 600, color: textMuted,
                  }}>
                    {h}
                    <button type="button" aria-label={`Quitar ${h}`}
                      onClick={() => set('highlights', form.highlights.filter((_, j) => j !== i))}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: textDim, padding: 0, fontSize: 13, lineHeight: 1 }}>✕</button>
                  </span>
                ))}
              </div>
              <input
                style={inputStyle}
                placeholder='Ej. "Casa de esquina"'
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = (e.target as HTMLInputElement).value.trim();
                    if (v && form.highlights.length < 6) {
                      set('highlights', [...form.highlights, v]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                onFocus={e => e.target.style.borderColor = '#D4B254'}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={labelStyle}>Área (varas²)</span>
                <input style={inputStyle} value={form.area_varas} onChange={e => set('area_varas', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div>
                <span style={labelStyle}>Área (m²)</span>
                <input style={inputStyle} value={form.area_m2} onChange={e => set('area_m2', e.target.value)}
                  placeholder="Autocalculado"
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={labelStyle}>Precio (L)</span>
                <input style={inputStyle} value={form.price} onChange={e => set('price', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div>
                <span style={labelStyle}>Descuento (L)</span>
                <input style={inputStyle} value={form.discount_price} onChange={e => set('discount_price', e.target.value)}
                  placeholder="Opcional"
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
            </div>

            {/* Lot details */}
            <div style={{ padding: '1rem', background: surface, border: `1px solid ${border}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Eyebrow>Detalles de Lote(s)</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: tab === 'lotificacion' ? '1fr 1fr' : '1fr', gap: '12px' }}>
                <div>
                  <span style={labelStyle}>Dimensiones Ej: "14x18m"</span>
                  <input style={inputStyle} value={form.dimensions} onChange={e => handleDimensionsChange(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#D4B254'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                {tab === 'lotificacion' && (
                  <>
                    <div>
                      <span style={labelStyle}>Lotes Totales</span>
                      <input type="number" min="1" style={inputStyle} value={form.total_lots} onChange={e => set('total_lots', e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#D4B254'}
                        onBlur={e => e.target.style.borderColor = border}
                      />
                    </div>
                    <div>
                      <span style={labelStyle}>Lotes Disponibles</span>
                      <input type="number" min="0" style={inputStyle} value={form.available_lots} onChange={e => set('available_lots', e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#D4B254'}
                        onBlur={e => e.target.style.borderColor = border}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <span style={labelStyle}>Método de pago</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'contado', label: 'Contado' },
                  { key: 'financing', label: 'Financiamiento' },
                ].map(({ key, label }) => {
                  const checked = form[key as keyof typeof form] as boolean;
                  return (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 14px', border: `1px solid ${checked ? '#D4B254' : border}`,
                      borderRadius: 8, fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer',
                      background: checked ? (isDark ? 'rgba(212,178,84,0.12)' : '#FBF6E9') : surface,
                      color: checked ? '#D4B254' : textMuted,
                      transition: 'all 0.2s',
                    }}>
                      <input
                        type="checkbox" checked={checked} className="accent-gold-300"
                        onChange={e => set(key, e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        width: '16px', height: '16px', border: `2px solid ${checked ? '#D4B254' : border}`,
                        borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: checked ? '#D4B254' : 'transparent', flexShrink: 0,
                      }}>
                        {checked && <span style={{ color: '#111113', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                      </span>
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Financing details */}
            {form.financing && (
              <div style={{ padding: '1rem', background: surface, border: `1px solid ${border}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Eyebrow>Plan de financiamiento</Eyebrow>

                {/* Precio financiado */}
                <div>
                  <span style={labelStyle}>Precio financiado (L) <span style={{ color: textDim, textTransform: 'none', fontWeight: 400 }}>— si difiere del precio contado</span></span>
                  <input style={inputStyle} value={form.precio_financiado}
                    onChange={e => set('precio_financiado', e.target.value)}
                    placeholder={form.price || 'Mismo que contado'}
                    onFocus={e => e.target.style.borderColor = '#D4B254'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>

                {/* Prima type toggle */}
                <div>
                  <span style={labelStyle}>Tipo de prima</span>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {[{ v: false, label: 'Porcentaje (%)' }, { v: true, label: 'Monto fijo (L)' }].map(({ v, label }) => (
                      <button key={String(v)} onClick={() => set('prima_es_fija', v)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: '12px', fontWeight: 600,
                          border: `1px solid ${form.prima_es_fija === v ? '#D4B254' : border}`,
                          background: form.prima_es_fija === v ? (isDark ? 'rgba(212,178,84,0.12)' : '#FBF6E9') : surface,
                          color: form.prima_es_fija === v ? '#D4B254' : textMuted,
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >{label}</button>
                    ))}
                  </div>
                  {form.prima_es_fija ? (
                    <input style={inputStyle} value={form.prima_monto}
                      onChange={e => set('prima_monto', e.target.value)}
                      placeholder="Ej: 50000"
                      onFocus={e => e.target.style.borderColor = '#D4B254'}
                      onBlur={e => e.target.style.borderColor = border}
                    />
                  ) : (
                    <input style={inputStyle} value={form.financing_prima}
                      onChange={e => set('financing_prima', e.target.value)}
                      placeholder="Ej: 20"
                      onFocus={e => e.target.style.borderColor = '#D4B254'}
                      onBlur={e => e.target.style.borderColor = border}
                    />
                  )}
                </div>

                {/* Plazo + Tasa */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={labelStyle}>Plazo (años)</span>
                    <div style={inputStyle}>
                      <SelectField
                        options={[5,8,10,12,15,20,25,30].map(y => ({ value: String(y), label: `${y} años (${y * 12} meses)` }))}
                        value={form.plazo_anios}
                        onChange={v => set('plazo_anios', v)}
                        theme={isDark ? 'dark' : 'light'}
                        fontSize="0.8125rem"
                        fontWeight={500}
                      />
                    </div>
                  </div>
                  <div>
                    <span style={labelStyle}>Tasa anual (%)</span>
                    <input style={inputStyle} value={form.financing_tasa_anual}
                      onChange={e => set('financing_tasa_anual', e.target.value)}
                      placeholder="Ej: 12"
                      onFocus={e => e.target.style.borderColor = '#D4B254'}
                      onBlur={e => e.target.style.borderColor = border}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <span style={labelStyle}>Estado</span>
              <div style={inputStyle}>
                <SelectField
                  options={[
                    { value: 'disponible', label: 'Disponible · se publicará en Facebook' },
                    { value: 'borrador', label: 'Borrador · no se publica' },
                    { value: 'apartado', label: 'Apartado' },
                    { value: 'vendido', label: 'Vendido' },
                  ]}
                  value={form.status}
                  onChange={v => set('status', v)}
                  theme={isDark ? 'dark' : 'light'}
                  fontSize="0.8125rem"
                  fontWeight={500}
                />
              </div>
            </div>

            {/* Sección: Copys Web */}
            <div style={{
              padding: '1.25rem', background: surface, border: `1px solid ${border}`,
              borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <Eyebrow>Contenido para Sitio Web</Eyebrow>
              <div>
                <span style={labelStyle}>Título Web</span>
                <input
                  style={inputStyle} value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Ej: Terreno residencial en Valle de Ángeles"
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div>
                <span style={labelStyle}>Descripción Web</span>
                <textarea
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describa los detalles completos de la propiedad para la web..."
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
            </div>

            {/* Sección: Copys Facebook */}
            <div style={{
              padding: '1.25rem', background: surface, border: `1px solid ${border}`,
              borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <Eyebrow>Contenido para Facebook</Eyebrow>
              <div>
                <span style={labelStyle}>Título Facebook (Opcional)</span>
                <input
                  style={inputStyle} value={form.facebook_title}
                  onChange={e => set('facebook_title', e.target.value)}
                  placeholder="Dejar vacío para usar el Título Web"
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div>
                <span style={labelStyle}>Descripción Facebook (Opcional)</span>
                <textarea
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={form.facebook_description}
                  onChange={e => set('facebook_description', e.target.value)}
                  placeholder="Dejar vacío para usar la Descripción Web"
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />

                {/* Magic Link button */}
                {property?.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const magicLink = `\n\nVer propiedad: https://www.aabienes.com/propiedad/${property.id}`;
                      const current = form.facebook_description;
                      // Don't add if already present
                      if (current.includes(`/propiedad/${property.id}`)) return;
                      set('facebook_description', current.trimEnd() + magicLink);
                    }}
                    style={{
                      marginTop: 6, padding: '0.4rem 0.75rem',
                      background: form.facebook_description.includes(`/propiedad/${property.id}`)
                        ? 'rgba(74,124,89,0.1)' : surface,
                      color: form.facebook_description.includes(`/propiedad/${property.id}`)
                        ? '#4A7C59' : textMuted,
                      border: `1px solid ${form.facebook_description.includes(`/propiedad/${property.id}`) ? 'rgba(74,124,89,0.3)' : border}`,
                      borderRadius: 8,
                      fontSize: '0.75rem', fontWeight: 600,
                      fontFamily: 'inherit', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {form.facebook_description.includes(`/propiedad/${property.id}`)
                      ? '✓ Enlace adjuntado'
                      : 'Adjuntar enlace de la propiedad'}
                  </button>
                ) : (
                  <div style={{
                    marginTop: 6, fontSize: '0.6875rem',
                    color: 'var(--main-text-dim, #9A9383)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    El enlace estará disponible después de guardar
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: image gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem', background: surface, border: `1px solid ${border}`,
              borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Eyebrow>Galería de imágenes</Eyebrow>
                <span style={{ fontSize: '11px', color: textDim }}>
                  {images.length}/10
                  {stagedCount > 0 && ` · ${stagedCount} por subir`}
                </span>
              </div>

              {/* Drop zone */}
              {images.length < 10 && (
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragOver ? '#D4B254' : border}`,
                    borderRadius: '10px',
                    padding: '1.75rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragOver
                      ? 'rgba(212,178,84,0.06)'
                      : isDark ? '#111113' : '#FAF8F3',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                  <div style={{ marginBottom: '8px', lineHeight: 1, display: 'flex', justifyContent: 'center', color: textMuted }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: textMuted, marginBottom: '4px' }}>
                    {isDragOver ? 'Suelta las fotos aquí' : 'Arrastra fotos aquí'}
                  </div>
                  <div style={{ fontSize: '11px', color: textDim }}>
                    o click para seleccionar · JPG, PNG, WEBP
                  </div>
                </div>
              )}

              {/* Thumbnails */}
              {images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
                  gap: '8px',
                  overflowY: 'auto',
                  maxHeight: '340px',
                  paddingRight: '2px',
                }}>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'relative', borderRadius: '8px', overflow: 'hidden',
                        aspectRatio: '1', background: border,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        opacity: img.deleting ? 0.5 : 1,
                        transition: 'opacity 0.2s',
                      }}
                      className="upload-thumb-container"
                    >
                      <img
                        src={img.preview || img.url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {img.deleting && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(0,0,0,0.4)',
                          fontSize: '18px',
                        }}>⏳</div>
                      )}
                      {/* Remove button */}
                      {!img.deleting && (
                        <button
                          onClick={() => removeImage(i)}
                          style={{
                            position: 'absolute', top: '4px', right: '4px',
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'rgba(0,0,0,0.65)', color: 'white',
                            border: 'none', cursor: 'pointer',
                            fontSize: '14px', lineHeight: '1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                          }}
                          title="Eliminar"
                        >×</button>
                      )}
                      {/* New badge */}
                      {img.type === 'file' && (
                        <span style={{
                          position: 'absolute', bottom: '4px', left: '4px',
                          background: 'rgba(212,178,84,0.92)', color: '#111113',
                          fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em',
                          padding: '2px 5px', borderRadius: '3px', textTransform: 'uppercase',
                        }}>Nuevo</span>
                      )}
                      {/* Etiqueta IA */}
                      {img.label && (
                        <span style={{
                          position: 'absolute', bottom: '4px', left: '4px',
                          background: 'rgba(17,17,19,0.78)', color: '#EEF5F0',
                          fontSize: '9px', fontWeight: 600,
                          padding: '2px 5px', borderRadius: '3px',
                        }}>IA: {img.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: textDim, fontSize: '13px', fontStyle: 'italic' }}>
                  Sin imágenes
                </div>
              )}

              {/* Vista realista con IA — solo terrenos/lotes ya guardados con fotos */}
              {tab === 'lote' && property?.id && images.some(i => i.type === 'existing') && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${border}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: text, marginBottom: 4 }}>
                    Vista realista con IA
                  </div>
                  <div style={{ fontSize: '12px', color: textDim, marginBottom: '0.75rem' }}>
                    Elegí una foto del terreno — la IA genera una casa realista construida ahí, para mostrar en la página pública.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {images.filter(i => i.type === 'existing').map((img, i) => (
                      <button key={img.id || i} type="button"
                        onClick={() => img.url && generateHousePreview(img.url, i)}
                        disabled={housePreviewLoading !== null}
                        style={{
                          position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden',
                          border: `1px solid ${border}`, padding: 0, cursor: housePreviewLoading !== null ? 'wait' : 'pointer',
                          background: 'none',
                        }}
                        title="Generar casa realista a partir de esta foto"
                      >
                        <img src={img.preview || img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <span style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(17,17,19,0.45)', color: '#FAF8F3', fontSize: 18,
                          opacity: housePreviewLoading === i ? 1 : 0,
                          transition: 'opacity 0.15s',
                        }}>{housePreviewLoading === i ? '⏳' : ''}</span>
                      </button>
                    ))}
                  </div>
                  {housePreviewError && (
                    <div style={{ fontSize: '12px', color: '#8C3A2E', marginBottom: '0.5rem' }}>{housePreviewError}</div>
                  )}
                  {housePreviewUrl && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                        Vista generada
                      </div>
                      <img src={housePreviewUrl} alt="Vista generada por IA"
                        style={{ width: '100%', maxWidth: 320, borderRadius: 10, border: `1px solid ${border}`, display: 'block' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Facebook note */}
              {form.status === 'disponible' && (
                <div style={{
                  padding: '10px 12px',
                  background: isDark ? 'rgba(66,103,178,0.12)' : 'rgba(66,103,178,0.06)',
                  border: `1px solid ${isDark ? 'rgba(66,103,178,0.25)' : 'rgba(66,103,178,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '11px', color: isDark ? '#8BA8E8' : '#3B5998',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>Se publicará automáticamente en Facebook al guardar</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${border}`, paddingTop: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={handleSubmit}>
            {isSubmitting
              ? uploadStep
                ? `Subiendo foto ${uploadStep.current}/${uploadStep.total}…`
                : fbResult === 'posting'
                  ? 'Publicando en Facebook…'
                  : 'Guardando…'
              : (property ? 'Guardar cambios' : 'Publicar propiedad')}
          </Button>
          <Button variant="ghost" size="lg" onClick={onClose} >Cancelar</Button>

          {property && (
            <button
              onClick={handleDelete}
              style={{
                marginLeft: 'auto',
                padding: '10px 16px',
                background: 'none',
                border: '1px solid rgba(140,58,46,0.3)',
                color: '#8C3A2E',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(140,58,46,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {property.property_type === 'lotificadora' ? 'Eliminar lotificación' : 'Eliminar propiedad'}
            </button>
          )}

          {/* Status feedback */}
          {fbResult === 'ok' && (
            <span style={{ fontSize: '13px', color: '#4A7C59', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Publicado en Facebook
            </span>
          )}
          {fbResult === 'error' && (
            <span style={{ fontSize: '13px', color: '#B8862E', fontWeight: 500 }}>
              Propiedad guardada · Facebook falló
            </span>
          )}
          {error && (
            <span style={{ fontSize: '13px', color: '#8C3A2E', fontWeight: 500 }}>
              ✕ {error}
            </span>
          )}
        </div>
      </div>

      {confirmDelete && property && (
        <ConfirmModal
          title={property.property_type === 'lotificadora' ? `¿Eliminar lotificación "${property.title}"?` : `¿Eliminar "${property.title}"?`}
          message={property.property_type === 'lotificadora' ? "Se eliminarán todos los lotes y los pagos asociados a esta lotificación. Esta acción no se puede deshacer." : "Si fue publicada en Facebook, también se eliminará ese post. Esta acción no se puede deshacer."}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(false)}
          m={{
            mainBg: bg,
            mainSurface: surface,
            mainBorder: border,
            mainText: text,
            mainTextMuted: textMuted,
            mainTextDim: textDim,
            mainCardBg: surface,
            mainTopbarBg: bg,
          }}
        />
      )}
    </div>
  );
}
