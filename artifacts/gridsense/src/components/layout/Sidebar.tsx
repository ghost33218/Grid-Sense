import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { OpsButton } from '../ui/OpsButton'
import { JUDGE_SCENARIO, getTodayDatetime } from '../../data/demoData'

interface SidebarProps {
  summary: Record<string, unknown> | null
  onRefetch: () => void
}

function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

const NAV = [
  { path: '/', label: 'Dashboard', icon: '▦', step: '01' },
  { path: '/map', label: 'Incident Map', icon: '⊕', step: '02' },
  { path: '/predict', label: 'Predict Event', icon: '◈', step: '03' },
  { path: '/similar', label: 'Similarity Search', icon: '◎', step: '04' },
  { path: '/feedback', label: 'Officer Feedback', icon: '◻', step: '05' },
  { path: '/about', label: 'About', icon: '◇', step: '06' },
]

export function Sidebar({ summary, onRefetch }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const highPriority = typeof summary?.high_priority === 'number' ? summary.high_priority : 0
  const countVal = useCountUp(highPriority)

  const handleJudgeScenario = () => {
    const params = new URLSearchParams({
      judge: '1',
      ...Object.entries(JUDGE_SCENARIO).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
      start_datetime: getTodayDatetime(19, 0),
      end_datetime: getTodayDatetime(22, 0),
    })
    navigate(`/predict?${params.toString()}`)
  }

  return (
    <div
      className="flex flex-col border-r border-[#C8C5BC] bg-[#EAE8E1] overflow-y-auto"
      style={{ width: 300, padding: '32px 28px' }}
    >
      <div className="flex items-center gap-2 mb-5 px-3 py-2" style={{ background: '#C84B2F12', border: '1px solid #C84B2F44' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C84B2F]" style={{ animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite' }} />
        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#C84B2F]">DEMO MODE · GRIDLOCK 2.0</span>
      </div>

      <div>
        <div className="font-sans font-bold text-[#1A1A18] leading-none" style={{ fontSize: 64, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
          grid<br />sense
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#9A9690] mt-2.5">PREDICT. DEPLOY. PREVENT.</div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#9A9690]">ACTIVE HIGH-IMPACT EVENTS</div>
        <div className="font-mono font-bold text-[#1A1A18] mt-1" style={{ fontSize: 48 }}>
          {highPriority ? countVal.toLocaleString() : '—'}
        </div>
        <div className="text-[9px] font-mono text-[#9A9690] mt-1">Bangalore Traffic Jurisdiction</div>
      </div>

      <div className="flex flex-col gap-1.5 mt-5">
        <OpsButton variant="ghost" fullWidth onClick={handleJudgeScenario}>
          <span>▶ LOAD JUDGE SCENARIO</span>
          <span />
        </OpsButton>
        <OpsButton variant="primary" fullWidth onClick={() => navigate('/predict')}>
          <span>PREDICT EVENT</span>
          <span>→</span>
        </OpsButton>
        <OpsButton variant="ghost" fullWidth onClick={onRefetch}>
          <span>▶ REFRESH LIVE DATA</span>
          <span />
        </OpsButton>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#9A9690] mb-2">DEMO FLOW</div>
        <nav className="flex flex-col">
          {NAV.map((item, idx) => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 text-left transition-all duration-150 cursor-pointer"
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontFamily: 'sans-serif',
                  borderLeft: active ? '2px solid #C84B2F' : '2px solid transparent',
                  background: active ? '#1A1A1808' : 'transparent',
                  color: active ? '#1A1A18' : '#9A9690',
                  outline: 'none',
                  borderBottom: idx < NAV.length - 1 ? '1px solid #C8C5BC22' : 'none',
                }}
              >
                <span className="font-mono text-[9px] text-[#C8C5BC] w-5 flex-shrink-0">{item.step}</span>
                <span className="font-mono text-[11px]">{item.icon}</span>
                <span className="text-[11px]">{item.label}</span>
                {active && <span className="ml-auto font-mono text-[9px] text-[#C84B2F]">●</span>}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto pt-5 border-t border-[#C8C5BC]">
        <div className="text-[9px] font-mono uppercase text-[#9A9690] mb-2">SYSTEM</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[['F1 SCORE', '0.640'], ['RECALL', '75.5%'], ['FEATURES', '63'], ['INCIDENTS', '8,173']].map(([k, v]) => (
            <div key={k}>
              <div className="text-[8px] font-mono text-[#C8C5BC]">{k}</div>
              <div className="text-[11px] font-mono font-bold text-[#1A1A18]">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
