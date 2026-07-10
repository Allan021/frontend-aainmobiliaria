import { useEffect } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useFavorites, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { PropertyCard } from '../property/PropertyCard';
import type { Property } from '../../../core/domain/entities/types';
import { IconHeart, IconSearch } from '../shared/rs-icons';

function CardSkeleton() {
  return (
    <div className="rs-card" style={{ overflow: 'hidden' }}>
      <div className="rs-skeleton" style={{ aspectRatio: '4/3', borderRadius: 0 }} />
      <div style={{ padding: '1rem' }}>
        <div className="rs-skeleton" style={{ height: 14, width: '50%', marginBottom: 10 }} />
        <div className="rs-skeleton" style={{ height: 18, width: '85%', marginBottom: 10 }} />
        <div className="rs-skeleton" style={{ height: 14, width: '40%' }} />
      </div>
    </div>
  );
}

function FavoritesInner() {
  const { data, isLoading } = useFavorites();
  const toggleFav = useToggleFavorite();

  useEffect(() => {
    if (!isLoggedIn()) requireLogin();
  }, []);

  const favorites = (data || []).filter(f => f.property);

  const openProperty = (p: Property) => { window.location.href = `/propiedad/${p.id}`; };
  const openWhatsApp = (p: Property) =>
    window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: p } }));

  return (
    <div className="rs-page" style={{ maxWidth: 1280 }}>
      <div className="rs-page__eyebrow">Mi cuenta</div>
      <h1 className="rs-page__title">Mis favoritos</h1>
      <p className="rs-page__sub" style={{ marginTop: 4 }}>
        {isLoading ? 'Cargando…' : `${favorites.length} ${favorites.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}`}
      </p>

      {!isLoading && favorites.length === 0 && (
        <div className="rs-empty">
          <div className="rs-empty__icon"><IconHeart size={28} /></div>
          <div className="rs-empty__title">Todavía no guarda favoritos</div>
          <div className="rs-empty__sub">Toque el corazón de cualquier propiedad para guardarla aquí.</div>
          <a href="/buscar" className="rs-btn rs-btn--primary" style={{ marginTop: 18 }}>
            <IconSearch size={16} /> Explorar propiedades
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        {isLoading && <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>}
        {favorites.map(f => (
          <PropertyCard
            key={f.id}
            property={f.property as Property}
            onOpen={openProperty}
            onWhatsApp={openWhatsApp}
            saved
            onToggleSave={p => toggleFav.mutate({ propertyId: p.id, saved: true })}
          />
        ))}
      </div>
    </div>
  );
}

export function FavoritesApp() {
  return (
    <QueryProvider>
      <FavoritesInner />
    </QueryProvider>
  );
}
