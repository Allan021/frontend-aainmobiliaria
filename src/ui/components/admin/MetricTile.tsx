import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  delta?: string;
  sub?: string;
  dark?: boolean;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('aa_theme') as 'light' | 'dark') || 'light';
}

const toneAccent: Record<string, string | null> = {
  default: null,
  success: '#4A7C59',
  warning: '#B8862E',
  danger: '#8C3A2E',
};

export function MetricTile({ label, value, delta, sub, dark, icon, tone = 'default' }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
      setTheme(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const isDarkTheme = theme === 'dark';
  const accent = toneAccent[tone];

  const bgColor = dark
    ? (isDarkTheme ? '#0A0A0B' : '#111113')
    : (isDarkTheme ? '#1A1A1D' : '#FFFFFF');
  const borderColor = dark
    ? (isDarkTheme ? '#1A1A1D' : '#1A1A1D')
    : (isDarkTheme ? '#26262B' : '#E6E0D2');
  const textColor = dark ? '#FAF8F3' : (isDarkTheme ? '#FAF8F3' : '#111113');
  const subColor = dark ? '#C9C2B1' : (isDarkTheme ? '#5A5A63' : '#9A9383');
  const labelColor = dark ? '#9A9383' : (isDarkTheme ? '#9A9383' : '#5A5A63');

  return (
    <div style={{
      padding: '1.375rem 1.25rem 1.25rem', borderRadius: '0.875rem',
      border: `1px solid ${borderColor}`,
      background: bgColor, color: textColor,
      transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{
          fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: labelColor,
        }}>{label}</div>
        {icon && (
          <span style={{ display: 'flex', lineHeight: 1, color: accent || labelColor }}>{icon}</span>
        )}
      </div>

      <div style={{
        fontSize: '2.25rem', fontWeight: 600, lineHeight: 1,
        fontFeatureSettings: "'tnum' 1", letterSpacing: '-0.03em',
        color: textColor,
      }}>{value}</div>

      {(delta || sub) && (
        <div style={{ fontSize: '0.6875rem', marginTop: '0.5rem', color: subColor, fontWeight: 500 }}>
          {delta || sub}
        </div>
      )}
    </div>
  );
}
