function FilterSelect({ value, onChange, options, defaultLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = value !== 'All';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center h-[34px] pl-3 pr-8 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors outline-none cursor-pointer"
        style={{
          backgroundColor: active ? COLORS.activeBg : 'transparent',
          borderColor: active ? COLORS.activeBorder : COLORS.border,
          color: active ? COLORS.primary[500] : COLORS.text.body,
        }}
      >
        {active ? value : defaultLabel}
      </button>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[10px]" style={{ color: COLORS.text.disabled }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="absolute top-[38px] left-0 z-50 min-w-[180px] py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[260px] overflow-y-auto">
          <button onClick={() => { onChange('All'); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === 'All' ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
            {defaultLabel}
          </button>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}