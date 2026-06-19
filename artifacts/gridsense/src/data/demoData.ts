export const DEMO_SUMMARY = {
  total_events: 8173,
  high_priority: 1967,
  road_closures: 676,
  planned: 454,
  median_duration: 64,
  corridors: 22,
  zones: 12,
}

export const DEMO_HOTSPOTS = [
  { latitude: 12.9352, longitude: 77.4892, event_cause: 'public_event', corridor: 'Mysore Road', zone: 'West Zone 1', duration_mins: 187, police_station: 'Kengeri', start_datetime: '2024-05-15T19:00:00Z' },
  { latitude: 12.9857, longitude: 77.6388, event_cause: 'construction', corridor: 'ORR East 1', zone: 'East Zone 1', duration_mins: 420, police_station: 'Whitefield', start_datetime: '2024-05-14T09:00:00Z' },
  { latitude: 13.0199, longitude: 77.5979, event_cause: 'vip_movement', corridor: 'Bellary Road 1', zone: 'North Zone 1', duration_mins: 95, police_station: 'Hebbal', start_datetime: '2024-05-13T15:00:00Z' },
  { latitude: 12.9141, longitude: 77.6383, event_cause: 'accident', corridor: 'Hosur Road', zone: 'South Zone 1', duration_mins: 45, police_station: 'Electronic City', start_datetime: '2024-05-12T08:30:00Z' },
  { latitude: 13.0297, longitude: 77.5507, event_cause: 'water_logging', corridor: 'Tumkur Road', zone: 'West Zone 2', duration_mins: 320, police_station: 'Peenya', start_datetime: '2024-05-11T11:00:00Z' },
  { latitude: 12.9634, longitude: 77.5855, event_cause: 'tree_fall', corridor: 'CBD 2', zone: 'Central', duration_mins: 28, police_station: 'Cubbon Park', start_datetime: '2024-05-10T14:20:00Z' },
  { latitude: 12.9719, longitude: 77.7499, event_cause: 'construction', corridor: 'Old Madras Road', zone: 'East Zone 2', duration_mins: 580, police_station: 'KR Puram', start_datetime: '2024-05-09T07:00:00Z' },
  { latitude: 12.8959, longitude: 77.5763, event_cause: 'road_conditions', corridor: 'Bannerghatta Road', zone: 'South Zone 2', duration_mins: 72, police_station: 'Bannerghatta', start_datetime: '2024-05-08T16:45:00Z' },
  { latitude: 13.0389, longitude: 77.6203, event_cause: 'congestion', corridor: 'ORR North 1', zone: 'North Zone 2', duration_mins: 110, police_station: 'Yelahanka', start_datetime: '2024-05-07T18:00:00Z' },
  { latitude: 12.9542, longitude: 77.4998, event_cause: 'pot_holes', corridor: 'Mysore Road', zone: 'West Zone 1', duration_mins: 15, police_station: 'Kengeri', start_datetime: '2024-05-06T12:30:00Z' },
  { latitude: 12.9916, longitude: 77.5842, event_cause: 'accident', corridor: 'Bellary Road 2', zone: 'North Zone 1', duration_mins: 195, police_station: 'Mekhri Circle', start_datetime: '2024-05-05T07:45:00Z' },
  { latitude: 12.9242, longitude: 77.6763, event_cause: 'vehicle_breakdown', corridor: 'ORR East 2', zone: 'East Zone 2', duration_mins: 22, police_station: 'Marathahalli', start_datetime: '2024-05-04T20:15:00Z' },
]

export const DEMO_ANALYTICS = {
  events_by_cause: [
    { cause: 'construction', count: 2241 },
    { cause: 'road_conditions', count: 1668 },
    { cause: 'water_logging', count: 1203 },
    { cause: 'pot_holes', count: 1039 },
    { cause: 'accident', count: 793 },
    { cause: 'tree_fall', count: 601 },
    { cause: 'vehicle_breakdown', count: 438 },
    { cause: 'congestion', count: 300 },
  ],
  events_by_hour: [
    { hour: 0, count: 12 }, { hour: 1, count: 8 }, { hour: 2, count: 6 }, { hour: 3, count: 4 },
    { hour: 4, count: 5 }, { hour: 5, count: 9 }, { hour: 6, count: 28 }, { hour: 7, count: 62 },
    { hour: 8, count: 94 }, { hour: 9, count: 88 }, { hour: 10, count: 71 }, { hour: 11, count: 58 },
    { hour: 12, count: 52 }, { hour: 13, count: 61 }, { hour: 14, count: 67 }, { hour: 15, count: 74 },
    { hour: 16, count: 81 }, { hour: 17, count: 98 }, { hour: 18, count: 112 }, { hour: 19, count: 89 },
    { hour: 20, count: 64 }, { hour: 21, count: 42 }, { hour: 22, count: 28 }, { hour: 23, count: 18 },
  ],
  congestion_by_corridor: [
    { corridor: 'Mysore Road', high_rate: 0.52 },
    { corridor: 'ORR East 1', high_rate: 0.48 },
    { corridor: 'Bellary Road 1', high_rate: 0.41 },
    { corridor: 'CBD 2', high_rate: 0.38 },
    { corridor: 'Hosur Road', high_rate: 0.35 },
    { corridor: 'ORR North 1', high_rate: 0.29 },
    { corridor: 'Bannerghatta Road', high_rate: 0.22 },
    { corridor: 'Old Madras Road', high_rate: 0.18 },
  ],
  monthly_trend: [
    { ym: '2024-01', count: 1420 },
    { ym: '2024-02', count: 1380 },
    { ym: '2024-03', count: 1750 },
    { ym: '2024-04', count: 1890 },
    { ym: '2024-05', count: 1733 },
  ],
  median_duration: [
    { event_cause: 'construction', median_mins: 312 },
    { event_cause: 'water_logging', median_mins: 187 },
    { event_cause: 'vip_movement', median_mins: 95 },
    { event_cause: 'accident', median_mins: 67 },
    { event_cause: 'road_conditions', median_mins: 54 },
    { event_cause: 'tree_fall', median_mins: 38 },
  ],
  hotspots: DEMO_HOTSPOTS,
}

export const JUDGE_SCENARIO = {
  event_cause: 'public_event',
  event_type: 'planned',
  corridor: 'Mysore Road',
  zone: 'West Zone 1',
  police_station: 'Kengeri',
  priority: 'High',
  requires_road_closure: true,
  latitude: 12.9352,
  longitude: 77.4892,
  veh_type: 'none',
}

export function getTodayDatetime(hour: number, minute: number) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(hour).padStart(2, '0')
  const min = String(minute).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}
