import CharacterMap from './CharacterMap'
import ParagraphWithAnnotation from './ParagraphWithAnnotation'
import TimelineView from './TimelineView'

export default function RightPanel({ view, onClose, onManageCharacters, chapterIndex, annotations, onUpdateAnnotations }) {
  if (!view) {
    return (
      <div className="flex-1 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center transition-colors">
        <p className="text-xs text-stone-300 dark:text-stone-600 select-none">Select a section to expand</p>
      </div>
    )
  }

  return (
    <div className="flex-1 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col overflow-hidden transition-colors">
      <div className="px-8 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 transition-colors">
        <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-medium">{view.title}</p>
        <button onClick={onClose} className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {view.type === 'scene' && (
          <SceneView
            scenes={view.data}
            chapterIndex={chapterIndex}
            annotations={annotations}
            onUpdateAnnotations={onUpdateAnnotations}
          />
        )}
        {view.type === 'threads' && <ThreadsView threads={view.data} chapters={view.chapters} />}
        {view.type === 'outline' && <OutlineView results={view.data} sectionHeader={view.sectionHeader} />}
        {view.type === 'characterMap' && <CharacterMap chapters={view.chapters} onManageCharacters={onManageCharacters} />}
        {view.type === 'timeline' && <TimelineView chapters={view.chapters} outlineSections={view.outlineSections} />}
      </div>
    </div>
  )
}

function SceneView({ scenes, chapterIndex, annotations, onUpdateAnnotations }) {
  return (
    <div className="space-y-10">
      {scenes.map((scene, si) => (
        <div key={si}>
          {scenes.length > 1 && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">Scene {si + 1}</p>
          )}
          <div className="space-y-4">
            {scene.paragraphs.map((paragraph, pi) => {
              const absIndex = scene.startParagraphIndex + pi
              return (
                <ParagraphWithAnnotation
                  key={absIndex}
                  text={paragraph}
                  note={annotations?.[absIndex]}
                  onSaveNote={(note) => onUpdateAnnotations(chapterIndex, absIndex, note)}
                />
              )
            })}
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
        <p className="text-xs text-stone-400 dark:text-stone-500 italic mb-4 transition-colors">{sectionHeader}</p>
      )}
      <p className="text-xs text-stone-400 dark:text-stone-500 mb-5 transition-colors">{covered}/{results.length} beats found in chapter text</p>
      <div className="space-y-3">
        {results.map(({ beat, covered }, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${covered ? 'bg-stone-500 dark:bg-stone-400' : 'bg-stone-200 dark:bg-stone-700'}`} />
            <p className={`text-sm leading-snug transition-colors ${covered ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-600'}`}>{beat}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
