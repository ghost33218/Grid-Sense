import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import { getHotspots } from '../api/client'
import { Skeleton } from '../components/ui/skeleton'
import { CornerMarks } from '../components/ui/CornerMarks'
import { Badge } from '../components/ui/badge'
import { DataRow } from '../components/ui/DataRow'
import { DEMO_HOTSPOTS } from '../data/demoData'
import { formatDuration } from '../utils/predictUtils'
import 'leaflet/dist/leaflet.css'

type Hotspot = {
  event_cause?: string
  cause?: string
  corridor?: string
  zone?: string
  police_station?: string
  start_datetime?: string
  duration_mins?: number
  latitude?: number
  longitude?: number
  lat?: number
  lng?: number
}

type Filter = 'ALL' | 'HIGH' | 'PLANNED'

function getCoords(h: Hotspot): [number, number] | null {
  const lat = h.latitude ?? h.lat
  const lng = h.longitude ?? h.lng
  if (lat == null || lng == null) return null
  return [lat, lng]
}

function getLevel(h: Hotspot): 'High' | 'Medium' | 'Low' {
  const d = h.duration_mins || 0
  if (d > 180) return 'High'
  if (d > 37) return 'Medium'
  return 'Low'
}

function getMarkerStyle(level: 'High' | 'Medium' | 'Low') {
  if (level === 'High') return { color: '#C84B2F', radius: 12 }
  if (level === 'Medium') return { color: '#B8820A', radius: 8 }
  return { color: '#2D6A4F', radius: 5 }
}

function FlyToMarker({ coords, open }: { coords: [number, number] | null; open: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (coords && open) map.flyTo(coords, 14, { duration: 1 })
  }, [coords, open, map])
  return null
}

export function Map() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [flyCoords, setFlyCoords] = useState<[number, number] | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    getHotspots().then(res => {
      if (res.success && res.data?.hotspots?.length) {
        setHotspots(res.data.hotspots)
      } else {
        setHotspots(DEMO_HOTSPOTS.map(h => ({
          ...h,
          cause: h.event_cause,
          lat: h.latitude,
          lng: h.longitude,
        })))
      }
      setLoading(false)
    })
  }, [])

  const corridorCounts = hotspots.reduce<Record<string, number>>((acc, h) => {
    const c = String(h.corridor || '')
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const topCorridorName = Object.entries(corridorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mysore Road'
  const topCorridorHigh = hotspots.filter(h => h.corridor === topCorridorName && getLevel(h) === 'High').length
  const highRate = Math.round((topCorridorHigh / Math.max(hotspots.filter(h => h.corridor === topCorridorName).length, 1)) * 100)

  const filtered = hotspots.filter(h => {
    const level = getLevel(h)
    const cause = String(h.event_cause || h.cause || '').toLowerCase()
    if (filter === 'HIGH') return level === 'High'
    if (filter === 'PLANNED') return cause.includes('vip') || cause.includes('procession') || cause.includes('public')
    return true
  })

  const handleListClick = (hs: Hotspot, idx: number) => {
    const coords = getCoords(hs)
    setSelectedIdx(idx)
    if (coords) setFlyCoords(coords)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative w-full h-full"
    >
      <div className="absolute top-0 left-0 bottom-0 flex flex-col bg-[#EAE8E1] border-r border-[#C8C5BC] z-[1000] overflow-hidden w-full md:w-[280px] hidden md:flex">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#C8C5BC]">
          <span className="text-[10px] font-mono uppercase text-[#9A9690]">INCIDENT HOTSPOTS</span>
          <span className="text-[10px] font-mono text-[#C84B2F]">{filtered.length} shown</span>
        </div>

        <div className="px-4 py-3 border-b border-[#C8C5BC] bg-[#C84B2F08]" style={{ borderLeft: '4px solid #C84B2F' }}>
          <div className="text-[8px] font-mono uppercase tracking-[0.14em] text-[#C84B2F] mb-1">TOP RISK CORRIDOR</div>
          <div className="text-[14px] font-mono font-bold text-[#1A1A18]">{topCorridorName}</div>
          <div className="text-[9px] font-mono text-[#9A9690] mt-0.5">{highRate}% high-severity markers</div>
        </div>

        <div className="flex gap-2 px-4 py-3 border-b border-[#C8C5BC]">
          {(['ALL', 'HIGH', 'PLANNED'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-[10px] font-mono border border-[#C8C5BC] px-3 py-1.5 cursor-pointer"
              style={{ background: filter === f ? '#1A1A18' : 'transparent', color: filter === f ? '#EAE8E1' : '#9A9690', borderColor: filter === f ? '#1A1A18' : '#C8C5BC' }}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-b border-[#C8C5BC]">
          {[
            { color: '#C84B2F', label: 'HIGH (r=12)' },
            { color: '#B8820A', label: 'MED (r=8)' },
            { color: '#2D6A4F', label: 'LOW (r=5)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[8px] font-mono text-[#9A9690]">{l.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-4"><Skeleton lines={8} height={50} /></div> :
            filtered.map((hs, i) => {
              const level = getLevel(hs)
              const style = getMarkerStyle(level)
              const cause = String(hs.event_cause || hs.cause || '').replace(/_/g, ' ')
              const isSelected = selectedIdx === i
              return (
                <div key={i} onClick={() => handleListClick(hs, i)}
                  className="relative px-4 py-2.5 border-b border-[#C8C5BC] cursor-pointer hover:bg-[#1A1A1804]"
                  style={{ borderLeft: `3px solid ${style.color}` }}>
                  {isSelected && <CornerMarks />}
                  <div className="text-[11px] font-mono font-bold text-[#1A1A18] uppercase">{cause}</div>
                  <div className="text-[10px] font-mono text-[#6B6860] mt-0.5">{String(hs.corridor || '—')}</div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge level={level} />
                    <span className="text-[9px] font-mono text-[#B8820A]">{formatDuration(hs.duration_mins)}</span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      <div className="absolute inset-0 md:left-[280px] z-0">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#E2E0D8] gap-3">
            <Skeleton height={40} width={40} />
            <div className="text-[11px] font-mono text-[#9A9690] uppercase">Loading Hotspots...</div>
          </div>
        ) : (
          <MapContainer center={[12.9716, 77.5946]} zoom={11} zoomControl={false} style={{ width: '100%', height: '100%' }}
            ref={m => { if (m) mapRef.current = m }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO' />
            <FlyToMarker coords={flyCoords} open={selectedIdx !== null} />
            {filtered.map((hs, i) => {
              const coords = getCoords(hs)
              if (!coords) return null
              const level = getLevel(hs)
              const style = getMarkerStyle(level)
              const cause = String(hs.event_cause || hs.cause || '')
              return (
                <CircleMarker key={i} center={coords} radius={style.radius}
                  pathOptions={{ color: style.color, fillColor: style.color, fillOpacity: 0.8, weight: 2 }}
                  eventHandlers={{ click: () => setSelectedIdx(i) }}>
                  <Popup className="ops-popup">
                    <div className="p-3 min-w-[200px]">
                      <div className="text-[11px] font-mono font-bold uppercase text-[#1A1A18] mb-2">
                        {cause.replace(/_/g, ' ')}
                      </div>
                      <DataRow label="Corridor" value={String(hs.corridor || '—')} />
                      <DataRow label="Zone" value={String(hs.zone || '—')} />
                      <DataRow label="Duration" value={formatDuration(hs.duration_mins)} />
                      <DataRow label="Date" value={hs.start_datetime ? new Date(hs.start_datetime).toLocaleDateString('en-IN') : '—'} />
                      <div className="mt-2"><Badge level={level} /></div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        )}
      </div>
    </motion.div>
  )
}
