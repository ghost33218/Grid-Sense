import { useState, useEffect } from 'react'
import { getCorridors, getZones, getCauses } from '../api/client'

export function useMeta() {
  const [corridors, setCorridors] = useState<string[]>([])
  const [zones, setZones] = useState<string[]>([])
  const [causes, setCauses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCorridors(), getZones(), getCauses()]).then(([c, z, ca]) => {
      if (c?.corridors) setCorridors(c.corridors)
      if (z?.zones) setZones(z.zones)
      if (ca?.causes) setCauses(ca.causes)
      setLoading(false)
    })
  }, [])

  return { corridors, zones, causes, loading }
}
