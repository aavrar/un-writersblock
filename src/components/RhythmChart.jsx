import { memo } from 'react'

const MAX_HEIGHT = 60
const BAR_WIDTH = 2
const BAR_GAP = 1

function sentenceColor(length) {
  if (length <= 8) return '#a8a29e'
  if (length <= 20) return '#78716c'
  return '#44403c'
}

export default memo(function RhythmChart({ sentenceLengths, sentenceSentiment }) {
  if (!sentenceLengths || sentenceLengths.length === 0) return null

  const maxLen = Math.max(...sentenceLengths)
  const totalWidth = sentenceLengths.length * (BAR_WIDTH + BAR_GAP)

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max)
  const sentimentPoints = sentenceSentiment?.map((score, i) => {
    const x = i * (BAR_WIDTH + BAR_GAP) + (BAR_WIDTH / 2)
    const capped = clamp(score, -2, 2)
    const y = (MAX_HEIGHT / 2) - (capped / 2) * (MAX_HEIGHT / 2)
    return `${x},${y}`
  }).join(' ')

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
          {sentenceSentiment && sentenceSentiment.length > 0 && (
            <polyline
              points={sentimentPoints}
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              className="opacity-80 drop-shadow-md"
            />
          )}
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
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-4 h-0.5 bg-yellow-500 rounded-sm shrink-0" />
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Emotional trend</span>
        </div>
      </div>
    </div>
  )
})
