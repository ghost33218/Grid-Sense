import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useClock } from '../../hooks/useClock'
import { checkHealth } from '../../api/client'

const PAGE_NAMES: Record<string, string> = {
  '/': 'OPS DASHBOARD',
  '/predict': 'CONGESTION PREDICTION',
  '/map': 'INCIDENT MAP',
  '/similar': 'SIMILARITY SEARCH',
  '/feedback': 'OFFICER FEEDBACK',
  '/about': 'ABOUT GRIDSENSE',
}

const PAGE_SUBTITLES: Record<string, string> = {
  '/': 'Command overview — real-time analytics',
  '/predict': 'Deployment recommendations engine',
  '/map': 'Geospatial hotspot analysis',
  '/similar': 'Historical incident matching',
  '/feedback': 'Ground-truth logging & model refinement',
  '/about': 'Architecture, metrics & impact',
}

interface TopBarProps {
  isDemo?: boolean
}

export function TopBar({ isDemo }: TopBarProps) {
  const { time } = useClock()
  const location = useLocation()
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const pageName = PAGE_NAMES[location.pathname] || 'OPS DASHBOARD'
  const pageSubtitle = PAGE_SUBTITLES[location.pathname] || ''

  useEffect(() => {
    const poll = () => checkHealth().then(d => setApiOk(!!d?.status))
    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [])

  const connected = apiOk && !isDemo
  const dotColor = connected ? '#2D6A4F' : isDemo || apiOk === false ? '#B8820A' : '#9A9690'

  return (
    <div className="flex items-center justify-between px-4 md:px-5 border-b border-[#C8C5BC] bg-[#EAE8E1]" style={{ height: 36 }}>
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <span className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor, animation: 'pulse 2s infinite' }} />
          <span className="text-[10px] font-mono tracking-[0.12em]" style={{ color: dotColor }}>
            {apiOk === null ? '...' : connected ? 'LIVE' : isDemo ? 'DEMO' : 'OFFLINE'}
          </span>
        </span>
        <span className="text-[#C8C5BC] text-[10px] hidden sm:inline">|</span>
        {apiOk === null ? (
          <span className="text-[10px] font-mono text-[#9A9690] hidden sm:inline">Connecting to backend...</span>
        ) : connected ? (
          <span className="text-[10px] font-mono text-[#9A9690] hidden sm:inline">Bangalore Traffic Police · Backend Connected</span>
        ) : isDemo ? (
          <span className="text-[10px] font-mono text-[#B8820A] hidden sm:inline">⚠ Using demo fallback data</span>
        ) : (
          <span className="text-[10px] font-mono text-[#C84B2F] hidden sm:inline">⚠ Backend Offline — Check API</span>
        )}
        <span className="text-[#C8C5BC] text-[10px] hidden lg:inline">|</span>
        <span className="text-[10px] font-mono text-[#C8C5BC] truncate hidden lg:inline">{pageSubtitle}</span>
      </div>
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <span className="text-[10px] font-mono text-[#9A9690] hidden sm:inline">BLR-OPS / {pageName}</span>
        <span className="w-px h-3 bg-[#C8C5BC] hidden sm:inline" />
        <span className="text-[10px] font-mono text-[#6B6860]">{time} IST</span>
      </div>
    </div>
  )
}
