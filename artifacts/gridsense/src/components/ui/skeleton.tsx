import type { CSSProperties } from 'react'

interface SkeletonProps {
  height?: number | string
  width?: number | string
  lines?: number
  className?: string
  style?: CSSProperties
}

export function Skeleton({ height = 20, width = '100%', lines, className = '', style }: SkeletonProps) {
  const shimmerStyle: CSSProperties = {
    background: 'linear-gradient(90deg, #D4D1C8 25%, #EAE8E1 50%, #D4D1C8 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    ...style,
  }

  if (lines && lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ ...shimmerStyle, height, width }} />
        ))}
      </div>
    )
  }

  return <div className={className} style={{ ...shimmerStyle, height, width }} />
}
