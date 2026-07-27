import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../infrastructure/api/client';
import { useCreateProperty, useUpdateProperty } from '../../../hooks/useProperties';
import type { Property } from '../../../../core/domain/entities/types';
import { clearDraft } from './usePropertyForm';
import { toBackendType, type ImageItem, type PropertyForm, type PropertyKind } from './types';

export type SubmitPhase =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'uploading'; current: number; total: number }
  | { kind: 'posting' }
  | { kind: 'done'; facebook: 'ok' | 'error' | 'skipped' };

interface Args {
  form: PropertyForm;
  kind: PropertyKind;
  images: ImageItem[];
  property?: Property | null;
  onDone: () => void;
}

function buildPayload(form: PropertyForm, kind: PropertyKind, images: ImageItem[]) {
  const metodos: string[] = [];
  if (form.contado) metodos.push('contado');
  if (form.financing) metodos.push('financiamiento');

  const num = (v: string) => (v ? Number(v.replace(/,/g, '')) || null : null);

  return {
    ...toBackendType(kind),
    title: form.title.trim(),
    departamento: form.departamento,
    dep_code: form.dep_code,
    municipio: form.municipio,
    area_varas: form.area_varas,
    area_m2: form.area_m2,
    dimensions: form.dimensions,
    total_lots: Number(form.total_lots) || 1,
    available_lots: Number(form.available_lots) || 1,
    price: num(form.price) ?? 0,
    discount_price: num(form.discount_price) ?? undefined,
    financing: form.financing,
    payment_methods: metodos,
    description: form.description,
    financing_prima: form.prima_es_fija ? null : num(form.financing_prima),
    prima_es_fija: form.prima_es_fija,
    prima_monto: form.prima_es_fija ? num(form.prima_monto) : null,
    financing_plazo_meses: Number(form.plazo_anios) * 12 || null,
    financing_tasa_anual: num(form.financing_tasa_anual),
    precio_financiado: num(form.precio_financiado),
    status: form.status,
    // El orden del array es el orden en la ficha; el primero es la portada
    images: images.filter(i => i.type === 'existing').map((img, i) => ({ url: img.url!, order: i })),
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
}

export function usePropertySubmit({ form, kind, images, property, onDone }: Args) {
  const [phase, setPhase] = useState<SubmitPhase>({ kind: 'idle' });
  const [error, setError] = useState('');
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const queryClient = useQueryClient();

  const busy = phase.kind !== 'idle' && phase.kind !== 'done';

  const submit = async () => {
    if (busy) return;
    setError('');
    setPhase({ kind: 'saving' });

    try {
      const payload = buildPayload(form, kind, images);

      let propertyId: string;
      if (property) {
        await updateProperty.mutateAsync({ id: property.id, data: payload as any });
        propertyId = property.id;
      } else {
        const creada = await createProperty.mutateAsync(payload as any) as any;
        propertyId = creada.id;
      }

      const nuevas = images.filter(i => i.type === 'file' && i.file);
      for (let i = 0; i < nuevas.length; i++) {
        setPhase({ kind: 'uploading', current: i + 1, total: nuevas.length });
        await api.upload(`/properties/${propertyId}/images`, nuevas[i].file!);
      }

      await queryClient.invalidateQueries({ queryKey: ['properties'] });

      // Solo se postea al pasar a disponible, no en cada guardado
      const debePostear = form.status === 'disponible' && (!property || property.status !== 'disponible');
      let facebook: 'ok' | 'error' | 'skipped' = 'skipped';
      if (debePostear) {
        setPhase({ kind: 'posting' });
        try {
          await api.post(`/properties/${propertyId}/publish`, {
            facebook_title: form.facebook_title.trim() || undefined,
            facebook_description: form.facebook_description.trim() || undefined,
          });
          facebook = 'ok';
        } catch {
          facebook = 'error';
        }
      }

      images.forEach(i => { if (i.type === 'file' && i.preview) URL.revokeObjectURL(i.preview); });
      if (!property) clearDraft();

      setPhase({ kind: 'done', facebook });
      setTimeout(onDone, facebook === 'ok' ? 1400 : 500);
    } catch (err) {
      setPhase({ kind: 'idle' });
      setError((err as Error).message || 'No se pudo guardar. Revisá tu conexión e intentá de nuevo.');
    }
  };

  return { submit, phase, busy, error };
}
