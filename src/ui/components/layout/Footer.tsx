import { Button, Eyebrow } from '../shared/Button';
import { WhatsAppIcon } from '../shared/Icon';

interface FooterProps {
  onWhatsApp: () => void;
}

export function Footer({ onWhatsApp }: FooterProps) {
  return (
    <footer className="bg-obsidian-900 text-bone-50 pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 bg-obsidian-950 rounded-lg overflow-hidden flex">
                <img src="/logo-mark.jpg" alt="" className="w-14 h-14 object-cover" style={{ mixBlendMode: 'screen' }} />
              </div>
              <div>
                <div className="text-xl font-bold text-gold-300 tracking-tight leading-tight">A&A Inmobiliaria</div>
                <div className="text-[10px] tracking-[0.18em] text-bone-400 mt-1 font-semibold">TU PROPIEDAD · NUESTRA MISIÓN</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-bone-300 max-w-[340px]">
              Le acompañamos en la búsqueda, revisión legal, y firma de escritura de su nueva propiedad.
            </p>
          </div>

          {[
            { title: 'Propiedades', links: ['Todas las propiedades', 'Terrenos', 'Lotes', 'Lotificaciones'] },
            { title: 'A&A', links: ['Nosotros', 'Asesoría legal', 'Financiamiento', 'Preguntas frecuentes'] },
            { title: 'Contacto', links: ['WhatsApp', 'Iniciar sesión', 'Visitar oficinas', 'Horario de atención'] },
          ].map(col => (
            <div key={col.title}>
              <Eyebrow color="#D4B254" className="block mb-4">{col.title}</Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a className="text-sm text-bone-300 cursor-pointer hover:text-bone-50 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-obsidian-700 flex flex-wrap justify-between items-center gap-4">
          <div className="text-xs text-bone-400">© 2025 A&A Inmobiliaria · El Progreso, Yoro, Honduras</div>
          <div className="flex gap-2">
            <Button variant="gold" size="sm" iconEl={<WhatsAppIcon size={14} />} onClick={onWhatsApp}>WhatsApp</Button>
            <Button variant="darkOutline" size="sm" onClick={() => window.location.href = '/login'}>Iniciar sesión</Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
