import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getSimilar } from '../api/client'
import { OpsButton } from '../components/ui/OpsButton'
import { Skeleton } from '../components/ui/Skeleton'
import { DataRow } from '../components/ui/DataRow'
import { Badge } from '../components/ui/Badge'
import { ErrorBlock } from '../components/ui/ErrorBlock'
import { useToast } from '../context/ToastContext'
import { useAlertFeed } from '../context/AlertFeedContext'
import { formatDuration } from '../utils/predictUtils'

type SimilarEvent = {
  event_id: string
  similarity: number
  event_cause: string
  corridor: string
  duration_mins: number
  date: string
  police_station: string
  congestion_level?: string
}

const SAMPLE_IDS = ['FKID000001', 'FKID000010', 'FKID000050', 'FKID000100']

function CircleGauge({ score }: { score: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const color = score >= 85 ? '#C84B2F' : score >= 70 ? '#B8820A' : '#6B6860'
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} stroke="#C8C5BC" strokeWidth="3" fill="none" />
      <circle cx="30" cy="30" r={r} stroke={color} strokeWidth="3" fill="none"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} transform="rotate(-90 30 30)" />
      <text x="30" y="34" textAnchor="middle" fontSize="11" fontFamily="Space Mono, monospace" fontWeight="700" fill={color}>
        {score.toFixed(0)}%
      </text>
    </svg>
  )
}

export function Similarity() {
  const [params] = useSearchParams()
  const [eventId, setEventId] = useState(params.get('event_id') || '')
  const [results, setResults] = useState<SimilarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searched, setSearched] = useState(false)
  const { showToast } = useToast()
  const { addAlert } = useAlertFeed()
  const autoSearched = useRef(false)

  const search = async (id?: string) => {
    const target = id || eventId.trim()
    if (!target) return
    if (id) setEventId(id)
    setLoading(true)
    setError(false)
    const d = await getSimilar(target)
    if (d?.similar_events?.length) {
      setResults(d.similar_events.slice(0, 3))
      showToast(`Found ${d.similar_events.length} similar events`, 'success')
      addAlert(`${Math.min(d.similar_events.length, 3)} similar historical events matched`)
    } else {
      setError(true)
      setResults([])
      showToast('No similar events found', 'error')
    }
    setSearched(true)
    setLoading(false)
  }

  useEffect(() => {
    const id = params.get('event_id')
    if (id && !autoSearched.current) {
      autoSearched.current = true
      setEventId(id)
      search(id)
    }
  }, [params])

  const topResult = results[0]
  const insight = topResult
    ? `This incident is ${(topResult.similarity * 100).toFixed(0)}% similar to a ${topResult.event_cause?.replace(/_/g, ' ')} on ${topResult.corridor} in ${topResult.date ? new Date(topResult.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'the past'}. That incident lasted ${formatDuration(topResult.duration_mins)}. Consider a similar pre-deployment strategy with officer levels matching historical response.`
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="p-6 md:p-8 max-w-5xl"
    >
      <h1 className="font-sans font-bold text-[#1A1A18] lowercase" style={{ fontSize: 48, letterSpacing: '-0.03em' }}>similarity</h1>
      <p className="text-[13px] font-sans text-[#6B6860] mt-2">
        Find historical incidents matching your event using cosine similarity across 63 features
      </p>

      <div className="mt-5 mb-4">
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#9A9690] mb-2">TRY SAMPLE INCIDENTS</div>
        <div className="flex gap-2 flex-wrap">
          {SAMPLE_IDS.map(id => (
            <button key={id} onClick={() => search(id)}
              className="text-[11px] font-mono border border-[#C8C5BC] px-3 py-2 cursor-pointer hover:border-[#1A1A18]"
              style={{ background: eventId === id ? '#1A1A18' : 'transparent', color: eventId === id ? '#EAE8E1' : '#6B6860' }}>
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-[#C8C5BC] p-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[10px] font-mono text-[#9A9690] flex-shrink-0">EVENT ID</span>
          <input value={eventId} onChange={e => setEventId(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g. FKID000001" className="flex-1 bg-transparent text-[13px] font-sans text-[#1A1A18] outline-none border-b border-[#C8C5BC] pb-1" />
        </div>
        <OpsButton variant="primary" onClick={() => search()} loading={loading}>
          <span>FIND SIMILAR</span>
          <span>→</span>
        </OpsButton>
      </div>

      {loading && (
        <div className="mt-8 grid gap-2 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={220} />)}
        </div>
      )}

      {error && <div className="mt-4"><ErrorBlock label="similarity results" onRetry={() => search()} /></div>}

      {!loading && results.length > 0 && (
        <>
          <div className="mt-6 grid gap-2 grid-cols-1 md:grid-cols-3">
            {results.map((ev, i) => {
              const score = typeof ev.similarity === 'number' ? ev.similarity * 100 : Number(ev.similarity)
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }} className="border bg-[#EAE8E1]"
                  style={{ borderWidth: i === 0 ? 2 : 1, borderColor: i === 0 ? '#C84B2F' : '#C8C5BC' }}>
                  <div className="px-4 py-3 border-b border-[#C8C5BC] flex items-center gap-3">
                    <CircleGauge score={score} />
                    <div>
                      <div className="text-[9px] font-mono text-[#9A9690] uppercase">SIMILARITY MATCH</div>
                      <div className="text-[11px] font-mono text-[#1A1A18]">#{i + 1} Match</div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <DataRow label="Cause" value={(ev.event_cause || '—').replace(/_/g, ' ')} />
                    <DataRow label="Corridor" value={ev.corridor || '—'} />
                    <DataRow label="Station" value={ev.police_station || '—'} />
                    <DataRow label="Date" value={ev.date ? new Date(ev.date).toLocaleDateString('en-IN') : '—'} />
                    <DataRow label="Duration" value={formatDuration(ev.duration_mins)} />
                  </div>
                  <div className="px-4 py-3 bg-[#E2E0D8] border-t border-[#C8C5BC] flex items-center gap-2">
                    {ev.congestion_level && <Badge level={ev.congestion_level} />}
                    <Badge level={ev.duration_mins > 180 ? 'High' : ev.duration_mins > 37 ? 'Medium' : 'Low'} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {insight && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 border border-[#C8C5BC] bg-[#E2E0D8] px-5 py-4" style={{ borderLeft: '3px solid #C84B2F' }}>
              <div className="text-[9px] font-mono text-[#C84B2F] uppercase tracking-[0.16em] mb-3">◈ PATTERN INSIGHT</div>
              <p className="text-[14px] font-sans text-[#1A1A18] leading-relaxed">{insight}</p>
              <p className="text-[9px] font-mono text-[#9A9690] mt-3 leading-relaxed">
                Similarity computed via cosine distance across all 63 normalized model features (not just event_cause/corridor — includes time patterns, severity, and historical load).
              </p>
            </motion.div>
          )}
        </>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="mt-12 text-center text-[13px] font-sans text-[#9A9690]">No similar events found</div>
      )}
    </motion.div>
  )
}
