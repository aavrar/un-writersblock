import CharacterMap from './CharacterMap'

export default function RightPanel({ view, onClose }) {
  if (!view) {
    return (
      <div className="flex-1 border-l border-stone-200 bg-white flex items-center justify-center">
        <p className="text-xs text-stone-300 select-none">Select a section to expand</p>
      </div>
    )
  }

  return (
    <div className="flex-1 border-l border-stone-200 bg-white flex flex-col overflow-hidden">
      <div className="px-8 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
        <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">{view.title}</p>
        <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {view.type === 'scene' && <SceneView scenes={view.data} />}
        {view.type === 'threads' && <ThreadsView threads={view.data} chapters={view.chapters} />}
        {view.type === 'outline' && <OutlineView results={view.data} sectionHeader={view.sectionHeader} />}
        {view.type === 'characterMap' && <CharacterMap chapters={view.chapters} />}
      </div>
    </div>
  )
}

function SceneView({ scenes }) {
  return (
    <div className="space-y-10">
      {scenes.map((scene, si) => (
        <div key={si}>
          {scenes.length > 1 && (
            <p className="text-xs text-stone-400 mb-4">Scene {si + 1}</p>
          )}
          <div className="space-y-4">
            {scene.paragraphs.map((paragraph, pi) => (
              <p key={pi} className="font-serif text-stone-700 leading-relaxed text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ThreadsView({ threads, chapters }) {
  const { reappearing, absent } = threads
  return (
    <div className="space-y-8">
      {reappearing.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-4">Returns after a gap</p>
          <div className="space-y-2">
            {reappearing.map(({ name, lastChapter, firstChapter }) => (
              <div key={name} className="flex items-start justify-between gap-4">
                <span className="text-sm text-stone-800 font-medium">{name}</span>
                <span className="text-xs text-stone-400 text-right shrink-0">
                  first ch. {firstChapter + 1}, last ch. {lastChapter + 1}<br />
                  <span className="text-stone-300">{chapters[lastChapter]?.title}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {absent.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-4">Not in this chapter</p>
          <div className="space-y-2">
            {absent.map(({ name, lastChapter, firstChapter }) => (
              <div key={name} className="flex items-start justify-between gap-4">
                <span className="text-sm text-stone-600">{name}</span>
                <span className="text-xs text-stone-300 text-right shrink-0">
                  first ch. {firstChapter + 1}, last ch. {lastChapter + 1}<br />
                  <span>{chapters[lastChapter]?.title}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OutlineView({ results, sectionHeader }) {
  const covered = results.filter(r => r.covered).length
  return (
    <div>
      {sectionHeader && (
        <p className="text-xs text-stone-400 italic mb-4">{sectionHeader}</p>
      )}
      <p className="text-xs text-stone-400 mb-5">{covered}/{results.length} beats found in chapter text</p>
      <div className="space-y-3">
        {results.map(({ beat, covered }, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${covered ? 'bg-stone-500' : 'bg-stone-200'}`} />
            <p className={`text-sm leading-snug ${covered ? 'text-stone-700' : 'text-stone-400'}`}>{beat}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
