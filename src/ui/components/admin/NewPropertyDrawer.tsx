import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Eyebrow } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { useCreateProperty, useUpdateProperty, useDeleteProperty } from '../../hooks/useProperties';
import { useHondurasData } from '../../hooks/useHondurasData';
import { SelectField } from '../shared/SelectField';
import { api } from '../../../infrastructure/api/client';
import { ConfirmModal } from './ConfirmModal';
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
}

function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('aa_theme') as 'light' | 'dark') || 'light';
}

export function NewPropertyDrawer({ open, onClose, property }: Props) {
  const [tab, setTab] = useState<'propiedad' | 'lote' | 'lotificacion'>('propiedad');
  const [form, setForm] = useState({
    title: '', departamento: 'Yoro', dep_code: 'YO', municipio: 'El Progreso',
    area_varas: '', price: '', discount_price: '', financing: true, contado: true,
    financing_prima: '20', prima_es_fija: false, prima_monto: '',
    plazo_anios: '10', financing_tasa_anual: '12',
    precio_financiado: '',
    description: '', dimensions: '', total_lots: '1', available_lots: '1',
    status: 'disponible',
    map_url: '',
    facebook_title: '',
    facebook_description: '',
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<{ current: number; total: number } | null>(null);
  const [fbResult, setFbResult] = useState<'idle' | 'posting' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(getStoredTheme() === 'dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setTab(property.property_type === 'lotificadora' ? 'lotificacion' : (property.type === 'Lote' ? 'lote' : 'propiedad'));
      const plazoMeses = property.financing_plazo_meses || 120;
      setForm({
        title: property.title || '',
        departamento: property.departamento || 'Yoro',
        dep_code: property.dep_code || 'YO',
        municipio: property.municipio || 'El Progreso',
        area_varas: property.area_varas || '',
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
      });
      setImages(
        (property.images || []).map(img => ({
          type: 'existing' as const,
          id: img.id,
          url: img.url,
          preview: img.url,
        }))
      );
    } else {
      setTab('propiedad');
      setForm({
        title: '', departamento: 'Yoro', dep_code: 'YO', municipio: 'El Progreso',
        area_varas: '', price: '', discount_price: '', financing: true, contado: true,
        financing_prima: '20', prima_es_fija: false, prima_monto: '',
        plazo_anios: '10', financing_tasa_anual: '12',
        precio_financiado: '',
        description: '', dimensions: '', total_lots: '1', available_lots: '1',
        status: 'disponible',
        map_url: '',
        facebook_title: '',
        facebook_description: '',
      });
      setImages([]);
    }
    setError('');
  }, [property, open]);

  if (!open) return null;

  const set = (key: string, value: string | boolean) => setForm({ ...form, [key]: value });

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
      const backendType = tab === 'lote' ? 'Lote' : tab === 'lotificacion' ? 'Lote' : 'Terreno';
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
          await api.post(`/properties/${propertyId}/publish`);
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={labelStyle}>Departamento</span>
                <div style={inputStyle}>
                  <SelectField
                    options={departamentos.map(d => ({ value: d.nombre, label: d.nombre }))}
                    value={form.departamento}
                    onChange={nombre => {
                      const d = departamentos.find(d => d.nombre === nombre);
                      setForm(f => ({ ...f, departamento: d?.nombre || nombre, dep_code: d?.id ? String(d.id) : '', municipio: '' }));
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
              <span style={labelStyle}>Ubicación en Google Maps (Link o Embed)</span>
              <input
                style={inputStyle} value={form.map_url}
                onChange={e => set('map_url', e.target.value)}
                placeholder="Ej: https://maps.app.goo.gl/xxx o iframe embed"
                onFocus={e => e.target.style.borderColor = '#D4B254'}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <span style={labelStyle}>Área (varas²)</span>
                <input style={inputStyle} value={form.area_varas} onChange={e => set('area_varas', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#D4B254'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
            </div>

            {/* Lot details */}
            <div style={{ padding: '1rem', background: surface, border: `1px solid ${border}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Eyebrow>Detalles de Lote(s)</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: tab === 'lotificacion' ? '1fr 1fr' : '1fr', gap: '12px' }}>
                <div>
                  <span style={labelStyle}>Dimensiones Ej: "14x18m"</span>
                  <input style={inputStyle} value={form.dimensions} onChange={e => set('dimensions', e.target.value)}
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
                      borderRadius: '999px', fontSize: '13px', fontWeight: 600,
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
                          padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
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
                  <div style={{ fontSize: '28px', marginBottom: '8px', lineHeight: 1 }}>📷</div>
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
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: textDim, fontSize: '13px', fontStyle: 'italic' }}>
                  Sin imágenes
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
                  <span>📘</span>
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
              📘 Publicado en Facebook
            </span>
          )}
          {fbResult === 'error' && (
            <span style={{ fontSize: '13px', color: '#B8862E', fontWeight: 500 }}>
              ⚠ Propiedad guardada · Facebook falló
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
