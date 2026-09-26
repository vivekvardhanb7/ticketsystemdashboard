function PillButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        backgroundColor: active ? COLORS.activeBg : 'transparent',
        borderColor: active ? COLORS.activeBorder : COLORS.border,
        color: active ? COLORS.primary[500] : COLORS.text.body,
      }}
    >
      {label}{count != null ? `  ${count}` : ''}
    </button>
  );
}