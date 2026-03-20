import { memo, useState, useEffect } from 'react'

function sentenceColor(length) {
  if (length <= 8) return '#60a5fa'
  if (length <= 20) return '#818cf8'
  return '#f97316'
}

export default memo(function RhythmChart({ sentenceLengths, sentenceSentiment, sentences, onExpand, isExpanded }) {
  const [tooltip, setTooltip] = useState(null)

  if (!sentenceLengths || sentenceLengths.length === 0) return null

  const MAX_HEIGHT = isExpanded ? 240 : 60
  const BAR_WIDTH = isExpanded ? 6 : 2
  const BAR_GAP = isExpanded ? 2 : 1

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
          onMouseLeave={() => setTooltip(null)}
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
                onMouseMove={(e) => {
                  if (!isExpanded) return
                  setTooltip({
                    index: i,
                    x: e.clientX,
                    y: e.clientY
                  })
                }}
                className={isExpanded ? "cursor-crosshair hover:fill-stone-900 dark:hover:fill-stone-100 transition-colors" : ""}
              />
            )
          })}
          {sentenceSentiment && sentenceSentiment.length > 0 && (
            <polyline
              points={sentimentPoints}
              fill="none"
              stroke="#eab308"
              strokeWidth={isExpanded ? "3" : "2"}
              style={{ pointerEvents: 'none' }}
              className={`drop-shadow-md ${isExpanded ? 'opacity-90' : 'opacity-80'}`}
            />
          )}
        </svg>
      </div>

      {isExpanded && tooltip && (
        <div
          className="fixed pointer-events-none z-[100] p-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur shadow-2xl border border-stone-200 dark:border-stone-700 rounded-xl transition-opacity animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: Math.min(tooltip.x + 20, window.innerWidth - 320),
            top: Math.min(tooltip.y + 20, window.innerHeight - 150),
            width: '300px'
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Sentence {tooltip.index + 1}</span>
            <div className="flex gap-2">
              <span className="text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded">{sentenceLengths[tooltip.index]} words</span>
              {sentenceSentiment && sentenceSentiment[tooltip.index] !== undefined && (
                <span className="text-[10px] font-medium bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-1.5 py-0.5 rounded">Sent: {sentenceSentiment[tooltip.index].toFixed(1)}</span>
              )}
            </div>
          </div>
          {sentences && sentences[tooltip.index] ? (
            <p className="text-sm text-stone-800 dark:text-stone-200 italic leading-relaxed">"{sentences[tooltip.index]}"</p>
          ) : (
            <p className="text-xs text-stone-500 italic">Text preview unavailable. Reload your manuscript file to index sentence strings.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
        <div className="flex flex-wrap gap-4">
          {[
            { color: '#60a5fa', label: 'short (1–8 words)' },
            { color: '#818cf8', label: 'medium (9–20)' },
            { color: '#f97316', label: 'long (21+)' },
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
        {onExpand && (
          <button
            onClick={() => onExpand({ type: 'rhythm', title: 'Chapter Rhythm', data: { sentenceLengths, sentenceSentiment, sentences } })}
            className="text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors ml-auto flex items-center gap-1 shrink-0"
          >
            Expand view
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l5.293 5.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M13 18a1 1 0 01-1-1v-4a1 1 0 112 0v1.586l5.293-5.293a1 1 0 111.414 1.414L15.414 16H17a1 1 0 110 2h-4z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
})
