import { ReactNode } from 'react'

interface PanelProps {
  title?: string
  badge?: string
  badgeColor?: string
  children: ReactNode
  noPadding?: boolean
  accentBorder?: string
  className?: string
}

export function Panel({ title, badge, badgeColor = '#C8C5BC', children, noPadding, accentBorder, className = '' }: PanelProps) {
  return (
    <div
      className={`bg-[#E2E0D8] border border-[#C8C5BC] relative ${className}`}
      style={{ borderRadius: 0, ...(accentBorder ? { borderTop: `2px solid ${accentBorder}` } : {}) }}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#C8C5BC]">
          <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#9A9690]">{title}</span>
          {badge && (
            <span
              className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5"
              style={{ background: `${badgeColor}22`, color: badgeColor, borderRadius: 0, border: `1px solid ${badgeColor}44` }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  )
}
