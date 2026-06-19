import { useAlertFeed } from '../../context/AlertFeedContext'

export function AlertFeed() {
  const { entries } = useAlertFeed()

  if (entries.length === 0) return null

  return (
    <div className="border border-[#C8C5BC] bg-[#EAE8E1] px-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C84B2F]" style={{ animation: 'pulse 1.5s infinite' }} />
        <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690]">LIVE ALERT FEED</span>
      </div>
      <div className="max-h-[120px] overflow-y-auto">
        {entries.map(e => (
          <div key={e.id} className="py-1.5 border-b border-[#C8C5BC] last:border-0">
            <span className="text-[9px] font-mono text-[#9A9690]">[{e.time}]</span>
            <span className="text-[10px] font-mono text-[#1A1A18] ml-2">{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
