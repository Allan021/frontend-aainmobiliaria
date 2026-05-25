import { useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { WhatsAppIcon } from './Icon';

export interface WhatsAppButtonProps {
  label?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'solid' | 'outline' | 'glass';
  fullWidth?: boolean;
  borderRadius?: string | number;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function WhatsAppButton({
  label = 'WhatsApp',
  onClick,
  size = 'md',
  variant = 'solid',
  fullWidth = false,
  borderRadius = '9999px',
  disabled = false,
  style,
  className,
}: WhatsAppButtonProps) {
  const [hovered, setHovered] = useState(false);

  const presets = {
    sm: { padding: '0.55rem 1rem', fontSize: '0.75rem', gap: 6, iconSize: 13 },
    md: { padding: '0.625rem 1.25rem', fontSize: '0.875rem', gap: 8, iconSize: 15 },
    lg: { padding: '0.75rem 1.375rem', fontSize: '0.9375rem', gap: 10, iconSize: 17 },
    xl: { padding: '1rem 1.5rem', fontSize: '1rem', gap: 10, iconSize: 20 },
  };

  const { padding, fontSize, gap, iconSize } = presets[size];

  // Base style
  const baseStyle: CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap,
    padding,
    borderRadius,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: '#fff',
    fontSize,
    fontWeight: 700,
    fontFamily: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    outline: 'none',
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  // Variant styles
  let variantStyle: CSSProperties = {};
  if (variant === 'solid') {
    variantStyle = {
      background: hovered ? '#22c35a' : '#25D366',
      boxShadow: hovered
        ? '0 6px 20px rgba(37, 211, 102, 0.45)'
        : '0 4px 14px rgba(37, 211, 102, 0.3)',
      transform: hovered ? 'translateY(-1px) scale(1.03)' : 'translateY(0) scale(1)',
    };
  } else if (variant === 'outline') {
    variantStyle = {
      background: hovered ? 'rgba(37, 211, 102, 0.08)' : 'transparent',
      border: '1.5px solid #25D366',
      color: '#25D366',
      boxShadow: hovered ? '0 4px 12px rgba(37, 211, 102, 0.15)' : 'none',
      transform: hovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
    };
  } else if (variant === 'glass') {
    variantStyle = {
      background: hovered ? 'rgba(37, 211, 102, 0.16)' : 'rgba(37, 211, 102, 0.10)',
      border: '1px solid rgba(37, 211, 102, 0.35)',
      color: hovered ? '#FAF8F3' : 'rgba(250, 248, 243, 0.85)',
      boxShadow: hovered ? '0 0 20px rgba(37, 211, 102, 0.18)' : 'none',
      backdropFilter: 'blur(8px)',
      transform: hovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
    };
  }

  const finalStyle: CSSProperties = {
    ...baseStyle,
    ...variantStyle,
    ...style,
  };

  const iconColor = variant === 'outline' ? (hovered ? '#22c35a' : '#25D366') : '#fff';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={finalStyle}
      className={className}
    >
      <WhatsAppIcon size={iconSize} color={iconColor} />
      <span>{label}</span>
    </button>
  );
}
