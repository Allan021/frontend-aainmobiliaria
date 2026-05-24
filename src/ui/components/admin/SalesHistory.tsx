import type { Sale } from '../../../core/domain/entities/types';
import { formatPrice } from '../../../core/domain/entities/types';

interface Props {
  sales: Sale[];
}

export function SalesHistory({ sales }: Props) {
  const thStyle = "text-left p-3 text-[10px] font-semibold tracking-[0.14em] uppercase text-gold-500 border-b border-bone-200";
  const tdStyle = "p-4 text-[13px] border-b border-bone-100";

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Referencia', 'Propiedad', 'Comprador', 'Precio', 'Método', 'Fecha'].map(h => (
              <th key={h} className={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.id}>
              <td className={`${tdStyle} font-mono text-xs text-obsidian-500`}>{s.reference}</td>
              <td className={`${tdStyle} text-obsidian-900 font-medium`}>{s.property_title}</td>
              <td className={`${tdStyle} text-obsidian-600`}>{s.buyer_name}</td>
              <td className={`${tdStyle} text-obsidian-900 font-medium`} style={{ fontFeatureSettings: "'tnum' 1" }}>{formatPrice(s.price)}</td>
              <td className={`${tdStyle} text-obsidian-500`}>{s.payment_method}</td>
              <td className={`${tdStyle} text-obsidian-500`}>{s.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
