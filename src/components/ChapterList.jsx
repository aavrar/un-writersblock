import { memo, useState } from 'react'
import GoalTracker from './GoalTracker'

function textToParagraphs(text) {
  const byDouble = text.split(/\n\n+/).map(s => s.replace(/\n/g, ' ').trim()).filter(Boolean)
  if (byDouble.length > 1) return byDouble
  return text.split(/\n/).map(s => s.trim()).filter(Boolean)
}

export default memo(function ChapterList({ panelWidth, chapters, selectedIndex, onSelect, onReset, onAddChapter, projectGoal, onUpdateProjectGoal }) {
  const maxWords = Math.max(...chapters.map(c => c.stats.wordCount), 1)
  const totalWords = chapters.reduce((sum, c) => sum + c.stats.wordCount, 0)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newText, setNewText] = useState('')

  function handleSubmit() {
    const paragraphs = textToParagraphs(newText)
    if (paragraphs.length === 0) return
    const title = newTitle.trim() || `Chapter ${chapters.length + 1}`
    onAddChapter({ title, paragraphs })
    setIsAdding(false)
    setNewTitle('')
    setNewText('')
  }

  function handleCancel() {
    setIsAdding(false)
    setNewTitle('')
    setNewText('')
  }

  return (
    <aside style={{ width: panelWidth, minWidth: panelWidth }} className="shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-screen sticky top-0 overflow-hidden transition-colors">
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
              className={`relative w-full text-left px-4 py-2.5 text-sm transition-colors overflow-hidden ${isSelected ? 'text-indigo-900 dark:text-indigo-200 font-medium' : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}`}
            >
              <div
                className={`absolute inset-y-0 left-0 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'bg-stone-50 dark:bg-stone-800/20'}`}
                style={{ width: `${barWidth}%` }}
              />
              <span className="relative flex items-center gap-2">
                <span className="text-stone-400 text-xs w-5 shrink-0">{i + 1}</span>
                <span className="truncate">{chapter.title}</span>
              </span>
            </button>
          )
        })}

        {isAdding ? (
          <div className="px-4 py-3 space-y-2 border-t border-stone-100 dark:border-stone-800/60 mt-1">
            <input
              type="text"
              placeholder={`Chapter ${chapters.length + 1}`}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded px-2 py-1.5 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
            />
            <textarea
              placeholder="Paste chapter text here..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              rows={6}
              className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded px-2 py-1.5 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 resize-none transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!newText.trim()}
                className="flex-1 text-xs px-2 py-1.5 bg-stone-800 dark:bg-stone-700 text-white rounded hover:bg-stone-700 dark:hover:bg-stone-600 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
              <button
                onClick={handleCancel}
                className="text-xs px-2 py-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left px-4 py-2.5 text-xs text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors mt-1"
          >
            + Add chapter
          </button>
        )}
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
