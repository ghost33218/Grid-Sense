import { useClock } from '../../hooks/useClock'

interface StatusBarProps {
  summary: Record<string, unknown> | null
}

export function StatusBar({ summary }: StatusBarProps) {
  const { time } = useClock()

  const totalEvents = summary?.total_events ?? '8,173'
  const high = summary?.high_priority ?? '—'
  const corridors = summary?.corridors ?? '22'
  const roadClosures = summary?.road_closures ?? '—'

  const officersEst = typeof high === 'number' ? (high * 1.2).toFixed(0) : '—'

  return (
    <div
      className="flex items-center justify-between px-5 bg-[#1A1A18] border-t border-[#2A2A28]"
      style={{ height: 32 }}
    >
      <div className="flex items-center gap-5">
        {[
          ['INCIDENTS', typeof totalEvents === 'number' ? totalEvents.toLocaleString() : totalEvents],
          ['HIGH RISK', String(high)],
          ['ROAD CLOSURES', String(roadClosures)],
          ['CORRIDORS', String(corridors)],
          ['EST. OFFICERS', officersEst],
          ['F1', '63.8%'],
        ].map(([label, val], i, arr) => (
          <span key={label} className="flex items-center gap-5">
            <span className="text-[9px] font-mono">
              <span className="text-[#6B6860]">{label} </span>
              <span className="text-[#EAE8E1]">{val}</span>
            </span>
            {i < arr.length - 1 && <span className="text-[#2A2A28]">·</span>}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono text-[#C84B2F]">◈ GRIDLOCK 2.0</span>
        <span className="text-[#2A2A28]">·</span>
        <span className="text-[9px] font-mono text-[#6B6860]">{time} IST</span>
      </div>
    </div>
  )
}
