import { memo } from 'react'
import GoalTracker from './GoalTracker'

export default memo(function ChapterList({ chapters, selectedIndex, onSelect, onReset, projectGoal, onUpdateProjectGoal }) {
  const maxWords = Math.max(...chapters.map(c => c.stats.wordCount), 1)
  const totalWords = chapters.reduce((sum, c) => sum + c.stats.wordCount, 0)

  return (
    <aside className="w-64 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-screen sticky top-0 overflow-hidden transition-colors">
      <div className="px-4 py-4 border-b border-stone-200 dark:border-stone-800">
        <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-medium">Chapters</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {chapters.map((chapter, i) => {
          const barWidth = Math.max(4, Math.round((chapter.stats.wordCount / maxWords) * 100))
          const isSelected = selectedIndex === i

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`relative w-full text-left px-4 py-2.5 text-sm transition-colors overflow-hidden ${isSelected ? 'text-stone-900 dark:text-stone-100 font-medium' : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
            >
              <div
                className={`absolute inset-y-0 left-0 transition-colors ${isSelected ? 'bg-stone-100 dark:bg-stone-800' : 'bg-stone-50 dark:bg-stone-800/20'}`}
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
      <div className="px-6 pb-6 border-b border-stone-200 dark:border-stone-800 transition-colors">
        <h2 className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1 pt-12">Manuscript</h2>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-light text-stone-900 dark:text-stone-100">{totalWords.toLocaleString()}</span>
          <span className="text-sm text-stone-500 dark:text-stone-400">words</span>
        </div>
        <GoalTracker totalWords={totalWords} projectGoal={projectGoal} onUpdateProjectGoal={onUpdateProjectGoal} />
      </div>
      <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800 space-y-1">
        <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
          <span>{chapters.length} chapters</span>
          <span>{totalWords.toLocaleString()} words</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          Load different manuscript
        </button>
      </div>
    </aside>
  )
})
