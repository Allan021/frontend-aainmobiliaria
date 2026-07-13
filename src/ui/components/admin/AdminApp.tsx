import { useState, useEffect } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { AdminSidebar, SidebarMobileToggle } from './AdminSidebar';
import { MetricTile } from './MetricTile';
import { ListingsTable } from './ListingsTable';
import { LeadsList } from './LeadsList';
import { SalesHistory } from './SalesHistory';
import { NewPropertyDrawer } from './NewPropertyDrawer';
import { Button, Eyebrow, Capsule } from '../shared/Button';
import { WhatsAppIcon } from '../shared/Icon';
import { useProperties, usePropertyStats } from '../../hooks/useProperties';
import { useLeads } from '../../hooks/useLeads';
import { useSales } from '../../hooks/useSales';
import { api } from '../../../infrastructure/api/client';
import { LotificacionesView } from './LotificacionesView';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { useUsers, useCreateTeamMember } from '../../hooks/useAuth';
import { IconHome, IconCheck, IconCheckCircle, IconCalendar } from '../shared/rs-icons';

/* ── Hash routing ───────────────────────────────────── */
const VALID_ROUTES = ['dashboard', 'catalog', 'leads', 'sales', 'financing', 'team', 'settings'];

function getRouteFromHash(): string {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.slice(1);
  // Backward compat: old links to #properties / #lotifications go to catalog
  if (hash === 'properties' || hash === 'lotifications') return 'catalog';
  return VALID_ROUTES.includes(hash) ? hash : 'dashboard';
}

function navigate(route: string) {
  const hash = route === 'dashboard' ? '' : `#${route}`;
  window.history.pushState(null, '', `/admin${hash}`);
}

/* ── Theme helpers ──────────────────────────────────── */
function getMainTheme(isDark: boolean) {
  return isDark ? {
    mainBg: '#111113', mainSurface: '#1A1A1D', mainBorder: '#26262B',
    mainText: '#FAF8F3', mainTextMuted: '#C9C2B1', mainTextDim: '#5A5A63',
    mainCardBg: '#1A1A1D', mainTopbarBg: '#111113',
  } : {
    mainBg: '#FAF8F3', mainSurface: '#FFFFFF', mainBorder: '#E6E0D2',
    mainText: '#111113', mainTextMuted: '#5A5A63', mainTextDim: '#9A9383',
    mainCardBg: '#FFFFFF', mainTopbarBg: '#FAF8F3',
  };
}

function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('aa_theme') as 'light' | 'dark') || 'light';
}

/* ── Topbar ─────────────────────────────────────────── */
function Topbar({ title, subtitle, action, onToggleSidebar, isOpen, m }: {
  title: string; subtitle: string; action?: React.ReactNode;
  onToggleSidebar: () => void;
  isOpen: boolean;
  m: ReturnType<typeof getMainTheme>;
}) {
  return (
    <div className="admin-topbar" style={{
      borderBottom: `1px solid ${m.mainBorder}`,
      background: m.mainTopbarBg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <SidebarMobileToggle isOpen={isOpen} toggle={onToggleSidebar} isDark={getStoredTheme() === 'dark'} />
        <div>
          <Eyebrow>{subtitle}</Eyebrow>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginTop: '0.375rem',
            letterSpacing: '-0.025em', color: m.mainText, transition: 'color 0.3s ease', lineHeight: 1.1,
          }}>{title}</h1>
        </div>
      </div>
      {action}
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────── */
function Dashboard({ onNew, onToggleSidebar, isOpen, m, onNavigate }: {
  onNew: () => void; onToggleSidebar: () => void; isOpen: boolean;
  m: ReturnType<typeof getMainTheme>; onNavigate: (r: string) => void;
}) {
  const { data: stats } = usePropertyStats();
  const { data: leadsData } = useLeads({ page: 1 });
  const { data: salesData } = useSales();
  const leads = leadsData?.data || [];
  const sales = salesData?.data || [];
  const pendingLeads = leads.filter(l => l.status === 'pendiente');

  const cardStyle = {
    background: m.mainCardBg, borderRadius: '0.875rem', border: `1px solid ${m.mainBorder}`,
    transition: 'background 0.3s ease, border-color 0.3s ease',
  };

  return (
    <div>
      <Topbar
        subtitle="Panel de control" title="Buenos días, Allan"
        action={<Button variant="primary" size="md" onClick={onNew}>+ Nueva propiedad</Button>}
        onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m}
      />
      <div className="admin-content-area">

        {/* Metric tiles */}
        <div className="admin-metrics-grid">
          <MetricTile
            label="Total propiedades" value={String(stats?.total || 0)}
            sub={`${stats?.disponible || 0} disponibles`} icon={<IconHome size={18} />}
          />
          <MetricTile
            label="Disponibles" value={String(stats?.disponible || 0)}
            delta={`${stats?.apartado || 0} apartadas`} icon={<IconCheckCircle size={18} />} tone="success"
          />
          <MetricTile
            label="Leads pendientes" value={String(pendingLeads.length)}
            delta={pendingLeads.length > 0 ? 'Responder hoy' : 'Al día'} icon={<IconCalendar size={18} />}
            tone={pendingLeads.length > 0 ? 'warning' : 'default'} dark
          />
          <MetricTile
            label="Vendidas" value={String(stats?.vendido || 0)}
            sub={`${sales.length} ventas totales`} icon={<IconCheck size={18} />}
          />
        </div>

        {/* Two-column: leads + quick actions */}
        <div className="admin-two-column">

          {/* Recent leads */}
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <Eyebrow>Recientes</Eyebrow>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: m.mainText, marginTop: '0.25rem' }}>
                  Leads entrantes
                </h3>
              </div>
              <button onClick={() => onNavigate('leads')} style={{
                fontSize: '0.75rem', color: '#8C6F1C', fontWeight: 500, background: 'none',
                border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
              }}>Ver todos →</button>
            </div>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: m.mainTextDim, fontSize: '0.875rem' }}>
                Sin leads registrados
              </div>
            ) : (
              leads.slice(0, 5).map((l, i) => (
                <div key={l.id} style={{
                  padding: '0.875rem 0', display: 'flex', alignItems: 'center', gap: '0.875rem',
                  borderBottom: i < Math.min(leads.length, 5) - 1 ? `1px solid ${m.mainBorder}` : 'none',
                }}>
                  <div style={{
                    width: '2.25rem', height: '2.25rem', borderRadius: 999,
                    background: '#FBF6E9', color: '#8C6F1C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                  }}>
                    {l.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: m.mainText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: m.mainTextDim, marginTop: '1px' }}>
                      {l.property_title || '—'} · {new Date(l.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Capsule tone={l.status === 'pendiente' ? 'warning' : l.status === 'cerrado' ? 'danger' : 'info'}>
                      {l.status === 'pendiente' ? 'Pendiente' : l.status === 'en-conversacion' ? 'En conv.' : l.status}
                    </Capsule>
                    {l.phone && (
                      <a href={`https://wa.me/504${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener"
                        style={{ color: '#25D366', display: 'flex', flexShrink: 0 }}>
                        <WhatsAppIcon size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick actions + summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Quick actions */}
            <div style={{ ...cardStyle, padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}><Eyebrow>Acciones rápidas</Eyebrow></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: '+ Nueva propiedad', action: onNew, accent: true },
                  { label: '→ Ver catálogo', action: () => onNavigate('catalog') },
                  { label: '→ Ver leads', action: () => onNavigate('leads') },
                  { label: '→ Registrar venta', action: () => onNavigate('sales') },
                ].map(({ label, action, accent }) => (
                  <button key={label} onClick={action} style={{
                    width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                    background: accent ? '#111113' : 'transparent',
                    border: `1px solid ${accent ? '#111113' : m.mainBorder}`,
                    color: accent ? '#FAF8F3' : m.mainText,
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status summary */}
            <div style={{ ...cardStyle, padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}><Eyebrow>Estado del catálogo</Eyebrow></div>
              {[
                { label: 'Disponibles', value: stats?.disponible || 0, color: '#4A7C59' },
                { label: 'Apartadas', value: stats?.apartado || 0, color: '#B8862E' },
                { label: 'Vendidas', value: stats?.vendido || 0, color: '#8C3A2E' },
              ].map(({ label, value, color }) => {
                const pct = stats?.total ? Math.round((value / stats.total) * 100) : 0;
                return (
                  <div key={label} style={{ marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: m.mainTextMuted }}>{label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: m.mainText }}>{value}</span>
                    </div>
                    <div style={{ height: '4px', background: m.mainBorder, borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Catalog (Properties + Lotificaciones tabs) ─────── */
function CatalogAdminView({ onNew, onEdit, onToggleSidebar, isOpen, m }: {
  onNew: () => void; onEdit: (p: any) => void; onToggleSidebar: () => void;
  isOpen: boolean;
  m: ReturnType<typeof getMainTheme>;
}) {
  const [tab, setTab] = useState<'properties' | 'lotifications'>('properties');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { data: allData } = useProperties({ limit: 100, status: statusFilter as any });
  const { data: stats } = usePropertyStats();
  const rawProperties = (allData?.data || []).filter((p: any) => p.property_type !== 'lotificadora');
  const properties = search
    ? rawProperties.filter((p: any) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase()) ||
        p.municipio?.toLowerCase().includes(search.toLowerCase()))
    : rawProperties;

  const nonLotCount = rawProperties.length;
  const availableNonLot = rawProperties.filter((p: any) => p.status === 'disponible').length;
  const apartadoNonLot = rawProperties.filter((p: any) => p.status === 'apartado').length;
  const vendidoNonLot = rawProperties.filter((p: any) => p.status === 'vendido').length;

  const statusTabs = [
    { label: `Todas · ${nonLotCount}`, value: undefined },
    { label: `Disponibles · ${availableNonLot}`, value: 'disponible' },
    { label: `Apartadas · ${apartadoNonLot}`, value: 'apartado' },
    { label: `Vendidas · ${vendidoNonLot}`, value: 'vendido' },
  ];

  const tabStyle = (active: boolean) => ({
    padding: '0.6875rem 1.25rem',
    background: 'none' as const,
    border: 'none' as const,
    borderBottom: `2px solid ${active ? '#D4B254' : 'transparent'}`,
    color: active ? m.mainText : m.mainTextDim,
    fontSize: '0.875rem' as const,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer' as const,
    fontFamily: 'inherit' as const,
    transition: 'color 0.15s, border-color 0.15s',
    marginBottom: -1,
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div>
      <Topbar
        subtitle="Inventario"
        title={tab === 'properties' ? 'Propiedades' : 'Lotificaciones'}
        action={<Button variant="primary" size="md" onClick={onNew}>+ Nueva propiedad</Button>}
        onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m}
      />

      {/* Tab switcher */}
      <div className="admin-tabs-header" style={{
        borderBottom: `1px solid ${m.mainBorder}`,
        background: m.mainTopbarBg,
      }}>
        <button style={tabStyle(tab === 'properties')} onClick={() => setTab('properties')}>
          Propiedades
        </button>
        <button style={tabStyle(tab === 'lotifications')} onClick={() => setTab('lotifications')}>
          Lotificaciones
        </button>
      </div>

      {tab === 'properties' && (
        <div className="admin-content-area">
          {/* Filters row: search + status pills */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: m.mainTextDim, pointerEvents: 'none' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar propiedad…"
                style={{
                  width: '100%', paddingLeft: 32, paddingRight: 12, height: 36, boxSizing: 'border-box' as const,
                  borderRadius: 8, border: `1px solid ${m.mainBorder}`,
                  background: m.mainCardBg, color: m.mainText,
                  fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#D4B254')}
                onBlur={e => (e.target.style.borderColor = m.mainBorder)}
              />
            </div>

            {/* Status pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {statusTabs.map(t => (
                <button key={String(t.value)} onClick={() => setStatusFilter(t.value)} style={{
                  padding: '6px 13px', borderRadius: 8, border: '1px solid',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  background: statusFilter === t.value || (!statusFilter && !t.value) ? '#D4B254' : m.mainCardBg,
                  color: statusFilter === t.value || (!statusFilter && !t.value) ? '#111113' : m.mainText,
                  borderColor: statusFilter === t.value || (!statusFilter && !t.value) ? '#D4B254' : m.mainBorder,
                  transition: 'all 0.15s',
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <ListingsTable properties={properties} onEdit={onEdit} m={m} />
        </div>
      )}

      {tab === 'lotifications' && (
        <LotificacionesView onNew={onNew} onEdit={onEdit} onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m} hideTopbar />
      )}
    </div>
  );
}

/* ── Leads ──────────────────────────────────────────── */
function LeadsView({ onToggleSidebar, isOpen, m }: { onToggleSidebar: () => void; isOpen: boolean; m: ReturnType<typeof getMainTheme> }) {
  const { data } = useLeads();
  const leads = data?.data || [];
  return (
    <div>
      <Topbar subtitle="Contactos" title="Leads entrantes" onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m} />
      <div className="admin-content-area">
        <LeadsList leads={leads} m={m} />
      </div>
    </div>
  );
}

/* ── Sales ──────────────────────────────────────────── */
function SalesView({ onToggleSidebar, isOpen, m }: { onToggleSidebar: () => void; isOpen: boolean; m: ReturnType<typeof getMainTheme> }) {
  const { data } = useSales();
  const sales = data?.data || [];
  return (
    <div>
      <Topbar subtitle="Histórico" title="Ventas cerradas" onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m} />
      <div className="admin-content-area">
        <SalesHistory sales={sales} />
      </div>
    </div>
  );
}

/* ── Settings View ──────────────────────────────────── */
function SettingsView({ onToggleSidebar, isOpen, m }: {
  onToggleSidebar: () => void; isOpen: boolean; m: ReturnType<typeof getMainTheme>;
}) {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (settings?.whatsapp_phone) {
      setWhatsappPhone(settings.whatsapp_phone);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg('');

    if (!whatsappPhone) {
      setErrorMsg('El número de WhatsApp es requerido');
      return;
    }

    updateSettings.mutate({ whatsapp_phone: whatsappPhone }, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err: any) => {
        setErrorMsg(err?.message || 'Error al guardar la configuración');
      }
    });
  };

  const cardStyle = {
    background: m.mainCardBg, borderRadius: '0.875rem', border: `1px solid ${m.mainBorder}`,
    padding: '2rem', maxWidth: '600px', width: '100%',
    transition: 'background 0.3s ease, border-color 0.3s ease',
  };

  return (
    <div>
      <Topbar subtitle="Configuración general" title="Ajustes del Sitio" onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m} />
      <div className="admin-content-area">
        <div style={cardStyle}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: m.mainText, margin: '0 0 0.5rem 0' }}>
                Contacto de WhatsApp
              </h3>
              <p style={{ fontSize: '0.8125rem', color: m.mainTextMuted, margin: 0, lineHeight: 1.4 }}>
                Configura el número de teléfono que utilizarán los botones de contacto rápido y envío de información de toda la plataforma web.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: m.mainTextDim }}>
                Número de Teléfono (con código de país)
              </label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={e => setWhatsappPhone(e.target.value)}
                placeholder="50499383699"
                disabled={isLoading}
                style={{
                  width: '100%', height: '40px', padding: '0 0.75rem', boxSizing: 'border-box',
                  borderRadius: 8, border: `1px solid ${m.mainBorder}`,
                  background: m.mainBg, color: m.mainText,
                  fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: m.mainTextDim }}>
                Ejemplo: <strong>50499383699</strong> (504 es el código de Honduras, seguido de los 8 dígitos).
              </span>
            </div>

            {errorMsg && (
              <div style={{ fontSize: '0.8125rem', color: '#E57373', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            {success && (
              <div style={{ fontSize: '0.8125rem', color: '#81C784', fontWeight: 500 }}>
                ✓ Ajustes guardados correctamente.
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={updateSettings.isPending || isLoading}
              style={{ alignSelf: 'flex-start' }}
            >
              {updateSettings.isPending ? 'Guardando…' : 'Guardar Ajustes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Team View ──────────────────────────────────────── */
function TeamView({ onToggleSidebar, isOpen, m }: {
  onToggleSidebar: () => void; isOpen: boolean; m: ReturnType<typeof getMainTheme>;
}) {
  const { data: users, isLoading: usersLoading } = useUsers();
  const createTeamMember = useCreateTeamMember();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Todos los campos son requeridos');
      return;
    }

    createTeamMember.mutate({ name, email, password }, {
      onSuccess: () => {
        setSuccessMsg(`¡Miembro "${name}" agregado! Se le ha enviado un correo con sus credenciales.`);
        setName('');
        setEmail('');
        setPassword('');
        setFormOpen(false);
        setTimeout(() => setSuccessMsg(''), 5000);
      },
      onError: (err: any) => {
        setErrorMsg(err?.message || 'Error al agregar el miembro del equipo');
      }
    });
  };

  const cardStyle = {
    background: m.mainCardBg, borderRadius: '0.875rem', border: `1px solid ${m.mainBorder}`,
    transition: 'background 0.3s ease, border-color 0.3s ease',
  };

  return (
    <div>
      <Topbar
        subtitle="Administración de personal"
        title="Equipo de Trabajo"
        action={
          <Button variant="primary" size="md" onClick={() => setFormOpen(!formOpen)}>
            {formOpen ? 'Cancelar' : '+ Agregar miembro'}
          </Button>
        }
        onToggleSidebar={onToggleSidebar} isOpen={isOpen} m={m}
      />
      <div className="admin-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {successMsg && (
          <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(74,124,89,0.12)', border: '1px solid rgba(74,124,89,0.2)', color: '#6EBF7B', fontSize: '0.875rem', fontWeight: 500 }}>
            {successMsg}
          </div>
        )}

        {/* Add team member form drawer/card */}
        {formOpen && (
          <div style={{ ...cardStyle, padding: '1.5rem', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: m.mainText, margin: '0 0 1rem 0' }}>
              Registrar nuevo miembro
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: m.mainTextMuted }}>Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  style={{
                    width: '100%', height: '36px', padding: '0 0.75rem', boxSizing: 'border-box',
                    borderRadius: 6, border: `1px solid ${m.mainBorder}`,
                    background: m.mainBg, color: m.mainText,
                    fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: m.mainTextMuted }}>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="juan@aainmobiliaria.com"
                  style={{
                    width: '100%', height: '36px', padding: '0 0.75rem', boxSizing: 'border-box',
                    borderRadius: 6, border: `1px solid ${m.mainBorder}`,
                    background: m.mainBg, color: m.mainText,
                    fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: m.mainTextMuted }}>Contraseña temporal</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: '36px', padding: '0 0.75rem', boxSizing: 'border-box',
                    borderRadius: 6, border: `1px solid ${m.mainBorder}`,
                    background: m.mainBg, color: m.mainText,
                    fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.6875rem', color: m.mainTextDim }}>
                  Esta contraseña se le enviará en un correo de bienvenida automático al registrarse.
                </span>
              </div>

              {errorMsg && (
                <div style={{ fontSize: '0.8125rem', color: '#E57373', fontWeight: 500 }}>
                  {errorMsg}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={createTeamMember.isPending}
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                {createTeamMember.isPending ? 'Agregando…' : 'Crear Cuenta'}
              </Button>
            </form>
          </div>
        )}

        {/* Team list table */}
        <div style={{ ...cardStyle, padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: m.mainText, margin: '0 0 1rem 0' }}>
            Miembros activos
          </h3>
          {usersLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: m.mainTextDim, fontSize: '0.875rem' }}>
              Cargando equipo…
            </div>
          ) : !users || users.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: m.mainTextDim, fontSize: '0.875rem' }}>
              No hay usuarios en el equipo
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${m.mainBorder}`, color: m.mainTextMuted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Nombre</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Correo electrónico</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Rol</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${m.mainBorder}`, fontSize: '0.8125rem', color: m.mainText }}>
                    <td style={{ padding: '0.875rem 0.5rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.875rem 0.5rem', color: m.mainTextMuted }}>{u.email}</td>
                    <td style={{ padding: '0.875rem 0.5rem' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, background: m.mainBorder, color: m.mainTextMuted,
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 0.5rem', color: m.mainTextDim }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Admin Content ──────────────────────────────────── */
function AdminContent() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [drawer, setDrawer] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);
  const m = getMainTheme(theme === 'dark');

  const { data: leadsData } = useLeads({ page: 1 });
  const pendingCount = (leadsData?.data || []).filter((l: any) => l.status === 'pendiente').length;

  // Sync theme with sidebar toggle
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
      setTheme(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Hash-based routing: sync with browser back/forward
  useEffect(() => {
    const handler = () => setRoute(getRouteFromHash());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Keyboard: close sidebar on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleNavigate = (r: string) => {
    setRoute(r);
    navigate(r);
    setSidebarOpen(false);
  };

  const openDrawer = async (property?: any) => {
    if (property?.id) {
      try {
        const full = await api.get<any>(`/properties/${property.id}`);
        setEditingProperty(full);
      } catch {
        setEditingProperty(property);
      }
    } else {
      setEditingProperty(null);
    }
    setDrawer(true);
  };

  const sharedProps = { onToggleSidebar: () => setSidebarOpen(p => !p), isOpen: sidebarOpen, m };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar
        route={route}
        setRoute={handleNavigate}
        pendingLeads={pendingCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main style={{ flex: 1, background: m.mainBg, minHeight: '100vh', transition: 'background 0.3s ease', overflow: 'auto' }}>
        {route === 'dashboard' && (
          <Dashboard onNew={() => openDrawer()} onNavigate={handleNavigate} {...sharedProps} />
        )}
        {route === 'catalog' && (
          <CatalogAdminView onNew={() => openDrawer()} onEdit={openDrawer} {...sharedProps} />
        )}
        {route === 'leads' && <LeadsView {...sharedProps} />}
        {route === 'sales' && <SalesView {...sharedProps} />}
        {route === 'financing' && (
          <div>
            <Topbar subtitle="Próximamente" title="Financiamiento" {...sharedProps} />
            <div className="admin-content-area" style={{ color: m.mainTextDim }}>Esta sección estará disponible pronto.</div>
          </div>
        )}
        {route === 'team' && <TeamView {...sharedProps} />}
        {route === 'settings' && <SettingsView {...sharedProps} />}
      </main>

      <NewPropertyDrawer
        open={drawer}
        onClose={() => { setDrawer(false); setEditingProperty(null); }}
        property={editingProperty}
      />
    </div>
  );
}

export default function AdminApp() {
  return (
    <QueryProvider>
      <AdminContent />
    </QueryProvider>
  );
}
