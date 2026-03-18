import { useState } from 'react'

export default function ChapterSplitter({ paragraphs, onConfirm, onSkip }) {
  const [boundaries, setBoundaries] = useState(new Set())

  function toggleBoundary(index) {
    if (index === 0) return
    setBoundaries(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-stone-800 font-medium">No chapter headings detected.</p>
          <p className="text-stone-500 text-sm mt-0.5">
            Click a paragraph to mark it as the start of a new chapter, or skip to treat the whole manuscript as one chapter.
          </p>
        </div>
        <div className="flex gap-3 ml-8 shrink-0">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-stone-600 border border-stone-300 rounded hover:bg-stone-50 transition-colors"
          >
            Skip — use as one chapter
          </button>
          <button
            onClick={() => onConfirm([...boundaries])}
            className="px-4 py-2 text-sm text-white bg-stone-800 rounded hover:bg-stone-700 transition-colors"
          >
            Confirm {boundaries.size > 0 ? `(${boundaries.size + 1} chapters)` : ''}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-8 py-8 space-y-1">
        {paragraphs.map((paragraph, i) => (
          <div key={i} className="group relative">
            {boundaries.has(i) && (
              <div className="flex items-center gap-2 mb-1 mt-3">
                <div className="flex-1 h-px bg-stone-400" />
                <span className="text-xs text-stone-500 shrink-0">chapter break</span>
                <div className="flex-1 h-px bg-stone-400" />
              </div>
            )}
            <p
              onClick={() => toggleBoundary(i)}
              className={`font-serif text-stone-700 leading-relaxed py-1 px-2 rounded cursor-pointer transition-colors text-sm ${
                boundaries.has(i)
                  ? 'bg-stone-100'
                  : 'hover:bg-stone-50 group-hover:text-stone-900'
              }`}
            >
              {paragraph}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
