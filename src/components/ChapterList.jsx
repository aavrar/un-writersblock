export default function ChapterList({ chapters, selectedIndex, onSelect, onReset }) {
  const maxWords = Math.max(...chapters.map(c => c.stats.wordCount), 1)
  const totalWords = chapters.reduce((sum, c) => sum + c.stats.wordCount, 0)

  return (
    <aside className="w-64 shrink-0 border-r border-stone-200 bg-white flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="px-4 py-4 border-b border-stone-200">
        <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Chapters</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {chapters.map((chapter, i) => {
          const barWidth = Math.max(4, Math.round((chapter.stats.wordCount / maxWords) * 100))
          const isSelected = selectedIndex === i

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`relative w-full text-left px-4 py-2.5 text-sm transition-colors overflow-hidden ${
                isSelected ? 'text-stone-900 font-medium' : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 ${isSelected ? 'bg-stone-100' : 'bg-stone-50'}`}
                style={{ width: `${barWidth}%` }}
              />
              <span className="relative flex items-center gap-2">
                <span className="text-stone-400 text-xs w-5 shrink-0">{i + 1}</span>
                <span className="truncate">{chapter.title}</span>
              </span>
            </button>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-stone-200 space-y-1">
        <div className="flex justify-between text-xs text-stone-400">
          <span>{chapters.length} chapters</span>
          <span>{totalWords.toLocaleString()} words</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Load different manuscript
        </button>
      </div>
    </aside>
  )
}
