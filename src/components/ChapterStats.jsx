export default function ChapterStats({ stats }) {
  const items = [
    { label: 'words', value: stats.wordCount.toLocaleString() },
    { label: 'scenes', value: stats.sceneCount },
    { label: 'paragraphs', value: stats.paragraphCount },
  ]

  return (
    <div>
      <div className="flex gap-8">
        {items.map(({ label, value }) => (
          <div key={label}>
            <span className="text-2xl font-light text-stone-800">{value}</span>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
