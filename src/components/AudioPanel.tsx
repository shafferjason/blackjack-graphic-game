import { useState, useRef, useEffect } from 'react'

interface AudioPanelProps {
  muted: boolean
  volume: number
  onToggleMute: () => void
  onSetVolume: (v: number) => void
}

export default function AudioPanel({ muted, volume, onToggleMute, onSetVolume }: AudioPanelProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const volumePct = Math.round(volume * 100)

  return (
    <div className="audio-panel-container" ref={panelRef}>
      <button
        className="sound-toggle"
        onClick={() => setOpen(!open)}
        title="Audio settings"
        aria-label="Audio settings"
        aria-expanded={open}
      >
        {muted ? '\u{1F507}' : volume > 0.5 ? '\u{1F50A}' : '\u{1F509}'}
      </button>

      {open && (
        <div className="audio-panel" role="region" aria-label="Audio Settings">
          <div className="audio-panel-header">Audio</div>

          <div className="audio-panel-row">
            <button
              className={`audio-mute-btn ${muted ? 'muted' : ''}`}
              onClick={onToggleMute}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              aria-pressed={muted}
            >
              {muted ? '\u{1F507}' : '\u{1F50A}'}
            </button>
            <div className="audio-slider-group">
              <label className="audio-slider-label" htmlFor="master-volume">
                Master Volume
              </label>
              <div className="audio-slider-row">
                <input
                  id="master-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volumePct}
                  onChange={e => onSetVolume(Number(e.target.value) / 100)}
                  className="audio-slider"
                  aria-label={`Volume ${volumePct}%`}
                />
                <span className="audio-volume-value">{volumePct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
