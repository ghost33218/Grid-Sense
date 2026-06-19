import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface AlertEntry {
  id: number
  time: string
  message: string
}

interface AlertFeedContextValue {
  entries: AlertEntry[]
  addAlert: (message: string) => void
}

const AlertFeedContext = createContext<AlertFeedContextValue>({ entries: [], addAlert: () => {} })

let alertId = 0

function formatTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
}

export function AlertFeedProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AlertEntry[]>([])

  const addAlert = useCallback((message: string) => {
    const id = ++alertId
    setEntries(prev => [{ id, time: formatTime(), message }, ...prev].slice(0, 8))
  }, [])

  return (
    <AlertFeedContext.Provider value={{ entries, addAlert }}>
      {children}
    </AlertFeedContext.Provider>
  )
}

export function useAlertFeed() {
  return useContext(AlertFeedContext)
}
