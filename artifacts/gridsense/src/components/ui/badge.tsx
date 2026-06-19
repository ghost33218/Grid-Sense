interface BadgeProps {
  level: 'High' | 'Medium' | 'Low' | 'resolved' | 'active' | 'closed' | string
  className?: string
}

const STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  High: { bg: '#C84B2F18', color: '#C84B2F', border: '#C84B2F44', label: 'HIGH' },
  Medium: { bg: '#B8820A18', color: '#B8820A', border: '#B8820A44', label: 'MED' },
  Low: { bg: '#2D6A4F18', color: '#2D6A4F', border: '#2D6A4F44', label: 'LOW' },
  resolved: { bg: '#2D6A4F18', color: '#2D6A4F', border: '#2D6A4F44', label: 'RESOLVED' },
  active: { bg: '#C84B2F18', color: '#C84B2F', border: '#C84B2F44', label: 'ACTIVE' },
  closed: { bg: '#78737018', color: '#787370', border: '#78737044', label: 'CLOSED' },
}

export function Badge({ level, className = '' }: BadgeProps) {
  const key = String(level)
  const style = STYLES[key] || STYLES.Low
  return (
    <span
      className={`inline-block text-[8px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 ${className}`}
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {style.label}
    </span>
  )
}
