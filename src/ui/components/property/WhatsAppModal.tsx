import { useState, useEffect } from 'react';
import { Button, Eyebrow } from '../shared/Button';
import { Icon, WhatsAppIcon } from '../shared/Icon';
import { useCreateLead } from '../../hooks/useLeads';
import type { Property } from '../../../core/domain/entities/types';

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

export function WhatsAppModal({ open, onClose, property }: Props) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [stage, setStage] = useState<'form' | 'success'>('form');
  const createLead = useCreateLead();

  useEffect(() => {
    if (open) { setStage('form'); setForm({ name: '', email: '' }); }
  }, [open]);

  if (!open) return null;

  const valid = form.name.trim().length > 2 && /^.+@.+\..+$/.test(form.email);

  const handleSubmit = () => {
    createLead.mutate({
      name: form.name,
      email: form.email,
      property_id: property?.id,
      property_title: property?.title,
    });
    setStage('success');
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: 'rgba(10,10,11,0.6)', backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl max-w-[460px] w-full p-9 relative shadow-xl">
        <button onClick={onClose} className="absolute top-5 right-5 bg-transparent border-none cursor-pointer">
          <Icon name="close" size={20} color="#5A5A63" />
        </button>

        {stage === 'form' ? (
          <>
            <Eyebrow>Antes de continuar</Eyebrow>
            <h2 className="text-[32px] font-medium leading-tight tracking-tight text-obsidian-900 mt-2 mb-2.5">
              Conversemos por WhatsApp
            </h2>
            <p className="text-sm leading-relaxed text-obsidian-500 mb-6">
              Le pedimos sus datos para personalizar la conversación. Le responderemos en menos de una hora.
            </p>

            <div className="flex flex-col gap-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-obsidian-500">Nombre completo</span>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="María Elena Zúñiga"
                  className="border border-bone-300 rounded py-3 px-3.5 text-[15px] text-obsidian-900 outline-none bg-white focus:border-gold-300" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-obsidian-500">Correo electrónico</span>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="usted@correo.com"
                  className="border border-bone-300 rounded py-3 px-3.5 text-[15px] text-obsidian-900 outline-none bg-white focus:border-gold-300" />
              </label>
              {property && (
                <div className="p-3.5 rounded-xl bg-bone-50 text-[13px] text-obsidian-600">
                  <span className="text-bone-400">Consultando sobre</span><br />
                  <strong className="text-obsidian-900 font-semibold">{property.title}</strong>
                </div>
              )}
              <Button variant="gold" size="lg" iconEl={<WhatsAppIcon size={18} />} onClick={handleSubmit}
                className={`mt-1.5 w-full ${!valid ? 'opacity-50 pointer-events-none' : ''}`}>
                Continuar a WhatsApp
              </Button>
              <p className="text-[11px] leading-normal text-bone-400 text-center m-0">
                Al continuar acepta que A&A Inmobiliaria le contacte sobre esta y otras propiedades.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gold-50 text-[#25D366] inline-flex items-center justify-center mb-5">
              <WhatsAppIcon size={32} />
            </div>
            <h2 className="text-[28px] font-medium text-obsidian-900 mb-2.5">Le estamos escribiendo</h2>
            <p className="text-sm text-obsidian-500 leading-relaxed mb-6">
              Abrimos WhatsApp con un mensaje listo para enviar. Un asesor le responderá en menos de una hora.
            </p>
            <Button variant="primary" size="lg" onClick={onClose} className="w-full">Entendido</Button>
          </div>
        )}
      </div>
    </div>
  );
}
