import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { Predict } from './pages/Predict'
import { Similarity } from './pages/Similarity'
import { Feedback } from './pages/Feedback'
import { useAnalytics } from './hooks/useAnalytics'
import { ToastProvider } from './context/ToastContext'
import { AlertFeedProvider } from './context/AlertFeedContext'

const Map = lazy(() => import('./pages/Map').then(m => ({ default: m.Map })))
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-[13px] font-mono text-[#9A9690] uppercase tracking-[0.14em]">Loading...</div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/map" element={<Suspense fallback={<LoadingFallback />}><Map /></Suspense>} />
        <Route path="/similar" element={<Similarity />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
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
