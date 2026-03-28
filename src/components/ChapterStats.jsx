import { memo } from 'react'

export default memo(function ChapterStats({ stats }) {
  const items = [
    { label: 'words', value: stats.wordCount.toLocaleString() },
    { label: 'scenes', value: stats.sceneCount },
    { label: 'paragraphs', value: stats.paragraphCount },
  ]

  const diaPct = stats.dialogueRatio || 0
  const actionPct = Math.max(0, 100 - diaPct)

  return (
    <div className="space-y-8">
      <div className="flex gap-8">
        {items.map(({ label, value }) => (
          <div key={label}>
            <span className="text-2xl font-light text-stone-800 dark:text-stone-200 transition-colors">{value}</span>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div>
         <div className="flex justify-between text-xs text-stone-500 mb-2">
            <span>Action & Narrative ({actionPct}%)</span>
            <span>Dialogue ({diaPct}%)</span>
         </div>
         <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex transition-colors">
            <div className="h-full bg-stone-300 dark:bg-stone-600 transition-all duration-500" style={{ width: `${actionPct}%` }} />
            <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: `${diaPct}%` }} />
         </div>
      </div>
    </div>
  )
})
