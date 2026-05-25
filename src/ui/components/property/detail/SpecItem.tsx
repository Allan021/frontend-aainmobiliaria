interface SpecItemProps {
  label: string;
  value: string;
}

export function SpecItem({ label, value }: SpecItemProps) {
  return (
    <div style={{
      background: 'var(--main-bg, #FAF8F3)',
      borderRadius: 10,
      padding: '0.875rem 1rem',
      border: '1px solid var(--main-border, #F3EFE6)',
    }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--main-text-dim, #9A9383)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--main-text, #111113)', lineHeight: 1.3, fontFeatureSettings: "'tnum' 1" }}>
        {value}
      </div>
    </div>
  );
}
