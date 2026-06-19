import { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'

interface ShellProps {
  children: ReactNode
  summary: Record<string, unknown> | null
  onRefetch: () => void
  isDemo?: boolean
}

const MOBILE_NAV = [
  { path: '/', label: 'Dashboard', icon: '▦' },
  { path: '/predict', label: 'Predict', icon: '◈' },
  { path: '/map', label: 'Map', icon: '⊕' },
  { path: '/similar', label: 'Similar', icon: '◎' },
  { path: '/about', label: 'About', icon: '◇' },
]

export function Shell({ children, summary, onRefetch, isDemo }: ShellProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen overflow-hidden gridsense-shell" style={{ background: '#EAE8E1' }}>
      {/* Desktop layout */}
      <div className="hidden md:grid h-full w-full" style={{
        gridTemplateRows: '36px 1fr 32px',
        gridTemplateColumns: '300px 1fr',
      }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <TopBar isDemo={isDemo} />
        </div>
        <Sidebar summary={summary} onRefetch={onRefetch} />
        <main className="overflow-y-auto bg-[#EAE8E1]">{children}</main>
        <div style={{ gridColumn: '1 / -1' }}>
          <StatusBar summary={summary} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden flex-col h-full w-full">
        <TopBar isDemo={isDemo} />
        <main className="flex-1 overflow-y-auto bg-[#EAE8E1] pb-14">{children}</main>
        <nav
          className="fixed bottom-0 left-0 right-0 flex border-t border-[#C8C5BC] bg-[#EAE8E1] z-[1000]"
          style={{ height: 56 }}
        >
          {MOBILE_NAV.map(item => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                style={{ color: active ? '#C84B2F' : '#9A9690', background: 'none', border: 'none' }}
              >
                <span className="font-mono text-[14px]">{item.icon}</span>
                <span className="text-[8px] font-mono uppercase tracking-[0.08em]">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
