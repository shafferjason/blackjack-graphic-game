import './Card.css'

const SUIT_SYMBOLS = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
}

const SUIT_COLORS = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
}

const SUIT_ACCENTS = {
  hearts: { primary: '#c41e3a', secondary: '#e8485e', tertiary: '#f9dce1' },
  diamonds: { primary: '#c41e3a', secondary: '#e8485e', tertiary: '#f9dce1' },
  clubs: { primary: '#1a1a2e', secondary: '#3a3a5e', tertiary: '#d8d8e8' },
  spades: { primary: '#1a1a2e', secondary: '#3a3a5e', tertiary: '#d8d8e8' },
}

function JackSVG({ suit }) {
  const c = SUIT_ACCENTS[suit]
  return (
    <svg viewBox="0 0 80 100" className="face-svg">
      {/* Background diamond frame */}
      <polygon points="40,4 72,50 40,96 8,50" fill="none" stroke={c.primary} strokeWidth="1" opacity="0.2" />
      {/* Hat */}
      <path d="M24,32 L40,18 L56,32 L52,34 L40,24 L28,34 Z" fill={c.primary} />
      <circle cx="40" cy="18" r="3" fill={c.secondary} />
      {/* Head */}
      <ellipse cx="40" cy="42" rx="12" ry="13" fill={c.tertiary} stroke={c.primary} strokeWidth="1.2" />
      {/* Eyes */}
      <ellipse cx="35" cy="40" rx="2" ry="2.5" fill={c.primary} />
      <ellipse cx="45" cy="40" rx="2" ry="2.5" fill={c.primary} />
      <circle cx="35.5" cy="39.5" r="0.7" fill="#fff" />
      <circle cx="45.5" cy="39.5" r="0.7" fill="#fff" />
      {/* Slight smile */}
      <path d="M35,47 Q40,51 45,47" fill="none" stroke={c.primary} strokeWidth="1" strokeLinecap="round" />
      {/* Collar */}
      <path d="M30,54 L40,60 L50,54" fill="none" stroke={c.primary} strokeWidth="1.5" />
      <path d="M30,54 L28,62 L40,60 L52,62 L50,54" fill={c.primary} opacity="0.15" />
      {/* Body / tunic */}
      <path d="M26,62 L24,88 L56,88 L54,62 Z" fill={c.primary} opacity="0.12" stroke={c.primary} strokeWidth="1" />
      {/* Decorative belt */}
      <rect x="28" y="72" width="24" height="3" rx="1.5" fill={c.secondary} opacity="0.5" />
      {/* Sword */}
      <line x1="60" y1="36" x2="62" y2="80" stroke={c.secondary} strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="54" x2="66" y2="52" stroke={c.secondary} strokeWidth="2" strokeLinecap="round" />
      <circle cx="61" cy="53" r="2" fill={c.primary} opacity="0.4" />
      {/* Suit symbol */}
      <text x="40" y="92" textAnchor="middle" fontSize="10" fill={c.primary} fontFamily="serif">{SUIT_SYMBOLS[suit]}</text>
    </svg>
  )
}

function QueenSVG({ suit }) {
  const c = SUIT_ACCENTS[suit]
  return (
    <svg viewBox="0 0 80 100" className="face-svg">
      {/* Ornamental arch */}
      <ellipse cx="40" cy="50" rx="34" ry="44" fill="none" stroke={c.primary} strokeWidth="0.8" opacity="0.12" />
      {/* Crown */}
      <path d="M26,30 L28,18 L32,26 L36,14 L40,24 L44,14 L48,26 L52,18 L54,30 Z" fill={c.secondary} stroke={c.primary} strokeWidth="0.8" />
      <circle cx="36" cy="16" r="2" fill={c.tertiary} stroke={c.primary} strokeWidth="0.5" />
      <circle cx="40" cy="22" r="2" fill={c.tertiary} stroke={c.primary} strokeWidth="0.5" />
      <circle cx="44" cy="16" r="2" fill={c.tertiary} stroke={c.primary} strokeWidth="0.5" />
      {/* Head */}
      <ellipse cx="40" cy="42" rx="12" ry="13" fill={c.tertiary} stroke={c.primary} strokeWidth="1.2" />
      {/* Hair flowing */}
      <path d="M28,38 Q24,50 26,60" fill="none" stroke={c.primary} strokeWidth="1.5" opacity="0.3" />
      <path d="M52,38 Q56,50 54,60" fill="none" stroke={c.primary} strokeWidth="1.5" opacity="0.3" />
      {/* Eyes */}
      <ellipse cx="35" cy="40" rx="2.2" ry="2.8" fill={c.primary} />
      <ellipse cx="45" cy="40" rx="2.2" ry="2.8" fill={c.primary} />
      <circle cx="35.7" cy="39.3" r="0.8" fill="#fff" />
      <circle cx="45.7" cy="39.3" r="0.8" fill="#fff" />
      {/* Lashes */}
      <path d="M32,37 L33,38" stroke={c.primary} strokeWidth="0.6" />
      <path d="M48,37 L47,38" stroke={c.primary} strokeWidth="0.6" />
      {/* Lips */}
      <path d="M36,47 Q40,52 44,47" fill={c.secondary} opacity="0.6" />
      {/* Necklace */}
      <path d="M30,55 Q40,62 50,55" fill="none" stroke={c.secondary} strokeWidth="1" />
      <circle cx="40" cy="60" r="2.5" fill={c.secondary} opacity="0.5" />
      {/* Dress bodice */}
      <path d="M28,58 Q26,72 24,90 L56,90 Q54,72 52,58 Q40,66 28,58 Z" fill={c.primary} opacity="0.12" stroke={c.primary} strokeWidth="1" />
      {/* Dress decoration - V pattern */}
      <path d="M34,68 L40,78 L46,68" fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.5" />
      <path d="M36,74 L40,82 L44,74" fill="none" stroke={c.secondary} strokeWidth="0.8" opacity="0.35" />
      {/* Suit symbol */}
      <text x="40" y="96" textAnchor="middle" fontSize="10" fill={c.primary} fontFamily="serif">{SUIT_SYMBOLS[suit]}</text>
    </svg>
  )
}

function KingSVG({ suit }) {
  const c = SUIT_ACCENTS[suit]
  return (
    <svg viewBox="0 0 80 100" className="face-svg">
      {/* Background cross */}
      <line x1="40" y1="6" x2="40" y2="94" stroke={c.primary} strokeWidth="0.8" opacity="0.08" />
      <line x1="10" y1="50" x2="70" y2="50" stroke={c.primary} strokeWidth="0.8" opacity="0.08" />
      {/* Crown - grander than Queen's */}
      <path d="M22,30 L24,12 L32,24 L40,8 L48,24 L56,12 L58,30 Z" fill={c.secondary} stroke={c.primary} strokeWidth="1" />
      <rect x="24" y="28" width="32" height="5" rx="1" fill={c.primary} opacity="0.3" />
      <circle cx="40" cy="10" r="3" fill={c.tertiary} stroke={c.primary} strokeWidth="0.8" />
      <circle cx="32" cy="22" r="2" fill={c.tertiary} stroke={c.primary} strokeWidth="0.5" />
      <circle cx="48" cy="22" r="2" fill={c.tertiary} stroke={c.primary} strokeWidth="0.5" />
      {/* Cross on crown */}
      <line x1="40" y1="5" x2="40" y2="13" stroke={c.primary} strokeWidth="1.5" />
      <line x1="37" y1="8" x2="43" y2="8" stroke={c.primary} strokeWidth="1.5" />
      {/* Head */}
      <ellipse cx="40" cy="44" rx="13" ry="14" fill={c.tertiary} stroke={c.primary} strokeWidth="1.2" />
      {/* Beard */}
      <path d="M29,48 Q32,60 40,64 Q48,60 51,48" fill={c.primary} opacity="0.12" />
      <path d="M30,49 Q33,58 40,62 Q47,58 50,49" fill="none" stroke={c.primary} strokeWidth="0.8" opacity="0.3" />
      {/* Eyes - more stern */}
      <line x1="33" y1="41" x2="38" y2="41" stroke={c.primary} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="41" x2="47" y2="41" stroke={c.primary} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="35.5" cy="41" r="0.6" fill="#fff" />
      <circle cx="44.5" cy="41" r="0.6" fill="#fff" />
      {/* Eyebrows */}
      <path d="M32,38 L38,37" stroke={c.primary} strokeWidth="1" strokeLinecap="round" />
      <path d="M42,37 L48,38" stroke={c.primary} strokeWidth="1" strokeLinecap="round" />
      {/* Mouth in beard */}
      <line x1="37" y1="50" x2="43" y2="50" stroke={c.secondary} strokeWidth="1" strokeLinecap="round" />
      {/* Robe / mantle */}
      <path d="M22,62 L18,92 L62,92 L58,62 Z" fill={c.primary} opacity="0.12" stroke={c.primary} strokeWidth="1" />
      {/* Ermine trim */}
      <path d="M24,64 L40,70 L56,64" fill="none" stroke={c.secondary} strokeWidth="2" />
      {/* Scepter */}
      <line x1="18" y1="40" x2="16" y2="86" stroke={c.secondary} strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="38" r="4" fill={c.secondary} opacity="0.4" stroke={c.primary} strokeWidth="0.8" />
      <circle cx="18" cy="38" r="1.5" fill={c.tertiary} />
      {/* Chest cross/medal */}
      <line x1="40" y1="72" x2="40" y2="84" stroke={c.secondary} strokeWidth="1.5" opacity="0.5" />
      <line x1="35" y1="78" x2="45" y2="78" stroke={c.secondary} strokeWidth="1.5" opacity="0.5" />
      {/* Suit symbol */}
      <text x="40" y="96" textAnchor="middle" fontSize="10" fill={c.primary} fontFamily="serif">{SUIT_SYMBOLS[suit]}</text>
    </svg>
  )
}

const FACE_COMPONENTS = {
  J: JackSVG,
  Q: QueenSVG,
  K: KingSVG,
}

function Card({ card, hidden, index }) {
  if (hidden) {
    return (
      <div className="card card-back" style={{ '--i': index }}>
        <div className="card-back-pattern">
          <div className="card-back-inner" />
        </div>
      </div>
    )
  }

  const symbol = SUIT_SYMBOLS[card.suit]
  const color = SUIT_COLORS[card.suit]
  const isFace = ['J', 'Q', 'K'].includes(card.rank)
  const FaceComponent = FACE_COMPONENTS[card.rank]

  return (
    <div className={`card card-face ${color} ${isFace ? 'face-card-type' : ''}`} style={{ '--i': index }}>
      <div className="card-corner top-left">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{symbol}</span>
      </div>
      <div className="card-center">
        {isFace ? (
          <div className="face-card">
            <FaceComponent suit={card.suit} />
          </div>
        ) : card.rank === 'A' ? (
          <span className="ace-suit">{symbol}</span>
        ) : (
          <div className={`pip-grid pips-${card.rank}`}>
            {Array.from({ length: parseInt(card.rank) || 1 }).map((_, i) => (
              <span key={i} className="pip">{symbol}</span>
            ))}
          </div>
        )}
      </div>
      <div className="card-corner bottom-right">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{symbol}</span>
      </div>
      <div className="card-mobile-badge">
        <span className="badge-rank">{card.rank}</span>
        <span className="badge-suit">{symbol}</span>
      </div>
    </div>
  )
}

export default Card
