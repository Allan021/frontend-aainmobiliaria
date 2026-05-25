import { useRef, useEffect, useState } from 'react';

const reviews = [
  {
    name: 'Carlos Mejía',
    location: 'El Progreso, Yoro',
    text: 'Excelente servicio. Me ayudaron a encontrar el lote perfecto para mi familia. Verificaron toda la documentación legal y la escrituración fue transparente y sin sorpresas.',
    rating: 5,
    date: 'Hace 2 semanas',
    initials: 'CM',
    gradient: 'linear-gradient(135deg, #D4B254 0%, #8C6F1C 100%)',
  },
  {
    name: 'María Elena Torres',
    location: 'San Pedro Sula',
    text: 'Me impresionó el acompañamiento legal. Revisaron cada documento en el Instituto de la Propiedad, me explicaron todo el proceso y las cuotas se ajustan a mi presupuesto. 100% recomendados.',
    rating: 5,
    date: 'Hace 1 mes',
    initials: 'MT',
    gradient: 'linear-gradient(135deg, #4A7C59 0%, #2D5A3A 100%)',
  },
  {
    name: 'José Hernández',
    location: 'La Ceiba, Atlántida',
    text: 'Profesionales y honestos. Me acompañaron con asesoría legal desde la primera visita hasta la firma de escritura pública. Todos los documentos en regla, todo claro desde el primer día.',
    rating: 5,
    date: 'Hace 3 semanas',
    initials: 'JH',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
  },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#D4B254' : 'none'} stroke="#D4B254" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function ReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null!);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Counter animation with anime.js
  useEffect(() => {
    if (!visible || animatedRef.current || !statsContainerRef.current) return;
    animatedRef.current = true;

    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      if (!animate) return;

      const numEls = statsContainerRef.current!.querySelectorAll('.review-stat-num');
      numEls.forEach((el: Element, idx: number) => {
        const htmlEl = el as HTMLElement;
        const target = parseFloat(htmlEl.dataset.target || '0');
        const suffix = htmlEl.dataset.suffix || '';
        const isDecimal = htmlEl.dataset.decimal === 'true';
        const obj = { val: 0 };

        animate(obj, {
          val: target,
          duration: 1600,
          ease: 'outExpo',
          delay: 600 + idx * 150,
          onUpdate: () => {
            htmlEl.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val).toString()) + suffix;
          },
        });
      });
    });
  }, [visible]);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(3.5rem, 8vw, 5rem) 1.5rem',
        background: '#111113',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gold glow top */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(212,178,84,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Heading */}
        <div style={{
          textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3rem)',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <div style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#D4B254', marginBottom: '0.75rem',
          }}>
            Testimonios
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800,
            color: '#FAF8F3', letterSpacing: '-0.03em', lineHeight: 1.15,
            margin: '0 0 1rem',
          }}>
            Lo que dicen nuestros clientes
          </h2>
          <p style={{
            fontSize: '0.9375rem', color: '#6B6459', lineHeight: 1.65,
            maxWidth: 480, margin: '0 auto',
          }}>
            Más de 200 familias han confiado en nosotros para encontrar su propiedad ideal con todos los documentos en regla.
          </p>
        </div>

        {/* Reviews grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {reviews.map((review, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(212,178,84,0.2)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px -12px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Quote icon */}
              <div style={{
                position: 'absolute', top: 16, right: 20,
                fontSize: '3rem', lineHeight: 1, color: 'rgba(212,178,84,0.08)',
                fontWeight: 900, fontFamily: 'Georgia, serif',
              }}>
                &ldquo;
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                {Array.from({ length: 5 }, (_, j) => (
                  <StarIcon key={j} filled={j < review.rating} />
                ))}
              </div>

              {/* Review text */}
              <p style={{
                fontSize: '0.9375rem', lineHeight: 1.7,
                color: '#C9C2B1', margin: '0 0 1.5rem',
                fontStyle: 'italic',
              }}>
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Reviewer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: review.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8125rem', fontWeight: 700, color: '#fff',
                  flexShrink: 0,
                }}>
                  {review.initials}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FAF8F3' }}>
                    {review.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6459', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{review.location}</span>
                    <span style={{ opacity: 0.3 }}>·</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust stat */}
        <div
          ref={statsContainerRef}
          style={{
            marginTop: 'clamp(2rem, 5vw, 3rem)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem',
            flexWrap: 'wrap',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}
        >
          {[
            { target: 4.9, suffix: '', label: 'Calificación', decimal: true },
            { target: 200, suffix: '+', label: 'Familias', decimal: false },
            { target: 50, suffix: '+', label: 'Propiedades', decimal: false },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                className="review-stat-num"
                data-target={stat.target}
                data-suffix={stat.suffix}
                data-decimal={stat.decimal ? 'true' : 'false'}
                style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D4B254', letterSpacing: '-0.02em' }}
              >
                0{stat.suffix}
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B6459', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
