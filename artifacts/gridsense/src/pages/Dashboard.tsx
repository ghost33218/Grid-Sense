import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAnalytics } from '../hooks/useAnalytics'
import { getEvents, getCauses, getCorridors } from '../api/client'
import { useAlertFeed } from '../context/AlertFeedContext'
import { Panel } from '../components/ui/Panel'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorBlock } from '../components/ui/ErrorBlock'
import { CityRiskIndex } from '../components/dashboard/CityRiskIndex'
import { AlertFeed } from '../components/dashboard/AlertFeed'
import { formatDuration } from '../utils/predictUtils'
import { DEMO_HOTSPOTS } from '../data/demoData'

function useCountUp(target: number, duration = 800) {
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

function Sparkline({ data, accentColor }: { data: { count: number }[]; accentColor: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="mt-2">
      <div className="flex items-end gap-0.5" style={{ height: 24 }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1" style={{
            height: `${(d.count / max) * 100}%`,
            background: i === data.length - 1 ? accentColor : '#C8C5BC',
            minHeight: 2,
          }} />
        ))}
      </div>
      <div className="text-[9px] font-mono text-[#9A9690] mt-1">5-month trend</div>
    </div>
  )
}

function StatCard({ label, value, delta, accentColor, sparkData }: {
  label: string; value: string | number; delta?: string; accentColor: string
  sparkData?: { count: number }[]
}) {
  const numVal = typeof value === 'number' ? value : parseInt(String(value)) || 0
  const countVal = useCountUp(numVal)
  return (
    <div className="bg-[#E2E0D8] border border-[#C8C5BC] p-4" style={{ borderTop: `2px solid ${accentColor}` }}>
      <div className="text-[9px] font-mono uppercase tracking-[0.14em] mb-2 text-[#9A9690]">{label}</div>
      <div className="font-mono font-bold" style={{ fontSize: 32, color: accentColor, lineHeight: 1 }}>
        {typeof value === 'number' ? countVal.toLocaleString() : value}
      </div>
      {delta && <div className="text-[10px] font-mono mt-1.5 text-[#4A4844]">{delta}</div>}
      {sparkData && <Sparkline data={sparkData} accentColor={accentColor} />}
    </div>
  )
}

const causeColors: Record<string, string> = {
  construction: '#C84B2F', vip_movement: '#C84B2F', public_event: '#C84B2F', procession: '#C84B2F',
  accident: '#B8820A', protest: '#B8820A', water_logging: '#B8820A',
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 50)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className="flex-1 bg-[#D4D1C8] relative" style={{ height: 5 }}>
      <div style={{ width: `${width}%`, height: '100%', background: color, transition: 'width 0.6s ease' }} />
    </div>
  )
}

export function Dashboard() {
  const { summary, analytics, loading, error, isDemo, refetch } = useAnalytics()
  const [events, setEvents] = useState<Record<string, unknown>[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(true)
  const { addAlert } = useAlertFeed()
  const initRef = useRef(false)

  useEffect(() => {
    if (!initRef.current && summary) {
      initRef.current = true
      addAlert(`System initialized — ${Number(summary.total_events || 8173).toLocaleString()} historical incidents loaded`)
    }
  }, [summary, addAlert])

  useEffect(() => {
    setEventsLoading(true)
    getEvents({ limit: 20, priority: 'High' }).then(d => {
      if (d?.events) {
        setEvents(d.events)
        setApiConnected(true)
      } else {
        setEvents(DEMO_HOTSPOTS.slice(0, 20).map((h, i) => ({
          corridor: h.corridor, event_cause: h.event_cause, start_datetime: h.start_datetime, priority: 'High', id: `DEMO${i}`,
        })))
        setApiConnected(false)
      }
      setEventsLoading(false)
    })
  }, [])

  const causeData = (analytics?.events_by_cause as { cause: string; count: number }[]) || []
  const hourData = (analytics?.events_by_hour as { hour: number; count: number }[]) || []
  const corridorData = [...((analytics?.congestion_by_corridor as { corridor: string; high_rate: number }[]) || [])]
    .sort((a, b) => b.high_rate - a.high_rate)
  const monthlyTrend = (analytics?.monthly_trend as { ym: string; count: number }[]) || []

  const maxCause = Math.max(...causeData.map(d => d.count), 1)
  const topRiskCorridors = corridorData.slice(0, 8)
  const topCorridorsChart = corridorData.slice(0, 6)
  const tickerEvents = events.slice(0, 10)

  const hourChartData = Array.from({ length: 24 }, (_, hour) => {
    const d = hourData.find(h => h.hour === hour)
    const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21)
    return { hour: `${hour}`, count: d?.count || 0, isPeak }
  })

  if (error && !summary) {
    return (
      <div className="p-5">
        <ErrorBlock label="dashboard data" onRetry={refetch} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="p-4 flex flex-col gap-3.5"
    >
      <AlertFeed />

      <CityRiskIndex
        summary={summary}
        corridorData={corridorData}
        isDemo={isDemo}
        apiConnected={apiConnected}
        loading={loading}
      />

      {/* Active Incidents Ticker */}
      <div className="flex items-center gap-4 overflow-hidden bg-[#E2E0D8] border border-[#C8C5BC]"
        style={{ height: 34, borderLeft: '3px solid #C84B2F' }}>
        <span className="text-[9px] font-mono tracking-[0.14em] text-[#C84B2F] flex-shrink-0 pl-4 font-bold">◈ ACTIVE INCIDENTS</span>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'ticker 40s linear infinite' }}>
            {(tickerEvents.length ? tickerEvents.concat(tickerEvents) : [{ corridor: 'Mysore Road', event_cause: 'public_event', start_datetime: new Date().toISOString() }]).map((ev, i) => (
              <span key={i} className="text-[10px] font-mono text-[#4A4844]">
                <span className="text-[#1A1A18] font-bold">{String(ev.corridor || '—')}</span>
                {' '}— {String(ev.event_cause || '').toUpperCase().replace(/_/g, ' ')} —{' '}
                {ev.start_datetime ? new Date(String(ev.start_datetime)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={96} />) : (
          <>
            <StatCard label="Total Incidents" value={Number(summary?.total_events) || 8173} accentColor="#C84B2F" delta="Historical dataset" sparkData={monthlyTrend} />
            <StatCard label="Road Closures" value={Number(summary?.road_closures) || 676} accentColor="#2D6A4F" delta="Requiring diversion" sparkData={monthlyTrend} />
            <StatCard label="Median Duration" value={`${summary?.median_duration ?? 64}m`} accentColor="#B8820A" delta="Minutes per incident" />
            <StatCard label="Model Accuracy" value="63.8%" accentColor="#1A1A18" delta="F1 Score: 0.640" />
          </>
        )}
      </div>

      {/* Cause + Top Risk */}
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="EVENT CAUSE BREAKDOWN" badge="TOP 8" badgeColor="#C8C5BC">
          {loading ? <Skeleton lines={8} height={20} /> : (
            <div className="flex flex-col gap-2">
              {causeData.slice(0, 8).map(d => {
                const color = causeColors[d.cause] || '#2D6A4F'
                return (
                  <div key={d.cause} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono w-[90px] truncate flex-shrink-0 text-[#4A4844]">
                      {d.cause.replace(/_/g, ' ')}
                    </span>
                    <AnimatedBar pct={(d.count / maxCause) * 100} color={color} />
                    <span className="text-[10px] font-mono w-[38px] text-right font-bold text-[#1A1A18]">{d.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        <div className="border border-[#C8C5BC] bg-[#EAE8E1]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#C8C5BC]">
            <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#1A1A18]">TOP RISK CORRIDORS</span>
          </div>
          <div>
            {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-4 py-2.5"><Skeleton height={20} /></div>) :
              topRiskCorridors.map((corridor, i) => {
                const rate = corridor.high_rate * 100
                const rateColor = rate > 40 ? '#C84B2F' : rate > 25 ? '#B8820A' : '#2D6A4F'
                return (
                  <div key={corridor.corridor} className="flex items-center gap-3 px-4 py-2 border-b border-[#C8C5BC]">
                    <span className="text-[9px] font-mono w-4 text-[#9A9690]">{i + 1}</span>
                    <span className="text-[11px] font-sans font-medium flex-1 truncate text-[#1A1A18]">{corridor.corridor}</span>
                    <div className="w-[60px] h-1.5 bg-[#D4D1C8]">
                      <div style={{ width: `${rate}%`, height: '100%', background: rateColor }} />
                    </div>
                    <span className="text-[10px] font-mono w-8 text-right font-bold" style={{ color: rateColor }}>{rate.toFixed(0)}%</span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Hourly + Corridor Recharts */}
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="HOURLY INCIDENT PATTERN" badge="24H" badgeColor="#787370">
          {loading ? <Skeleton height={100} /> : (
            <div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={hourChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="hour" tick={{ fontSize: 8, fontFamily: 'Space Mono', fill: '#9A9690' }} interval={5} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A18', border: 'none', borderRadius: 0, fontFamily: 'Space Mono', fontSize: 10, color: '#EAE8E1' }}
                    labelStyle={{ color: '#EAE8E1' }}
                  />
                  <Bar dataKey="count" radius={0}>
                    {hourChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.isPeak ? '#C84B2F' : '#C8C5BC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#C84B2F]" />
                  <span className="text-[8px] font-mono text-[#9A9690]">■ Peak hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#C8C5BC]" />
                  <span className="text-[8px] font-mono text-[#9A9690]">□ Off-peak</span>
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="CORRIDOR CONGESTION" badge="TOP 6" badgeColor="#2D6A4F">
          {loading ? <Skeleton height={120} /> : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={topCorridorsChart} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 8, fontFamily: 'Space Mono' }} />
                <YAxis type="category" dataKey="corridor" width={90} tick={{ fontSize: 9, fontFamily: 'Space Mono' }}
                  tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(0)}%`} contentStyle={{ background: '#1A1A18', border: 'none', fontFamily: 'Space Mono', fontSize: 10, color: '#EAE8E1' }} />
                <Bar dataKey="high_rate" radius={0}>
                  {topCorridorsChart.map((entry, i) => {
                    const rate = entry.high_rate * 100
                    const color = rate > 40 ? '#C84B2F' : rate > 25 ? '#B8820A' : '#2D6A4F'
                    return <Cell key={i} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <IncidentLog />
    </motion.div>
  )
}

function IncidentLog() {
  const [events, setEvents] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ event_cause: '', priority: '', corridor: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [causes, setCauses] = useState<string[]>([])
  const [corridors, setCorridors] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getCauses(), getCorridors()]).then(([c, co]) => {
      if (c?.causes) setCauses(c.causes)
      if (co?.corridors) setCorridors(co.corridors)
    })
  }, [])

  const load = async (p = page) => {
    setLoading(true)
    setError(false)
    const params: Record<string, string | number> = { page: p, limit: 15 }
    if (filters.event_cause) params.event_cause = filters.event_cause
    if (filters.priority) params.priority = filters.priority
    if (filters.corridor) params.corridor = filters.corridor
    const d = await getEvents(params)
    if (d) {
      setEvents(d.events || [])
      setTotal(d.total || 0)
    } else {
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => { load(page) }, [page])

  const applyFilters = () => { setPage(1); load(1) }

  return (
    <Panel title="INCIDENT LOG" noPadding>
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-[#C8C5BC] gap-2">
        <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#9A9690]">FILTER</span>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filters.event_cause} onChange={e => setFilters(f => ({ ...f, event_cause: e.target.value }))}
            className="text-[10px] font-mono bg-[#EAE8E1] border border-[#C8C5BC] px-2 py-1 outline-none" style={{ borderRadius: 0 }}>
            <option value="">ALL CAUSES</option>
            {causes.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
            className="text-[10px] font-mono bg-[#EAE8E1] border border-[#C8C5BC] px-2 py-1 outline-none" style={{ borderRadius: 0 }}>
            <option value="">ALL PRIORITY</option>
            <option value="High">High</option>
            <option value="Low">Low</option>
          </select>
          <select value={filters.corridor} onChange={e => setFilters(f => ({ ...f, corridor: e.target.value }))}
            className="text-[10px] font-mono bg-[#EAE8E1] border border-[#C8C5BC] px-2 py-1 outline-none max-w-[140px]" style={{ borderRadius: 0 }}>
            <option value="">ALL CORRIDORS</option>
            {corridors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={applyFilters}
            className="text-[10px] font-mono bg-[#1A1A18] text-[#EAE8E1] px-3 py-1 cursor-pointer" style={{ borderRadius: 0 }}>
            APPLY →
          </button>
        </div>
      </div>

      {error && <ErrorBlock label="incident log" onRetry={() => load(page)} />}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#E2E0D8] border-b border-[#C8C5BC]">
              {['ID', 'CAUSE', 'CORRIDOR', 'ZONE', 'PRIORITY', 'STATUS', 'DURATION', 'ACTION'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.10em] font-bold text-[#4A4844]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton height={16} /></td></tr>
            )) : events.map((ev, i) => (
              <tr key={i} className="border-b border-[#C8C5BC] hover:bg-[#1A1A1804]">
                <td className="px-4 py-2.5 text-[10px] font-mono text-[#9A9690]">{String(ev.id || '').slice(0, 12)}</td>
                <td className="px-4 py-2.5 text-[12px] font-sans font-medium text-[#1A1A18]">{String(ev.event_cause || '').replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5 text-[10px] font-mono text-[#4A4844]">{String(ev.corridor || '—')}</td>
                <td className="px-4 py-2.5 text-[10px] font-mono text-[#4A4844]">{String(ev.zone || '—')}</td>
                <td className="px-4 py-2.5"><Badge level={String(ev.priority || 'Low')} /></td>
                <td className="px-4 py-2.5"><Badge level={String(ev.status || 'active')} /></td>
                <td className="px-4 py-2.5 text-[10px] font-mono font-bold text-[#B8820A]">
                  {formatDuration(ev.duration_mins as number | null)}
                </td>
                <td className="px-4 py-2.5">
                  <button onClick={() => navigate(`/similar?event_id=${ev.id}`)}
                    className="text-[9px] font-mono border border-[#C8C5BC] px-2 py-1 cursor-pointer hover:border-[#1A1A18]"
                    style={{ background: 'transparent', color: '#4A4844', borderRadius: 0 }}>
                    SIMILAR →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#C8C5BC]">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className="text-[10px] font-mono cursor-pointer disabled:opacity-40" style={{ background: 'none', border: 'none', color: '#4A4844' }}>
          ← PREV
        </button>
        <span className="text-[10px] font-mono text-[#9A9690]">
          {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total.toLocaleString()}
        </span>
        <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total}
          className="text-[10px] font-mono cursor-pointer disabled:opacity-40" style={{ background: 'none', border: 'none', color: '#4A4844' }}>
          NEXT →
        </button>
      </div>
    </Panel>
  )
}
