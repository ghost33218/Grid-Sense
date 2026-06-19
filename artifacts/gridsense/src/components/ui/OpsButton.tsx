import { ReactNode } from 'react'

interface OpsButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  onClick?: () => void
  fullWidth?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function OpsButton({ variant = 'primary', children, onClick, fullWidth, loading, type = 'button', disabled }: OpsButtonProps) {
  const base = `inline-flex items-center justify-between gap-2 px-5 py-3.5 text-[11px] font-mono uppercase tracking-[0.12em] transition-all duration-150 cursor-pointer border-none outline-none`
  const full = fullWidth ? 'w-full' : ''

  const styles = {
    primary: 'bg-[#C84B2F] text-[#EAE8E1] hover:opacity-90 disabled:opacity-50',
    secondary: 'bg-transparent border border-[#1A1A18] text-[#1A1A18] hover:bg-[#1A1A1810]',
    ghost: 'bg-transparent border border-[#C8C5BC] text-[#9A9690] hover:border-[#1A1A18] hover:text-[#1A1A18]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${full} ${styles[variant]}`}
      style={{ borderRadius: 0, border: variant === 'primary' ? 'none' : undefined }}
    >
      {loading ? (
        <>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-[#EAE8E1] border-t-transparent rounded-full animate-spin" />
            ANALYSING...
          </span>
        </>
      ) : children}
    </button>
  )
}
