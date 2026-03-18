const PREVIEW_COUNT = 5

export default function CharacterThreads({ threads, chapters, onExpand }) {
  const { reappearing, absent } = threads

  if (absent.length === 0 && reappearing.length === 0) return null

  const totalCount = reappearing.length + absent.length
  const hasMore = totalCount > PREVIEW_COUNT

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span />
        {hasMore && (
          <button
            onClick={() => onExpand({ type: 'threads', title: 'Character threads', data: threads, chapters })}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Show all {totalCount}
          </button>
        )}
      </div>
      <div className="space-y-4">
        {reappearing.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 mb-2">Returns after a gap</p>
            <div className="space-y-1">
              {reappearing.map(({ name, lastChapter }) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-stone-700">{name}</span>
                  <span className="text-xs text-stone-400">
                    last in ch. {lastChapter + 1} &mdash; {chapters[lastChapter]?.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {absent.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 mb-2">Not in this chapter</p>
            <div className="space-y-1">
              {absent.slice(0, PREVIEW_COUNT - reappearing.length).map(({ name, lastChapter }) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">{name}</span>
                  <span className="text-xs text-stone-300">
                    last in ch. {lastChapter + 1} &mdash; {chapters[lastChapter]?.title}
                  </span>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => onExpand({ type: 'threads', title: 'Character threads', data: threads, chapters })}
                  className="text-xs text-stone-300 hover:text-stone-500 transition-colors pt-1 block"
                >
                  +{absent.length - (PREVIEW_COUNT - reappearing.length)} more
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
