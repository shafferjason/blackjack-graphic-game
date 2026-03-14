import { useMemo } from 'react'

/**
 * Subtle floating dust/light particles that add depth to the casino table.
 * Uses CSS-only animations for performance — no JS per frame.
 */
export default function AmbientParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 8 + (i * 7.5) % 84,
      top: 10 + (i * 13) % 80,
      size: 1.5 + (i % 3) * 0.8,
      duration: 8 + (i % 5) * 3,
      delay: (i * 1.3) % 6,
      opacity: 0.04 + (i % 4) * 0.015,
    }))
  }, [])

  return (
    <div className="ambient-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="ambient-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}
