export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#C8C5BC] py-2">
      <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690]">{label}</span>
      <span className="text-[11px] font-sans text-[#1A1A18]">{value}</span>
    </div>
  )
}
