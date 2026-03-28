import { memo } from 'react'

export default memo(function ChapterOverview({ stats, characters, diff }) {
  const { wordCount, sceneCount, dialogueRatio, lexicalDensity, sentenceLengths } = stats
  const readingMinutes = Math.ceil(wordCount / 200)
  const avgSentence = sentenceLengths.length > 0
    ? Math.round(sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length)
    : 0

  const metrics = [
    { label: 'words', value: wordCount.toLocaleString() },
    { label: 'reading time', value: `~${readingMinutes} min` },
    { label: 'scenes', value: sceneCount },
    { label: 'dialogue', value: `${dialogueRatio}%` },
    { label: 'lexical density', value: `${lexicalDensity}%` },
    { label: 'avg sentence', value: `${avgSentence} wds` },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-stone-50 dark:bg-stone-900/60 rounded px-3 py-2.5">
            <div className="text-sm font-light text-stone-800 dark:text-stone-200">{value}</div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {characters.length > 0 && (
        <div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5">In this chapter</p>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{characters.join(', ')}</p>
        </div>
      )}

      {diff && (
        <div className="flex items-center gap-4 mt-6 p-4 bg-stone-50 dark:bg-stone-900/40 rounded border border-stone-200 dark:border-stone-800 transition-colors">
          <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest mb-1">Session Delta</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{diff.addedWords.toLocaleString()} wds</span> inserted, <span className="text-rose-600 dark:text-rose-400 font-medium">-{diff.removedWords.toLocaleString()} wds</span> trimmed
            </p>
          </div>
        </div>
      )}
    </div>
  )
})
