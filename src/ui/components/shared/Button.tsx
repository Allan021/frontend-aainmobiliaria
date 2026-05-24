import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, WhatsAppIcon } from './Icon';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'darkOutline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconEl?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-obsidian-900 text-bone-50 hover:bg-obsidian-800 hover:shadow-gold',
  gold: 'bg-gold-300 text-obsidian-900 font-semibold hover:bg-gold-400',
  outline: 'bg-transparent text-obsidian-900 border border-obsidian-900 hover:bg-obsidian-900 hover:text-bone-50',
  ghost: 'bg-transparent text-obsidian-500 hover:text-obsidian-900',
  darkOutline: 'bg-transparent text-bone-50 border border-obsidian-600 hover:border-bone-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-4 text-[15px]',
};

export function Button({ variant = 'primary', size = 'md', icon, iconEl, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {iconEl}
      {icon && <Icon name={icon as any} size={16} />}
      {children}
    </button>
  );
}

export function Capsule({ tone = 'gold', children, className = '' }: {
  tone?: 'gold' | 'obsidian' | 'success' | 'warning' | 'danger' | 'info' | 'outlineGold';
  children: ReactNode;
  className?: string;
}) {
  const toneClasses: Record<string, string> = {
    gold: 'bg-gold-300 text-obsidian-900',
    obsidian: 'bg-obsidian-900 text-bone-50',
    success: 'bg-aa-success-bg text-aa-success',
    warning: 'bg-aa-warning-bg text-gold-500',
    danger: 'bg-aa-danger-bg text-aa-danger',
    info: 'bg-aa-info-bg text-aa-info',
    outlineGold: 'bg-white text-gold-500 border border-gold-300',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Eyebrow({ children, className = '', color }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <span
      className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${className}`}
      style={{ color: color || '#8C6F1C' }}
    >
      {children}
    </span>
  );
}
