interface ErrorBlockProps {
  label: string
  onRetry: () => void
}

export function ErrorBlock({ label, onRetry }: ErrorBlockProps) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between"
      style={{ borderLeft: '3px solid #C84B2F', background: '#C84B2F08' }}
    >
      <span className="text-[11px] font-mono text-[#C84B2F]">! Failed to load {label}</span>
      <button
        onClick={onRetry}
        className="text-[10px] font-mono uppercase tracking-[0.12em] cursor-pointer hover:underline"
        style={{ background: 'none', border: 'none', color: '#C84B2F' }}
      >
        RETRY →
      </button>
    </div>
  )
}
