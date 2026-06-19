export const SEVERITY_MAP: Record<string, number> = {
  public_event: 5, procession: 5, vip_movement: 5, protest: 4,
  construction: 4, accident: 4, water_logging: 3, tree_fall: 3,
}

export const NAIVE_BASELINE_MAX: Record<string, number> = {
  High: 28,
  Medium: 16,
  Low: 8,
}

export interface ContributingFactor {
  label: string
  weight: '+' | '++'
  detail: string
}

export function getContributingFactors(formData: Record<string, unknown>): ContributingFactor[] {
  const factors: ContributingFactor[] = []
  if (formData.event_type === 'planned')
    factors.push({ label: 'Planned Event', weight: '+', detail: 'Scheduled events show predictable congestion buildup' })
  const hour = formData.start_datetime ? new Date(String(formData.start_datetime)).getHours() : -1
  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21))
    factors.push({ label: 'Peak Hour Window', weight: '+', detail: `${hour}:00 falls within historical peak congestion hours` })
  if (formData.corridor && formData.corridor !== 'Non-corridor')
    factors.push({ label: 'Major Corridor', weight: '+', detail: `${formData.corridor} has elevated baseline traffic` })
  if (formData.requires_road_closure)
    factors.push({ label: 'Road Closure Required', weight: '++', detail: 'Closures force full rerouting — strongest predictor of HIGH class' })
  if (formData.priority === 'High')
    factors.push({ label: 'High Priority Classification', weight: '+', detail: 'Officer-assigned priority correlates with incident severity' })
  if ((SEVERITY_MAP[String(formData.event_cause)] || 2) >= 4)
    factors.push({ label: 'High-Severity Cause', weight: '+', detail: `${String(formData.event_cause).replace(/_/g, ' ')} historically causes longer disruptions` })
  return factors
}

export function getNaiveBaseline(level: string): number {
  return NAIVE_BASELINE_MAX[level] || NAIVE_BASELINE_MAX.High
}

export function formatDuration(mins: number | null | undefined): string {
  if (mins == null) return '—'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const PREDICT_SCENARIOS = [
  {
    label: 'Public Event – Mysore Road',
    form: {
      event_cause: 'public_event', corridor: 'Mysore Road', zone: 'West Zone 1',
      priority: 'High', event_type: 'planned', requires_road_closure: true,
      latitude: 12.9352, longitude: 77.4892, police_station: 'Kengeri',
      startHour: 19, startMin: 0,
    },
  },
  {
    label: 'VIP Movement – ORR East',
    form: {
      event_cause: 'vip_movement', corridor: 'ORR East 1', zone: 'East Zone 1',
      priority: 'High', event_type: 'planned', requires_road_closure: true,
      latitude: 12.9857, longitude: 77.6388, police_station: 'Whitefield',
      startHour: 15, startMin: 0,
    },
  },
  {
    label: 'Accident – Hosur Road',
    form: {
      event_cause: 'accident', corridor: 'Hosur Road', zone: 'South Zone 1',
      priority: 'High', event_type: 'unplanned', requires_road_closure: false,
      latitude: 12.9141, longitude: 77.6383, police_station: 'Electronic City',
      startHour: 8, startMin: 30,
    },
  },
  {
    label: 'Water Logging – Bellary Rd',
    form: {
      event_cause: 'water_logging', corridor: 'Bellary Road 1', zone: 'North Zone 1',
      priority: 'Low', event_type: 'unplanned', requires_road_closure: false,
      latitude: 13.0199, longitude: 77.5979, police_station: 'Hebbal',
      startHour: 10, startMin: 0,
    },
  },
  {
    label: 'Procession – CBD',
    form: {
      event_cause: 'procession', corridor: 'CBD 2', zone: 'Central',
      priority: 'High', event_type: 'planned', requires_road_closure: true,
      latitude: 12.9719, longitude: 77.5937, police_station: 'Cubbon Park',
      startHour: 17, startMin: 0,
    },
  },
]
