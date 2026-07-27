import { useMemo, useState } from 'react';
import { leadAdapter } from '../../../../infrastructure/api/leadAdapter';
import { cleanTitle, type Property } from '../../../../core/domain/entities/types';
import { WhatsAppIcon } from '../../shared/Icon';

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

function waLink(phone: string, msg: string) {
  const num = phone.replace(/\D/g, '');
  return `https://wa.me/${num.startsWith('504') ? num : '504' + num}?text=${encodeURIComponent(msg)}`;
}

/* ── Tarjeta lateral: agendar visita ── */
export function AgendarVisita({ property, phone }: { property: Property; phone: string }) {
  const days = useMemo(() => {
    const dows = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const out: { value: string; dow: string; num: number; label: string }[] = [];
    for (let i = 1; i <= 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push({
        value: d.toISOString().slice(0, 10),
        dow: dows[d.getDay()],
        num: d.getDate(),
        label: `${dows[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`,
      });
    }
    return out;
  }, []);
  const HORAS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '4:00 PM'];

  const [dia, setDia] = useState(0);
  const [hora, setHora] = useState(HORAS[1]);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setError('');
    if (!name.trim() || !tel.trim()) { setError('Ingresá tu nombre y tu WhatsApp para confirmar.'); return; }
    setSending(true);
    const d = days[dia];
    try {
      await leadAdapter.create({
        name: name.trim(),
        email: '',
        phone: tel.trim(),
        property_id: property.id,
        property_title: property.title,
        visit_date: d.value,
        visit_time: hora,
      });
    } catch {
      // el lead es best-effort: la visita se confirma por WhatsApp igual
    }
    const msg = `Hola A&A, soy ${name.trim()}. Quiero agendar una visita a: ${cleanTitle(property.title)} (${property.municipio}, ${property.departamento}).\nDía: ${d.label}\nHora: ${hora}\n¿Me confirman disponibilidad?`;
    window.open(waLink(phone, msg), '_blank', 'noopener');
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid var(--pub-border2)', borderRadius: 10, padding: '11px 14px',
    fontFamily: F_SANS, fontSize: 14, fontWeight: 500,
    outlineColor: '#1F5B42', background: 'var(--pub-bg)', color: 'var(--pub-ink)',
  };

  return (
    <div style={{
      background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 18, padding: 24,
      boxShadow: '0 16px 40px -16px rgba(17,17,19,0.12)',
    }}>
      <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', marginBottom: 4, color: 'var(--pub-ink)' }}>
        Agendá tu visita
      </div>
      <div style={{ fontSize: '13.5px', color: 'var(--pub-muted)', marginBottom: 18 }}>
        Elegí día y hora — te confirmamos por WhatsApp. Sin llamadas, sin compromiso.
      </div>

      <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.12em', color: 'var(--pub-dim)', marginBottom: 8 }}>DÍA</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {days.map((d, i) => {
          const sel = dia === i;
          return (
            <button key={d.value} type="button" onClick={() => setDia(i)} style={{
              border: sel ? '2px solid #1F5B42' : '1.5px solid var(--pub-border2)',
              background: sel ? '#1F5B42' : 'var(--pub-bg)',
              color: sel ? '#EEF5F0' : 'var(--pub-muted2)',
              borderRadius: 10, padding: '8px 0', cursor: 'pointer',
              fontFamily: F_SANS, textAlign: 'center', transition: 'all 0.15s',
            }}>
              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, opacity: 0.75 }}>{d.dow}</span>
              <span style={{ display: 'block', fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 16 }}>{d.num}</span>
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.12em', color: 'var(--pub-dim)', marginBottom: 8 }}>HORA</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
        {HORAS.map(h => {
          const sel = hora === h;
          return (
            <button key={h} type="button" onClick={() => setHora(h)} style={{
              border: sel ? '2px solid #1F5B42' : '1.5px solid var(--pub-border2)',
              background: sel ? '#1F5B42' : 'var(--pub-bg)',
              color: sel ? '#EEF5F0' : 'var(--pub-muted2)',
              borderRadius: 9, padding: '9px 0', cursor: 'pointer',
              fontFamily: F_SANS, fontWeight: sel ? 700 : 600, fontSize: 13, transition: 'all 0.15s',
            }}>{h}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <input placeholder="Tu nombre" aria-label="Tu nombre" value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoComplete="name" />
        <input placeholder="Tu WhatsApp (ej. 9999-9999)" aria-label="Tu WhatsApp" value={tel} onChange={e => setTel(e.target.value)} style={inputStyle} autoComplete="tel" inputMode="tel" />
      </div>

      {error && <div style={{ fontSize: '12.5px', color: '#8C3A2E', fontWeight: 600, marginBottom: 10 }} role="alert">{error}</div>}

      <button onClick={submit} disabled={sending} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', textAlign: 'center', background: '#25D366', color: '#0A3D22',
        fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: '15.5px', padding: '15px 0',
        borderRadius: 12, border: 'none', cursor: sending ? 'wait' : 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
      >
        <WhatsAppIcon size={16} color="#0A3D22" />
        {sending ? 'Enviando…' : 'Confirmar visita por WhatsApp'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--pub-dim)', marginTop: 10 }}>
        Visita: {days[dia].label} · {hora}
      </div>
    </div>
  );
}
