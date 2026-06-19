import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { Predict } from './pages/Predict'
import { Map } from './pages/Map'
import { Similarity } from './pages/Similarity'
import { Feedback } from './pages/Feedback'
import { About } from './pages/About'
import { useAnalytics } from './hooks/useAnalytics'
import { ToastProvider } from './context/ToastContext'
import { AlertFeedProvider } from './context/AlertFeedContext'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/map" element={<Map />} />
        <Route path="/similar" element={<Similarity />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  const { summary, refetch, isDemo } = useAnalytics()
  return (
    <Shell summary={summary} onRefetch={refetch} isDemo={isDemo}>
      <AnimatedRoutes />
    </Shell>
  )
}

export default function App() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || ''
  return (
    <BrowserRouter basename={base}>
      <ToastProvider>
        <AlertFeedProvider>
          <AppShell />
        </AlertFeedProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
