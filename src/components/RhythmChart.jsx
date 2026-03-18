const MAX_HEIGHT = 60
const BAR_WIDTH = 2
const BAR_GAP = 1

function sentenceColor(length) {
  if (length <= 8) return '#a8a29e'
  if (length <= 20) return '#78716c'
  return '#44403c'
}

export default function RhythmChart({ sentenceLengths }) {
  if (!sentenceLengths || sentenceLengths.length === 0) return null

  const maxLen = Math.max(...sentenceLengths)
  const totalWidth = sentenceLengths.length * (BAR_WIDTH + BAR_GAP)

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={MAX_HEIGHT}
          style={{ display: 'block', minWidth: '100%' }}
        >
          {sentenceLengths.map((length, i) => {
            const barHeight = Math.max(2, Math.round((length / maxLen) * MAX_HEIGHT))
            const x = i * (BAR_WIDTH + BAR_GAP)
            return (
              <rect
                key={i}
                x={x}
                y={MAX_HEIGHT - barHeight}
                width={BAR_WIDTH}
                height={barHeight}
                fill={sentenceColor(length)}
              />
            )
          })}
        </svg>
      </div>
      <div className="flex gap-4 mt-3">
        {[
          { color: '#a8a29e', label: 'short (1–8 words)' },
          { color: '#78716c', label: 'medium (9–20)' },
          { color: '#44403c', label: 'long (21+)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-xs text-stone-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
