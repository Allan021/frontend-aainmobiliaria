import { useState } from 'react';
import { IconSearch, IconSpinner } from '../../../shared/rs-icons';
import { geocode, geocodeDisponible, esPrecisa } from '../../../shared/map/geocode';
import { FieldShell } from './FieldShell';
import { useAdminTheme } from '../theme';

interface Props {
  municipio?: string;
  departamento?: string;
  onFound: (lat: number, lng: number) => void;
}

/** Busca una dirección y mueve el pin. El municipio y el departamento ya
 *  elegidos se agregan a la consulta para no depender de que se escriban. */
export function AddressSearch({ municipio, departamento, onFound }: Props) {
  const t = useAdminTheme();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'aprox' | 'nada'; texto: string } | null>(null);

  if (!geocodeDisponible) return null;

  const buscar = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setMsg(null);
    const hit = await geocode(q, municipio, departamento);
    setLoading(false);

    if (!hit) {
      setMsg({ tipo: 'nada', texto: 'No encontramos esa dirección. Marcá el punto en el mapa a mano.' });
      return;
    }
    onFound(hit.lat, hit.lng);
    setMsg({
      tipo: esPrecisa(hit.precision) ? 'ok' : 'aprox',
      texto: esPrecisa(hit.precision)
        ? `Pin movido a ${hit.label}.`
        : `Ubicación aproximada: ${hit.label}. Arrastrá el pin al punto exacto.`,
    });
  };

  const color = msg?.tipo === 'ok' ? t.ok : msg?.tipo === 'aprox' ? '#B8862E' : t.danger;

  return (
    <FieldShell
      label="Buscar por dirección"
      hint="Escribí la colonia, el barrio o un punto de referencia y movemos el pin por vos."
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="admin-input"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscar(); } }}
          placeholder="Colonia 19 de Junio, frente al parque"
          aria-label="Dirección a buscar"
        />
        <button type="button" onClick={buscar} disabled={loading || !q.trim()} className="admin-btn admin-btn--ghost">
          {loading ? <IconSpinner size={15} /> : <IconSearch size={15} />}
          Buscar
        </button>
      </div>
      {msg && (
        <div role="status" style={{ fontSize: 12.5, color, fontWeight: 600, marginTop: 7, lineHeight: 1.45 }}>
          {msg.texto}
        </div>
      )}
    </FieldShell>
  );
}
