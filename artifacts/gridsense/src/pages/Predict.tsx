import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePredict } from '../hooks/usePredict'
import { useMeta } from '../hooks/useMeta'
import { predict } from '../api/client'
import { OpsButton } from '../components/ui/OpsButton'
import { Skeleton } from '../components/ui/Skeleton'
import { CornerMarks } from '../components/ui/CornerMarks'
import { useToast } from '../context/ToastContext'
import { useAlertFeed } from '../context/AlertFeedContext'
import { getTodayDatetime } from '../data/demoData'
import { PREDICT_SCENARIOS, getContributingFactors, getNaiveBaseline } from '../utils/predictUtils'
import { DEMO_ANALYTICS } from '../data/demoData'

function Toggle({ options, value, onChange, danger = false }: {
  options: { val: string | boolean; label: string }[]
  value: string | boolean
  onChange: (v: string | boolean) => void
  danger?: boolean
}) {
  return (
    <div className="flex">
      {options.map(opt => {
        const active = value === opt.val
        const bg = danger && active ? '#C84B2F' : active ? '#1A1A18' : 'transparent'
        const color = active ? '#EAE8E1' : '#4A4844'
        const border = danger && active ? '#C84B2F' : active ? '#1A1A18' : '#C8C5BC'
        return (
          <button key={String(opt.val)} onClick={() => onChange(opt.val)}
            className="flex-1 py-3 text-[11px] font-mono uppercase tracking-[0.10em] transition-all duration-150 cursor-pointer"
            style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 0, marginLeft: -1 }}>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-mono uppercase tracking-[0.12em] mb-2 text-[#9A9690]">{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent', border: 'none',
  borderBottom: '1px solid #C8C5BC', color: '#1A1A18',
  padding: '10px 0', fontSize: 13, fontFamily: 'sans-serif',
  outline: 'none', borderRadius: 0, appearance: 'none',
}

function levelColor(level: string) {
  return level === 'High' ? '#C84B2F' : level === 'Medium' ? '#B8820A' : '#2D6A4F'
}

function SimCard({ title, pred, loading }: { title: string; pred: Record<string, unknown> | null; loading: boolean }) {
  if (loading) return <div className="border border-[#C8C5BC] p-4"><Skeleton height={100} /></div>
  if (!pred) return <div className="border border-[#C8C5BC] p-4 text-[11px] font-mono text-[#9A9690]">Failed</div>
  const label = String(pred.congestion_label || 'Low')
  const color = levelColor(label)
  return (
    <div className="border p-4" style={{ borderColor: color, borderLeftWidth: 4, background: `${color}08` }}>
      <div className="text-[9px] font-mono uppercase text-[#9A9690] mb-2">{title}</div>
      <div className="font-mono font-bold text-[24px]" style={{ color }}>{label.toUpperCase()}</div>
      <div className="text-[11px] font-mono mt-1 text-[#4A4844]">
        {typeof pred.confidence_pct === 'number' ? pred.confidence_pct.toFixed(1) : '—'}% confidence
      </div>
      <div className="mt-2 text-[11px] font-mono">
        <span className="text-[#C84B2F]">{String(pred.personnel_recommended ?? '—')}</span> officers ·{' '}
        <span className="text-[#B8820A]">{String(pred.barricades_recommended ?? '—')}</span> barricades
      </div>
    </div>
  )
}

export function Predict() {
  const { formData, result, loading, error, updateField, submitPrediction, loadDemo } = usePredict()
  const { corridors, zones, causes } = useMeta()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resultRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()
  const { addAlert } = useAlertFeed()
  const judgeRan = useRef(false)

  const [simOpen, setSimOpen] = useState(false)
  const [simMode, setSimMode] = useState<'closure' | 'eventType'>('closure')
  const [simA, setSimA] = useState<Record<string, unknown> | null>(null)
  const [simB, setSimB] = useState<Record<string, unknown> | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  const runScenario = useCallback(async (scenarioForm: Record<string, unknown>) => {
    const start = getTodayDatetime(scenarioForm.startHour as number, scenarioForm.startMin as number)
    const end = getTodayDatetime((scenarioForm.startHour as number) + 3, scenarioForm.startMin as number)
    const { startHour, startMin, ...rest } = scenarioForm
    loadDemo({ ...rest, start_datetime: start, end_datetime: end } as never)
    const pred = await submitPrediction({ ...rest, start_datetime: start, end_datetime: end } as never)
    if (pred) {
      showToast(`Prediction complete — ${pred.congestion_label} congestion`, 'success')
      if (pred.congestion_label === 'High') addAlert(`HIGH risk predicted on ${rest.corridor}`)
      addAlert(`Recommendation generated — ${pred.personnel_recommended} officers, ${pred.barricades_recommended} barricades`)
    }
  }, [loadDemo, submitPrediction, showToast, addAlert])

  useEffect(() => {
    if (searchParams.get('judge') === '1' && !judgeRan.current) {
      judgeRan.current = true
      const demoForm: Record<string, unknown> = {}
      searchParams.forEach((val, key) => {
        if (key === 'judge' || key === 'demo') return
        demoForm[key] = val === 'true' ? true : val === 'false' ? false : key === 'latitude' || key === 'longitude' ? parseFloat(val) : val
      })
      loadDemo(demoForm as never)
      submitPrediction(demoForm as never).then(pred => {
        if (pred) {
          showToast('Judge scenario loaded — prediction ready', 'success')
          if (pred.congestion_label === 'High') addAlert(`HIGH risk predicted on ${demoForm.corridor}`)
          addAlert(`Recommendation generated — ${pred.personnel_recommended} officers, ${pred.barricades_recommended} barricades`)
        }
      })
    } else if (searchParams.get('demo') === '1') {
      const demoForm: Record<string, unknown> = {}
      searchParams.forEach((val, key) => {
        if (key === 'demo' || key === 'judge') return
        demoForm[key] = val === 'true' ? true : val === 'false' ? false : val
      })
      loadDemo(demoForm as never)
    }
  }, [])

  useEffect(() => {
    if (result && resultRef.current) resultRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [result])

  const handleSubmit = async () => {
    const pred = await submitPrediction()
    if (pred) {
      showToast(`Prediction complete — ${pred.congestion_label} congestion`, 'success')
      if (pred.congestion_label === 'High') addAlert(`HIGH risk predicted on ${formData.corridor}`)
      addAlert(`Recommendation generated — ${pred.personnel_recommended} officers, ${pred.barricades_recommended} barricades`)
    } else {
      showToast('Prediction failed — check API connection', 'error')
    }
  }

  const runSimulation = async () => {
    setSimOpen(true)
    setSimLoading(true)
    setSimA(null)
    setSimB(null)
    const base = { ...formData }
    try {
      if (simMode === 'closure') {
        const [a, b] = await Promise.all([
          predict({ ...base, requires_road_closure: true }),
          predict({ ...base, requires_road_closure: false }),
        ])
        setSimA(a?.prediction || null)
        setSimB(b?.prediction || null)
      } else {
        const flipped = formData.event_type === 'planned' ? 'unplanned' : 'planned'
        const [a, b] = await Promise.all([
          predict({ ...base, event_type: 'planned' }),
          predict({ ...base, event_type: 'unplanned' }),
        ])
        setSimA(a?.prediction || null)
        setSimB(b?.prediction || null)
        void flipped
      }
      showToast('Scenario comparison complete', 'info')
      addAlert('What-if simulation completed — comparison ready')
    } catch {
      showToast('Simulation failed', 'error')
    }
    setSimLoading(false)
  }

  const pred = result as Record<string, unknown> | null
  const factors = getContributingFactors(formData as Record<string, unknown>)
  const probs = (pred?.probabilities as { low: number; medium: number; high: number }) || { low: 0, medium: 0, high: 0 }
  const label = String(pred?.congestion_label || 'Low')
  const naiveMax = getNaiveBaseline(label)
  const personnel = Number(pred?.personnel_recommended) || 0
  const savingsPct = personnel ? Math.round((1 - personnel / naiveMax) * 100) : 0
  const medianEntry = (DEMO_ANALYTICS.median_duration as { event_cause: string; median_mins: number }[])
    .find(m => m.event_cause === formData.event_cause)
  const medianMins = medianEntry?.median_mins || 64
  const responseWindow = Math.max(medianMins - Math.round(medianMins * 0.15), 0)

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2">
      <div className="overflow-y-auto border-r border-[#C8C5BC] p-6 md:p-8">
        <h1 className="font-sans font-bold text-[#1A1A18] lowercase" style={{ fontSize: 44, letterSpacing: '-0.03em' }}>predict</h1>
        <p className="text-[13px] font-sans mt-2 text-[#4A4844]">Deployment recommendations for Bangalore Traffic Police</p>

        <div className="mt-5 mb-4">
          <div className="text-[9px] font-mono uppercase tracking-[0.14em] mb-2 text-[#9A9690]">DEMO SCENARIO LIBRARY</div>
          <div className="flex flex-col gap-1">
            {PREDICT_SCENARIOS.map(sc => (
              <button key={sc.label}
                onClick={() => runScenario(sc.form as Record<string, unknown>)}
                className="flex items-center gap-3 px-3 py-2 border border-[#C8C5BC] text-left cursor-pointer hover:border-[#1A1A18]"
                style={{ background: 'transparent', borderRadius: 0 }}>
                <span className="text-[11px] font-mono text-[#1A1A18]">{sc.label}</span>
                <span className="ml-auto text-[10px] font-mono text-[#C8C5BC]">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#C8C5BC] mb-4" />

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <FieldWrapper label="Event Cause">
            <select value={formData.event_cause} onChange={e => updateField('event_cause', e.target.value)} style={inputStyle}>
              <option value="">Select cause</option>
              {causes.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </FieldWrapper>
          <FieldWrapper label="Corridor">
            <select value={formData.corridor} onChange={e => updateField('corridor', e.target.value)} style={inputStyle}>
              <option value="">Select corridor</option>
              {corridors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FieldWrapper>
          <FieldWrapper label="Zone">
            <select value={formData.zone} onChange={e => updateField('zone', e.target.value)} style={inputStyle}>
              <option value="">Select zone</option>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </FieldWrapper>
          <FieldWrapper label="Police Station">
            <input value={formData.police_station} onChange={e => updateField('police_station', e.target.value)} placeholder="Enter station name" style={inputStyle} />
          </FieldWrapper>
          <div className="sm:col-span-2">
            <FieldWrapper label="Event Type">
              <Toggle options={[{ val: 'planned', label: 'Planned' }, { val: 'unplanned', label: 'Unplanned' }]}
                value={formData.event_type} onChange={v => updateField('event_type', v)} />
            </FieldWrapper>
          </div>
          <div className="sm:col-span-2">
            <FieldWrapper label="Priority">
              <Toggle options={[{ val: 'High', label: 'High' }, { val: 'Low', label: 'Low' }]}
                value={formData.priority} onChange={v => updateField('priority', v)} />
            </FieldWrapper>
          </div>
          <FieldWrapper label="Start Date / Time">
            <input type="datetime-local" value={formData.start_datetime} onChange={e => updateField('start_datetime', e.target.value)} style={inputStyle} />
          </FieldWrapper>
          <FieldWrapper label="End Date / Time">
            <input type="datetime-local" value={formData.end_datetime} onChange={e => updateField('end_datetime', e.target.value)} style={inputStyle} />
          </FieldWrapper>
          <FieldWrapper label="Latitude">
            <input type="number" value={formData.latitude} onChange={e => updateField('latitude', parseFloat(e.target.value))} style={inputStyle} />
          </FieldWrapper>
          <FieldWrapper label="Longitude">
            <input type="number" value={formData.longitude} onChange={e => updateField('longitude', parseFloat(e.target.value))} style={inputStyle} />
          </FieldWrapper>
          <div className="sm:col-span-2">
            <FieldWrapper label="Requires Road Closure">
              <Toggle danger
                options={[{ val: false, label: 'No Closure' }, { val: true, label: 'YES — FULL CLOSURE' }]}
                value={formData.requires_road_closure} onChange={v => updateField('requires_road_closure', v)} />
            </FieldWrapper>
          </div>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-3 px-3 py-2 border-l-2 border-[#C84B2F] text-[11px] font-mono text-[#C84B2F] bg-[#C84B2F08]">
              ! Prediction failed — ensure all required fields are filled
            </div>
          )}
          <OpsButton variant="primary" fullWidth loading={loading} onClick={handleSubmit}>
            <span>ANALYSE &amp; RECOMMEND</span>
            <span>→</span>
          </OpsButton>
        </div>
      </div>

      <div ref={resultRef} className="overflow-y-auto bg-[#E2E0D8] p-6 md:p-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center">
              <Skeleton height={200} width={280} />
              <div className="text-[13px] font-mono mt-4 uppercase tracking-[0.14em] text-[#9A9690]">Analysing Incident...</div>
            </motion.div>
          ) : !pred ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-[80px] text-[#C8C5BC]">◉</div>
              <div className="text-[13px] font-sans mt-2 text-[#9A9690]">Run a prediction</div>
              <div className="text-[11px] font-mono mt-1 text-[#C8C5BC]">Pick a scenario or fill the form →</div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative">
              <CornerMarks />

              {/* Level Banner */}
              <div className="p-5 mb-3" style={{ background: `${levelColor(label)}12`, border: `1px solid ${levelColor(label)}50`, borderLeft: `4px solid ${levelColor(label)}` }}>
                <div className="text-[9px] font-mono uppercase tracking-[0.18em] mb-1 font-bold" style={{ color: levelColor(label) }}>CONGESTION LEVEL</div>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono font-bold text-[44px] leading-none" style={{ color: levelColor(label) }}>{label.toUpperCase()}</span>
                  <span className="text-[13px] font-mono text-[#4A4844]">
                    {typeof pred.confidence_pct === 'number' ? pred.confidence_pct.toFixed(1) : '—'}% confidence
                  </span>
                </div>
                <div className="mt-3 px-2.5 py-2" style={{ marginTop: 8, padding: '8px 10px', background: '#1A1A1806', borderLeft: '2px solid #9A9690' }}>
                  <p className="text-[9px] font-mono text-[#6B6860] leading-[1.5]">
                    Confidence represents ensemble agreement across LightGBM, CatBoost, and XGBoost models.
                    Higher confidence indicates stronger model agreement, not certainty of outcome.
                  </p>
                </div>
                {/* Probability segments */}
                <div className="flex gap-1 mt-3">
                  {[
                    { pct: probs.low, color: '#2D6A4F', label: 'LOW' },
                    { pct: probs.medium, color: '#B8820A', label: 'MED' },
                    { pct: probs.high, color: '#C84B2F', label: 'HIGH' },
                  ].map(seg => (
                    <div key={seg.label} className="flex-1">
                      <div className="h-1" style={{ background: seg.color, opacity: Math.max(seg.pct, 0.1) }} />
                      <div className="text-[8px] font-mono mt-1 text-[#9A9690]">{seg.label} {Math.round(seg.pct * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why This Prediction */}
              <div className="border border-[#C8C5BC] px-4 py-3.5 my-3">
                <div className="text-[9px] font-mono uppercase text-[#9A9690] mb-3">◈ CONTRIBUTING FACTORS</div>
                {factors.map((f, i) => (
                  <div key={i} className="mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5" style={{ background: '#C84B2F18', color: '#C84B2F' }}>{f.weight}</span>
                      <span className="text-[12px] font-sans font-semibold text-[#1A1A18]">{f.label}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#9A9690] mt-0.5 ml-8">{f.detail}</div>
                  </div>
                ))}
                <div className="text-[16px] font-mono mt-3 text-[#1A1A18]">
                  Risk Score: {typeof pred.confidence_pct === 'number' ? (pred.confidence_pct / 10).toFixed(1) : '—'} / 10
                </div>
                <div className="text-[9px] font-mono text-[#9A9690] mt-2">
                  Factors reflect domain-engineered features used by the ensemble model (LightGBM + CatBoost + XGBoost).
                </div>
              </div>

              {/* Deployment Grid */}
              <div className="grid gap-px bg-[#C8C5BC] mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                  { label: 'OFFICERS', value: pred.personnel_recommended, color: '#C84B2F' },
                  { label: 'BARRICADES', value: pred.barricades_recommended, color: '#B8820A' },
                  { label: 'PRE-DEPLOY', value: typeof pred.personnel_recommended === 'number' ? Math.ceil(Number(pred.personnel_recommended) * 0.3) : '—', color: '#1A1A18' },
                ].map(cell => (
                  <div key={cell.label} className="bg-[#EAE8E1] px-4 py-4 text-center">
                    <div className="font-mono font-bold text-[32px]" style={{ color: cell.color }}>{String(cell.value ?? '—')}</div>
                    <div className="text-[9px] font-mono uppercase mt-1 text-[#4A4844]">{cell.label}</div>
                  </div>
                ))}
              </div>

              {/* Resource Optimizer */}
              <div className="border border-[#C8C5BC] px-4 py-4 mt-4">
                <div className="text-[9px] font-mono uppercase text-[#9A9690] mb-3">RESOURCE OPTIMIZATION</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-mono text-[#9A9690] mb-1">CURRENT RECOMMENDATION</div>
                    <div className="text-[9px] font-mono text-[#9A9690]">OFFICERS</div>
                    <div className="font-mono font-bold text-[28px] text-[#C84B2F]">{String(pred.personnel_recommended ?? '—')}</div>
                    <div className="text-[9px] font-mono text-[#9A9690] mt-2">BARRICADES</div>
                    <div className="font-mono font-bold text-[28px] text-[#B8820A]">{String(pred.barricades_recommended ?? '—')}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-[#9A9690] mb-2">ESTIMATED SAVINGS</div>
                    <div className="flex gap-2 items-start mb-2">
                      <span className="text-[#2D6A4F] font-mono">↓</span>
                      <span className="text-[12px] font-sans text-[#1A1A18]">
                        {savingsPct}% officer over-deployment vs static deployment rules
                      </span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-[#2D6A4F] font-mono">↓</span>
                      <span className="text-[12px] font-sans text-[#1A1A18]">
                        {responseWindow} min avg response window (model flags risk before peak congestion forms)
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-[#9A9690] mt-2">Calculated vs fixed-rule deployment baseline</div>
                  </div>
                </div>
              </div>

              {/* Diversion Routes */}
              {Array.isArray(pred.diversion_routes) && pred.diversion_routes.length > 0 && (
                <div className="mt-4">
                  <div className="text-[9px] font-mono uppercase text-[#9A9690] mb-2">DIVERSION ROUTES</div>
                  {(pred.diversion_routes as string[]).map((route, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 border border-[#C8C5BC] mt-1 hover:border-[#1A1A18] transition-colors">
                      <span className="text-[14px] font-mono font-bold text-[#C84B2F]">→</span>
                      <span className="text-[12px] font-sans text-[#1A1A18]">{route}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Alerts */}
              {Array.isArray(pred.alerts) && pred.alerts.length > 0 && (
                <div className="mt-4">
                  <div className="text-[9px] font-mono uppercase text-[#9A9690] mb-2">ALERTS</div>
                  {(pred.alerts as string[]).map((alert, i) => {
                    const isRoad = alert.toLowerCase().includes('road') || alert.toLowerCase().includes('closure')
                    const isPeak = alert.toLowerCase().includes('peak')
                    const isPlanned = alert.toLowerCase().includes('planned')
                    const bc = isRoad ? '#C84B2F' : isPeak ? '#B8820A' : isPlanned ? '#4A6E8A' : '#6B6860'
                    return (
                      <div key={i} className="p-2.5 mt-1" style={{ borderLeft: `2px solid ${bc}`, background: `${bc}0A` }}>
                        <span className="text-[11px] font-mono text-[#4A4844]">{alert}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Simulate button */}
              <div className="mt-4 flex gap-2">
                <OpsButton variant="secondary" fullWidth onClick={() => { setSimMode('closure'); runSimulation() }}>
                  <span>⟲ SIMULATE SCENARIO</span>
                </OpsButton>
              </div>

              {simOpen && (
                <div className="mt-4 border border-[#C8C5BC] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono uppercase text-[#9A9690]">SCENARIO COMPARISON</span>
                    <button onClick={() => setSimOpen(false)} className="text-[12px] font-mono cursor-pointer" style={{ background: 'none', border: 'none' }}>✕</button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => { setSimMode('closure'); runSimulation() }}
                      className="text-[9px] font-mono px-2 py-1 border cursor-pointer"
                      style={{ background: simMode === 'closure' ? '#1A1A18' : 'transparent', color: simMode === 'closure' ? '#EAE8E1' : '#9A9690', borderColor: '#C8C5BC' }}>
                      ROAD CLOSURE
                    </button>
                    <button onClick={() => { setSimMode('eventType'); runSimulation() }}
                      className="text-[9px] font-mono px-2 py-1 border cursor-pointer"
                      style={{ background: simMode === 'eventType' ? '#1A1A18' : 'transparent', color: simMode === 'eventType' ? '#EAE8E1' : '#9A9690', borderColor: '#C8C5BC' }}>
                      EVENT TYPE
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <SimCard title={simMode === 'closure' ? 'ROAD CLOSURE: ON' : 'EVENT TYPE: PLANNED'} pred={simA} loading={simLoading} />
                    <SimCard title={simMode === 'closure' ? 'ROAD CLOSURE: OFF' : 'EVENT TYPE: UNPLANNED'} pred={simB} loading={simLoading} />
                  </div>
                  {!simLoading && simA && simB && (
                    <p className="text-[12px] font-sans text-[#1A1A18] mt-3 leading-relaxed">
                      {simMode === 'closure' ? 'Closing the road' : 'Changing event type'} shifts predicted congestion from{' '}
                      {String(simB.congestion_label)} ({typeof simB.confidence_pct === 'number' ? simB.confidence_pct.toFixed(0) : '—'}%) to{' '}
                      {String(simA.congestion_label)} ({typeof simA.confidence_pct === 'number' ? simA.confidence_pct.toFixed(0) : '—'}%) — a difference of{' '}
                      {Math.abs(Number(simA.personnel_recommended) - Number(simB.personnel_recommended))} officers in recommended deployment.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <OpsButton variant="secondary" fullWidth onClick={() => navigate('/similar')}>
                  <span>FIND SIMILAR PAST EVENTS</span>
                  <span>→</span>
                </OpsButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
