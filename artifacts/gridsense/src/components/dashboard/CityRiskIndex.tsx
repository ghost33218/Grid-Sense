import { useState } from 'react'

interface CityRiskIndexProps {
  summary: Record<string, unknown> | null
  corridorData: { corridor: string; high_rate: number }[]
  isDemo: boolean
  apiConnected: boolean
  loading?: boolean
}

const RING_CIRC = 238.7

export function CityRiskIndex({ summary, corridorData, isDemo, apiConnected, loading }: CityRiskIndexProps) {
  const [expandedCol, setExpandedCol] = useState<number | null>(null)

  const totalEvents = Number(summary?.total_events) || 8173
  const highPriority = Number(summary?.high_priority) || 1967
  const roadClosures = Number(summary?.road_closures) || 676
  const totalCorridors = corridorData.length || 8
  const corridorsAbove40 = corridorData.filter(c => c.high_rate > 0.4).length

  const score = Math.round(
    (highPriority / totalEvents) * 40 +
    (roadClosures / totalEvents) * 30 +
    (corridorsAbove40 / totalCorridors) * 30
  )

  const isCritical = score > 60
  const isElevated = score > 35
  const riskColor = isCritical ? '#C84B2F' : isElevated ? '#B8820A' : '#2D6A4F'
  const riskLabel = isCritical ? 'CRITICAL' : isElevated ? 'ELEVATED' : 'NORMAL'
  const officersEst = Math.round(highPriority * 1.2)
  const topCorridor = corridorData[0]

  const highWeight = Math.round((highPriority / totalEvents) * 40)
  const closureWeight = Math.round((roadClosures / totalEvents) * 30)
  const corridorWeight = Math.round((corridorsAbove40 / totalCorridors) * 30)

  const drawerDetails: Record<number, string> = {
    0: `Score components: High-priority weight (40%) = ${highWeight}, Road closure weight (30%) = ${closureWeight}, Corridor risk weight (30%) = ${corridorWeight}`,
    1: `${topCorridor?.corridor || '—'} leads with ${((topCorridor?.high_rate || 0) * 100).toFixed(0)}% high-congestion rate across ${totalCorridors} monitored corridors`,
    2: `${highPriority.toLocaleString()} events flagged high-priority in dataset — requiring active operational attention`,
    3: `Estimated ${officersEst} officers based on historical ratio of 1.2× high-priority events`,
    4: isDemo || !apiConnected
      ? 'Using demo fallback data — backend unavailable or returned empty response'
      : 'Live data from Flask ML API — ensemble model active',
  }

  const toggleCol = (i: number) => setExpandedCol(expandedCol === i ? null : i)

  if (loading) {
    return (
      <div className="bg-[#1A1A18] border border-[#1A1A18] p-5" style={{ minHeight: 120 }}>
        <div className="animate-pulse h-16 bg-[#2A2A28]" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-[#1A1A18] border border-[#1A1A18]" style={{ borderWidth: 1.5 }}>
      {/* E7.3 grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          zIndex: 0,
          backgroundImage: `repeating-linear-gradient(0deg, #EAE8E1 0px, transparent 1px, transparent 3px),
            repeating-linear-gradient(90deg, #EAE8E1 0px, transparent 1px, transparent 3px)`,
          backgroundSize: '6px 6px',
        }}
      />

      <div className="relative z-[1] grid grid-cols-1 md:grid-cols-5 gap-px" style={{ background: '#2A2A28' }}>
        {/* Col 1 — City Risk Index */}
        <button
          onClick={() => toggleCol(0)}
          className="bg-[#1A1A18] p-4 text-left cursor-pointer hover:bg-[#222220] transition-colors col-span-1 md:col-span-1"
        >
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-3">CITY RISK INDEX</div>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0" style={{ width: 90, height: 90 }}>
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke="#D4D1C8" strokeWidth="6" />
                <circle
                  cx="45" cy="45" r="38" fill="none" stroke={riskColor} strokeWidth="6"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={RING_CIRC * (1 - score / 100)}
                  strokeLinecap="butt"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isCritical ? (
                  <div className="flex gap-px">
                    {String(score).split('').map((d, i) => (
                      <span key={i} className="font-mono font-bold text-[22px] px-1.5 py-0.5 min-w-[18px] text-center"
                        style={{ background: '#C84B2F', color: '#EAE8E1' }}>{d}</span>
                    ))}
                  </div>
                ) : (
                  <>
                    <span className="font-mono font-bold text-[22px]" style={{ color: riskColor }}>{score}</span>
                    <span className="text-[7px] font-mono tracking-[0.1em] text-[#9A9690]">RISK INDEX</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="font-mono font-bold text-[14px]" style={{ color: riskColor }}>{riskLabel}</div>
              {isCritical && (
                <div className="text-[7px] font-mono tracking-[0.1em] mt-1" style={{ color: '#C84B2F' }}>CRITICAL RISK INDEX</div>
              )}
            </div>
          </div>
        </button>

        {/* Col 2 — Highest Risk Corridor */}
        <button onClick={() => toggleCol(1)} className="bg-[#1A1A18] p-4 text-left cursor-pointer hover:bg-[#222220] transition-colors">
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-2">HIGHEST RISK CORRIDOR</div>
          <div className="text-[13px] font-sans font-semibold text-[#EAE8E1] truncate">{topCorridor?.corridor || '—'}</div>
          <div className="mt-2 h-1.5" style={{ background: '#2A2A28' }}>
            <div style={{ width: `${(topCorridor?.high_rate || 0) * 100}%`, height: '100%', background: '#C84B2F' }} />
          </div>
          <div className="text-[11px] font-mono mt-1" style={{ color: '#B8820A' }}>
            {((topCorridor?.high_rate || 0) * 100).toFixed(0)}% high rate
          </div>
        </button>

        {/* Col 3 — Active High-Priority */}
        <button onClick={() => toggleCol(2)} className="bg-[#1A1A18] p-4 text-left cursor-pointer hover:bg-[#222220] transition-colors">
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-2">ACTIVE HIGH-PRIORITY</div>
          <div className="font-mono font-bold text-[36px] leading-none" style={{ color: '#C84B2F' }}>{highPriority.toLocaleString()}</div>
          <div className="text-[10px] font-mono mt-2 text-[#9A9690]">events requiring attention</div>
        </button>

        {/* Col 4 — Est. Officers */}
        <button onClick={() => toggleCol(3)} className="bg-[#1A1A18] p-4 text-left cursor-pointer hover:bg-[#222220] transition-colors">
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-2">EST. OFFICERS REQUIRED</div>
          <div className="font-mono font-bold text-[36px] leading-none" style={{ color: '#B8820A' }}>{officersEst}</div>
          <div className="text-[10px] font-mono mt-2 text-[#9A9690]">estimated deployment based on historical ratio</div>
        </button>

        {/* Col 5 — System Status */}
        <button onClick={() => toggleCol(4)} className="bg-[#1A1A18] p-4 text-left cursor-pointer hover:bg-[#222220] transition-colors">
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-2">SYSTEM STATUS</div>
          <div className="text-[12px] font-mono font-bold" style={{ color: isDemo || !apiConnected ? '#B8820A' : '#2D6A4F' }}>
            {isDemo || !apiConnected ? '◉ DEMO DATA' : '◉ LIVE DATA'}
          </div>
          <div className="text-[10px] font-mono mt-2 text-[#9A9690]">Model: F1 0.640 · 63 features</div>
        </button>
      </div>

      {/* Expandable detail drawer */}
      <div
        className="relative z-[1] overflow-hidden transition-all duration-300 ease-out"
        style={{ height: expandedCol !== null ? 120 : 0, background: '#222220', borderTop: '1px solid #2A2A28' }}
      >
        {expandedCol !== null && (
          <div className="px-5 py-4">
            <div className="text-[11px] font-mono text-[#EAE8E1] leading-relaxed">
              {drawerDetails[expandedCol]}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
