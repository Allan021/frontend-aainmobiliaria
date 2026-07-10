import { useEffect, useState } from 'react';
import { PropertyFicha } from './PropertyFicha';
import type { Property } from '../../../core/domain/entities/types';
import { api } from '../../../infrastructure/api/client';
import { QueryProvider } from '../../providers/QueryProvider';

function FallbackLoader() {
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/propiedad\/([a-zA-Z0-9-]+)\/?$/);
    if (!match) {
      setError(true);
      setLoading(false);
      return;
    }

    const id = match[1];
    api.get<Property>(`/properties/${id}`)
      .then((data) => {
        setProperty(data);
        setLoading(false);
        // Update page title
        document.title = `${data.title} — A&A Inmobiliaria`;
      })
      .catch(() => {
        setError(true);
        setLoading(false);
        // Show standard 404 page elements
        const notFoundUi = document.getElementById('not-found-ui');
        const dynamicDetailUi = document.getElementById('dynamic-detail-ui');
        if (notFoundUi && dynamicDetailUi) {
          dynamicDetailUi.style.display = 'none';
          notFoundUi.style.display = 'block';
          document.title = 'Página no encontrada — A&A Inmobiliaria';
        }
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#FAF8F3', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,178,84,0.2)', borderTopColor: '#D4B254', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '0.875rem', color: '#9A9383', fontWeight: 500 }}>Cargando detalles de propiedad...</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !property) {
    return null;
  }

  return <PropertyFicha property={property} standalone />;
}

export function PropertyDetailFallback() {
  return (
    <QueryProvider>
      <FallbackLoader />
    </QueryProvider>
  );
}
