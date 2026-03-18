export default function LastScene({ scenes, onExpand }) {
  if (!scenes || scenes.length === 0) return null

  const lastScene = scenes[scenes.length - 1]
  const paragraphs = lastScene.paragraphs
  const preview = paragraphs.slice(-3)
  const hasMore = paragraphs.length > 3

  return (
    <div>
      <div className="border-l-2 border-stone-300 pl-5">
        {hasMore && (
          <button
            onClick={() => onExpand({ type: 'scene', title: 'Full scene', data: scenes })}
            className="text-xs text-stone-400 hover:text-stone-600 mb-3 block transition-colors"
          >
            Show full scene ({paragraphs.length} paragraphs)
          </button>
        )}
        {preview.map((paragraph, i) => (
          <p key={i} className="font-serif text-stone-700 leading-relaxed text-base mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
