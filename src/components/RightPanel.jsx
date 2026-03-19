import { useState, useEffect } from 'react'
import CharacterMap from './CharacterMap'
import ParagraphWithAnnotation from './ParagraphWithAnnotation'
import TimelineView from './TimelineView'
import RhythmChart from './RhythmChart'
import ChapterOverview from './ChapterOverview'

const TABS = [
  { type: 'chapter', label: 'Chapter' },
  { type: 'threads', label: 'Threads' },
  { type: 'characterMap', label: 'Characters' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'rhythm', label: 'Rhythm' },
]

export default function RightPanel({
  view, onClose,
  chapter, chapters, threads, outlineSections,
  onManageCharacters, chapterIndex, annotations, onUpdateAnnotations
}) {
  const [activeTab, setActiveTab] = useState(view?.type || 'chapter')

  useEffect(() => {
    if (view?.type) setActiveTab(view.type)
  }, [view?.type])

  if (!view) {
    return (
      <div className="flex-1 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center transition-colors">
        <p className="text-xs text-stone-300 dark:text-stone-600 select-none">Select a section to expand</p>
      </div>
    )
  }

  const visibleTabs = activeTab === 'outline'
    ? [...TABS, { type: 'outline', label: 'Outline' }]
    : TABS

  return (
    <div className="flex-1 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col overflow-hidden transition-colors">
      <div className="px-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center">
          {visibleTabs.map(tab => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`px-3 py-3.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.type
                  ? 'border-stone-800 dark:border-stone-200 text-stone-800 dark:text-stone-200'
                  : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors ml-4 shrink-0 py-3.5"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {activeTab === 'chapter' && chapter && (
          <ChapterView
            chapter={chapter}
            chapterIndex={chapterIndex}
            annotations={annotations}
            onUpdateAnnotations={onUpdateAnnotations}
          />
        )}
        {activeTab === 'threads' && threads && (
          <ThreadsView threads={threads} chapters={chapters} />
        )}
        {activeTab === 'outline' && view?.type === 'outline' && (
          <OutlineView results={view.data} sectionHeader={view.sectionHeader} />
        )}
        {activeTab === 'characterMap' && (
          <CharacterMap chapters={chapters} onManageCharacters={onManageCharacters} />
        )}
        {activeTab === 'timeline' && (
          <TimelineView chapters={chapters} outlineSections={outlineSections} onManageCharacters={onManageCharacters} />
        )}
        {activeTab === 'rhythm' && chapter?.stats && (
          <div className="w-full">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 italic">Emotional and structural flow of the chapter.</p>
            <RhythmChart
              sentenceLengths={chapter.stats.sentenceLengths}
              sentenceSentiment={chapter.stats.sentenceSentiment}
              sentences={chapter.stats.sentences}
              isExpanded={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ChapterView({ chapter, chapterIndex, annotations, onUpdateAnnotations }) {
  return (
    <div>
      <ChapterOverview stats={chapter.stats} characters={chapter.characters} />
      <div className="h-px bg-stone-100 dark:bg-stone-800 my-8" />
      <div className="space-y-10">
        {chapter.scenes.map((scene, si) => {
          const sceneWords = scene.paragraphs.join(' ').split(/\s+/).filter(Boolean).length
          const dialogueParas = scene.paragraphs.filter(p => /^[\u201C"]/.test(p.trim())).length
          const dialoguePct = Math.round((dialogueParas / Math.max(scene.paragraphs.length, 1)) * 100)

          return (
            <div key={si}>
              {chapter.scenes.length > 1 && (
                <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-4">
                  Scene {si + 1} &middot; {sceneWords.toLocaleString()} words &middot; {dialoguePct}% dialogue
                </p>
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
          )
        })}
      </div>
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
                <span className="text-sm text-stone-800 dark:text-stone-200 font-medium">{name}</span>
                <span className="text-xs text-stone-400 text-right shrink-0">
                  first ch. {firstChapter + 1}, last ch. {lastChapter + 1}<br />
                  <span className="text-stone-300 dark:text-stone-600">{chapters[lastChapter]?.title}</span>
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
                <span className="text-sm text-stone-600 dark:text-stone-400">{name}</span>
                <span className="text-xs text-stone-300 dark:text-stone-600 text-right shrink-0">
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
