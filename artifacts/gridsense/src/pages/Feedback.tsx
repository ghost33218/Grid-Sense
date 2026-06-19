import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { postFeedback, getFeedback } from '../api/client'
import { OpsButton } from '../components/ui/OpsButton'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { useAlertFeed } from '../context/AlertFeedContext'

type FeedbackRecord = {
  event_id: string
  predicted_level: string
  actual_level: string
  prediction_correct: boolean
  created_at?: string
  date?: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #C8C5BC',
  color: '#1A1A18',
  padding: '10px 0',
  fontSize: 13,
  fontFamily: 'sans-serif',
  outline: 'none',
  borderRadius: 0,
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-2">{label}</label>
      {children}
    </div>
  )
}

function SpeedometerGauge({ accuracy }: { accuracy: number }) {
  const pct = Math.min(Math.max(accuracy, 0), 100)
  const color = pct >= 70 ? '#2D6A4F' : pct >= 50 ? '#B8820A' : '#C84B2F'
  const r = 55
  const cx = 70
  const cy = 70
  const startAngle = 135
  const endAngle = 405
  const angle = startAngle + (pct / 100) * (endAngle - startAngle)
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const arcPath = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(toRad(from))
    const y1 = cy + r * Math.sin(toRad(from))
    const x2 = cx + r * Math.cos(toRad(to))
    const y2 = cy + r * Math.sin(toRad(to))
    const large = to - from > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }
  return (
    <svg width="140" height="100" viewBox="0 0 140 100">
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#C8C5BC" strokeWidth="8" strokeLinecap="butt" />
      <path d={arcPath(startAngle, angle)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="butt" />
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="22" fontFamily="Space Mono, monospace" fontWeight="700" fill={color}>
        {pct.toFixed(0)}%
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="8" fontFamily="Space Mono, monospace" fill="#9A9690" letterSpacing="1">
        ACCURACY
      </text>
    </svg>
  )
}

export function Feedback() {
  const [form, setForm] = useState({
    event_id: '',
    predicted_level: 'Low',
    actual_level: 'Low',
    actual_duration_mins: '',
    personnel_deployed: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState<{ accuracy?: number }>({})
  const [records, setRecords] = useState<FeedbackRecord[]>([])
  const [analytics, setAnalytics] = useState<{ total: number; accuracy: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { addAlert } = useAlertFeed()

  useEffect(() => {
    getFeedback().then(d => {
      if (d) {
        setRecords(d.records || [])
        setAnalytics({ total: d.total || 0, accuracy: typeof d.accuracy === 'number' ? d.accuracy * 100 : 0 })
      }
      setLoading(false)
    })
  }, [])

  const submit = async () => {
    setSubmitting(true)
    const res = await postFeedback({
      event_id: form.event_id,
      predicted_level: form.predicted_level,
      actual_level: form.actual_level,
      actual_duration_mins: Number(form.actual_duration_mins),
      personnel_deployed: Number(form.personnel_deployed),
      notes: form.notes,
    })
    if (res?.success) {
      setSuccess(true)
      setSuccessData({ accuracy: analytics?.accuracy })
      showToast('Feedback submitted — model accuracy updated', 'success')
      addAlert('Officer feedback logged — model accuracy updated')
      getFeedback().then(d => {
        if (d) {
          setRecords(d.records || [])
          setAnalytics({ total: d.total, accuracy: d.accuracy * 100 })
        }
      })
    } else {
      showToast('Feedback submission failed', 'error')
    }
    setSubmitting(false)
  }

  const correctCount = records.filter(r => r.prediction_correct).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full grid grid-cols-1 lg:grid-cols-2"
    >
      {/* LEFT: Form */}
      <div className="overflow-y-auto border-r border-[#C8C5BC]" style={{ padding: '32px 36px' }}>
        <h1 className="font-sans font-bold text-[#1A1A18] lowercase" style={{ fontSize: 48, letterSpacing: '-0.03em' }}>
          feedback
        </h1>
        <p className="text-[13px] font-sans text-[#6B6860] mt-2">
          Log actual outcomes to improve model accuracy over time
        </p>
        <div className="border-t border-[#C8C5BC] my-6" />

        <div className="flex flex-col gap-5">
          <FieldWrapper label="Event ID">
            <input
              value={form.event_id}
              onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
              placeholder="FKID000001"
              style={inputStyle}
            />
          </FieldWrapper>

          <FieldWrapper label="Predicted Level">
            <select
              value={form.predicted_level}
              onChange={e => setForm(f => ({ ...f, predicted_level: e.target.value }))}
              style={inputStyle}
            >
              {['Low', 'Medium', 'High'].map(l => <option key={l}>{l}</option>)}
            </select>
          </FieldWrapper>

          <FieldWrapper label="Actual Level">
            <select
              value={form.actual_level}
              onChange={e => setForm(f => ({ ...f, actual_level: e.target.value }))}
              style={inputStyle}
            >
              {['Low', 'Medium', 'High'].map(l => <option key={l}>{l}</option>)}
            </select>
          </FieldWrapper>

          <FieldWrapper label="Actual Duration (minutes)">
            <input
              type="number"
              value={form.actual_duration_mins}
              onChange={e => setForm(f => ({ ...f, actual_duration_mins: e.target.value }))}
              placeholder="e.g. 120"
              style={inputStyle}
            />
          </FieldWrapper>

          <FieldWrapper label="Personnel Deployed">
            <input
              type="number"
              value={form.personnel_deployed}
              onChange={e => setForm(f => ({ ...f, personnel_deployed: e.target.value }))}
              placeholder="e.g. 12"
              style={inputStyle}
            />
          </FieldWrapper>

          <FieldWrapper label="Notes">
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Additional observations..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </FieldWrapper>
        </div>

        <div className="mt-7">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border border-[#2D6A4F] bg-[#2D6A4F10]"
              >
                <div className="text-[11px] font-mono text-[#2D6A4F]">✓ FEEDBACK RECORDED</div>
                <div className="text-[11px] font-mono text-[#6B6860] mt-1">
                  Model accuracy: {successData.accuracy?.toFixed(1)}%
                </div>
              </motion.div>
            ) : (
              <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <OpsButton variant="primary" fullWidth loading={submitting} onClick={submit}>
                  <span>SUBMIT FEEDBACK</span>
                  <span>→</span>
                </OpsButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: Analytics */}
      <div className="overflow-y-auto bg-[#E2E0D8]" style={{ padding: '32px 36px' }}>
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-[11px] font-mono text-[#9A9690] uppercase tracking-[0.12em]">Loading feedback data...</div>
            <Skeleton height={180} width={180} />
            <Skeleton lines={3} height={20} />
          </div>
        ) : (
          <>
            {/* Accuracy Gauge — bigger */}
            <div className="flex flex-col items-center mb-6">
              <SpeedometerGauge accuracy={analytics?.accuracy || 0} />
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-3 gap-px bg-[#C8C5BC] mb-6">
              {[
                { label: 'TOTAL FEEDBACK', value: String(analytics?.total || records.length), color: '#1A1A18' },
                { label: 'CORRECT PREDICTIONS', value: String(correctCount), color: '#2D6A4F' },
                { label: 'MODEL ACCURACY', value: `${(analytics?.accuracy || 0).toFixed(1)}%`, color: '#B8820A' },
              ].map(stat => (
                <div key={stat.label} className="bg-[#EAE8E1] p-4 text-center">
                  <div className="font-mono font-bold text-[22px]" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[8px] font-mono uppercase text-[#9A9690] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Per-class accuracy */}
            <div className="text-[9px] font-mono text-[#9A9690] uppercase tracking-[0.12em] mb-2">PER-CLASS ACCURACY</div>
            {['LOW', 'MEDIUM', 'HIGH'].map((cls) => {
              const classRecords = records.filter(r => r.actual_level?.toUpperCase() === cls)
              const correct = classRecords.filter(r => r.prediction_correct).length
              const pct = classRecords.length > 0 ? (correct / classRecords.length) * 100 : 0
              const color = cls === 'HIGH' ? '#C84B2F' : cls === 'MEDIUM' ? '#B8820A' : '#2D6A4F'
              return (
                <div key={cls} className="flex items-center gap-3 border-t border-[#C8C5BC] py-2.5">
                  <span className="text-[9px] font-mono text-[#9A9690] w-16">{cls}</span>
                  <div className="flex-1 bg-[#D4D1C8] h-1.5">
                    <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#1A1A18] w-10 text-right" style={{ color }}>{pct.toFixed(0)}%</span>
                </div>
              )
            })}

            {/* Feedback Table */}
            <div className="mt-6">
              <div className="text-[9px] font-mono text-[#9A9690] uppercase tracking-[0.12em] mb-2">FEEDBACK HISTORY</div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#E2E0D8] border-b border-[#C8C5BC]">
                    {['ID', 'PREDICTED', 'ACTUAL', 'MATCH', 'DATE'].map(h => (
                      <th key={h} className="text-left text-[9px] font-mono text-[#9A9690] uppercase pb-2 pt-1 pr-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-[#C8C5BC] hover:bg-[#1A1A1804]">
                      <td className="py-2 text-[10px] font-mono text-[#9A9690] pr-2">{String(r.event_id || '—').slice(0, 10)}</td>
                      <td className="py-2 text-[10px] font-mono text-[#6B6860] pr-2">{r.predicted_level}</td>
                      <td className="py-2 text-[10px] font-mono text-[#6B6860] pr-2">{r.actual_level}</td>
                      <td className="py-2 text-[10px] font-mono pr-2">
                        {r.prediction_correct
                          ? <span className="text-[#2D6A4F]">✓ CORRECT</span>
                          : <span className="text-[#C84B2F]">✗ WRONG</span>}
                      </td>
                      <td className="py-2 text-[10px] font-mono text-[#9A9690]">
                        {r.date || r.created_at ? new Date(r.date || r.created_at || '').toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length === 0 && (
                <div className="text-center py-8 text-[11px] font-mono text-[#9A9690]">No feedback records yet</div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
