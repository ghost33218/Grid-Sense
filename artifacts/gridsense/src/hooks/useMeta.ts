import { useState, useEffect } from 'react'
import { getCorridors, getZones, getCauses } from '../api/client'

export function useMeta() {
  const [corridors, setCorridors] = useState<string[]>([])
  const [zones, setZones] = useState<string[]>([])
  const [causes, setCauses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCorridors(), getZones(), getCauses()]).then(([c, z, ca]) => {
      if (c.success && c.data?.corridors) setCorridors(c.data.corridors)
      if (z.success && z.data?.zones) setZones(z.data.zones)
      if (ca.success && ca.data?.causes) setCauses(ca.data.causes)
      setLoading(false)
    })
  }, [])

  return { corridors, zones, causes, loading }
}
