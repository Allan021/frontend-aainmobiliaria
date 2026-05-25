import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: 'light' | 'dark';
  searchable?: boolean;
  fontSize?: string;
  fontWeight?: number;
}

const CHEVRON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CHECK = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function SelectField({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  theme = 'light',
  searchable,
  fontSize = '0.9375rem',
  fontWeight = 600,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isSearchable = searchable ?? options.length > 8;
  const selected = options.find(o => o.value === value);
  const isDark = theme === 'dark';

  const openPanel = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 220) });
    setOpen(true);
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 40);
  };

  const closePanel = () => { setOpen(false); setSearch(''); };
  const pick = (val: string) => { onChange(val); closePanel(); };

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) closePanel();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const panelCls = isDark
    ? 'bg-[#1A1A1D] border border-[#26262B] shadow-[0_24px_64px_rgba(0,0,0,0.5)]'
    : 'bg-white border border-stone-200/90 shadow-[0_24px_64px_rgba(17,17,19,0.15)]';

  const searchCls = isDark
    ? 'bg-[#111113] border-[#26262B] text-[#FAF8F3] placeholder:text-[#5A5A63] focus:border-[#D4B254]'
    : 'bg-stone-50 border-stone-200 text-[#111113] placeholder:text-[#9A9383] focus:border-[#D4B254]';

  const dividerCls = isDark ? 'border-[#26262B]' : 'border-stone-200';

  return (
    <>



      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={open ? closePanel : openPanel}
        className="flex items-center justify-between gap-1.5 cursor-pointer select-none w-full"
      >
        <span
          className="flex-1 min-w-0 truncate"
          style={{
            fontSize, fontWeight, fontFamily: 'inherit',
            color: selected
              ? (isDark ? '#FAF8F3' : '#111113')
              : (isDark ? '#6B6459' : '#5A5A63'),
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span
          className="flex-shrink-0 flex transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: open ? '#D4B254' : (isDark ? '#5A5A63' : '#9A9383'),
            transition: 'transform 0.2s ease, color 0.15s',
          }}
        >
          {CHEVRON}
        </span>
      </div>

      {/* Panel rendered at document.body via portal — escapes any transform context */}
      {open && createPortal(
        <div
          ref={panelRef}
          className={`sf-panel fixed z-[9999] rounded-xl overflow-hidden flex flex-col max-h-72 ${panelCls}`}
          style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}
        >
          {isSearchable && (
            <div className={`px-2.5 py-2 border-b flex-shrink-0 ${dividerCls}`}>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar…"
                className={`w-full px-3 py-1.5 rounded-lg border text-[13px] font-[inherit] outline-none transition-colors ${searchCls}`}
              />
            </div>
          )}

          <div className="overflow-y-auto flex-1 p-1.5">
            {filtered.length === 0 ? (
              <div className={`px-3 py-3 text-center text-[13px] ${isDark ? 'text-[#5A5A63]' : 'text-[#9A9383]'}`}>
                Sin resultados
              </div>
            ) : filtered.map(opt => {
              const isSel = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => pick(opt.value)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-[13.5px] transition-colors duration-100
                    ${isSel
                      ? 'bg-[rgba(212,178,84,0.11)] text-[#D4B254] font-semibold'
                      : `font-normal hover:bg-[rgba(212,178,84,0.08)] ${isDark ? 'text-[#FAF8F3]' : 'text-[#111113]'}`
                    }
                  `}
                >
                  <span className="flex-1">{opt.label}</span>
                  {isSel && <span className="flex-shrink-0">{CHECK}</span>}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
