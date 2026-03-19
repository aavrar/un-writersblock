import { memo } from 'react'

export default memo(function ChapterOverview({ stats, characters }) {
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
    </div>
  )
})
