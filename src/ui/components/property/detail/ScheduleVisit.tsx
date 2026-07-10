import { useMemo, useState } from 'react';
import { leadAdapter } from '../../../../infrastructure/api/leadAdapter';
import { IconCheckCircle, IconCalendar } from '../../shared/rs-icons';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

interface ScheduleVisitProps {
  propertyId: string;
  propertyTitle: string;
}

function nextDays(count: number) {
  const days: { value: string; weekday: string; day: number; month: string }[] = [];
  const fmtWd = new Intl.DateTimeFormat('es-HN', { weekday: 'short' });
  const fmtMo = new Intl.DateTimeFormat('es-HN', { month: 'short' });
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: d.toISOString().slice(0, 10),
      weekday: fmtWd.format(d).replace('.', ''),
      day: d.getDate(),
      month: fmtMo.format(d).replace('.', ''),
    });
  }
  return days;
}

/** Card "Agendar visita" estilo Zillow: fecha + hora + contacto → crea lead agendado */
export function ScheduleVisit({ propertyId, propertyTitle }: ScheduleVisitProps) {
  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(days[0].value);
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) { setError('Nombre y correo son requeridos.'); return; }
    setSending(true);
    try {
      await leadAdapter.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        property_id: propertyId,
        property_title: propertyTitle,
        visit_date: date,
        visit_time: time,
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message || 'No se pudo agendar. Intente de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const inputStyle: React.CSSProperties = { fontSize: '0.8125rem', minHeight: 44 };

  if (sent) {
    return (
      <div style={{
        background: 'var(--color-pine-50, #EEF5F0)', border: '1.5px solid var(--color-pine-300, #7FB596)',
        borderRadius: 16, padding: '1.5rem', textAlign: 'center',
      }} role="status">
        <div style={{ color: 'var(--color-pine-600, #1F5B42)', display: 'flex', justifyContent: 'center' }}>
          <IconCheckCircle size={30} />
        </div>
        <div style={{ fontWeight: 800, color: 'var(--color-pine-800, #103627)', marginTop: 8 }}>¡Visita solicitada!</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-pine-700, #174834)', marginTop: 4, lineHeight: 1.5 }}>
          Le confirmaremos la visita del <b>{date}</b> a las <b>{time}</b> por WhatsApp o correo.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{
      background: 'var(--main-card-bg, #fff)',
      border: '1.5px solid var(--main-border, #E6E0D2)',
      borderRadius: 16, padding: '1.25rem',
      boxShadow: '0 8px 24px -8px rgba(17,17,19,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: 'var(--main-text, #111113)', letterSpacing: '-0.01em' }}>
        <span style={{ color: 'var(--color-pine-600, #1F5B42)', display: 'flex' }}><IconCalendar size={17} /></span>
        Agendar una visita
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--main-text-dim, #9A9383)', marginTop: 2, marginBottom: 12 }}>
        Gratis y sin compromiso — un asesor le acompaña.
      </div>

      {/* Día */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map(d => {
          const active = d.value === date;
          return (
            <button key={d.value} type="button" onClick={() => setDate(d.value)} style={{
              flex: '0 0 auto', width: 56, padding: '0.5rem 0', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'center',
              border: active ? '2px solid var(--color-pine-600, #1F5B42)' : '1.5px solid var(--main-border, #E6E0D2)',
              background: active ? 'var(--color-pine-50, #EEF5F0)' : 'var(--main-card-bg, #fff)',
            }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: active ? 'var(--color-pine-700, #174834)' : 'var(--main-text-dim, #9A9383)' }}>
                {d.weekday}
              </div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: active ? 'var(--color-pine-800, #103627)' : 'var(--main-text, #111113)' }}>
                {d.day}
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--main-text-dim, #9A9383)' }}>{d.month}</div>
            </button>
          );
        })}
      </div>

      {/* Hora */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {TIME_SLOTS.map(t => (
          <button key={t} type="button" onClick={() => setTime(t)}
            className={`rs-chip ${t === time ? 'rs-chip--active' : ''}`}
            aria-pressed={t === time}>
            {t}
          </button>
        ))}
      </div>

      {/* Contacto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <input className="rs-input" placeholder="Su nombre *" aria-label="Su nombre" value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoComplete="name" />
        <input className="rs-input" placeholder="Correo electrónico *" aria-label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} autoComplete="email" inputMode="email" />
        <input className="rs-input" placeholder="Teléfono (opcional)" aria-label="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} autoComplete="tel" inputMode="tel" />
      </div>

      {error && (
        <div className="rs-field-error" role="alert" style={{ marginTop: 8 }}>{error}</div>
      )}

      <button type="submit" disabled={sending} className="rs-btn rs-btn--primary" style={{ width: '100%', marginTop: 12 }}>
        {sending ? 'Enviando…' : 'Solicitar visita'}
      </button>
    </form>
  );
}
