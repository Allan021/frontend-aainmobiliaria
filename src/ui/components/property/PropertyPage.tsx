import { useState } from 'react';
import { PropertyDetail } from './PropertyDetail';
import { WhatsAppModal } from './WhatsAppModal';
import type { Property } from '../../../core/domain/entities/types';
import type { AstroIslandProps } from '../../../core/domain/entities/astro.types';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export interface PropertyPageProps extends AstroIslandProps {
  property: Property;
}

export default function PropertyPage({ property }: PropertyPageProps) {
  const [waOpen, setWaOpen] = useState(false);
  const [waProperty, setWaProperty] = useState<Property | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('aa_pub_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('aa_pub_theme', next);
      return next;
    });
  };

  return (
    <>
      <Header
        currentRoute="catalog"
        onNavigate={(r) => { window.location.href = r === 'home' ? '/' : '/'; }}
        onWhatsApp={() => { setWaProperty(null); setWaOpen(true); }}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <PropertyDetail
        property={property}
        onBack={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/')}
        onWhatsApp={(p) => { setWaProperty(p); setWaOpen(true); }}
        standalone
      />
      <Footer onWhatsApp={() => { setWaProperty(null); setWaOpen(true); }} />
      {waOpen && (
        <WhatsAppModal
          open={waOpen}
          property={waProperty}
          onClose={() => setWaOpen(false)}
        />
      )}
    </>
  );
}
