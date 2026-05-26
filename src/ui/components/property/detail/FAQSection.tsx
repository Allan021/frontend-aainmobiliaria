import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${question.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;

  return (
    <div style={{ borderBottom: '1px solid var(--main-border, #E6E0D2)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '1.125rem 0', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--main-text, #111113)', lineHeight: 1.4 }}>{question}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="var(--main-text-dim, #9A9383)" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id={panelId}
        className="faq-content"
        style={{
          maxHeight: open ? 300 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
        }}
      >
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--main-text-muted, #5A5A63)', margin: '0 0 1.125rem' }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

interface FAQSectionProps {
  financing: boolean;
  financingPrima?: number;
  financingPlazoMeses?: number;
}

export function FAQSection({ financing, financingPrima, financingPlazoMeses }: FAQSectionProps) {
  const faqAnswers = {
    financing: financing
      ? `Sí, ofrecemos financiamiento directo con prima desde ${financingPrima || 20}%. Plazo hasta ${Math.round((financingPlazoMeses || 96) / 12)} años.`
      : 'Esta propiedad es solo contado. Contáctenos para conocer otras opciones.',
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-text, #111113)', marginBottom: '1rem' }}>
        Preguntas frecuentes
      </h2>
      <FAQItem
        question="¿Cómo es el proceso de compra?"
        answer="Visitamos el terreno juntos, formalizamos la reserva y acompañamos el trámite de escritura con notario."
      />
      <FAQItem
        question="¿Es posible financiar?"
        answer={faqAnswers.financing}
      />
      <FAQItem
        question="¿Puedo visitar el terreno?"
        answer="Sí, coordinamos visitas de lunes a sábado. Contáctenos por WhatsApp para agendar sin costo."
      />
    </div>
  );
}
