import { useState, useEffect } from 'react'
import CharacterMap from './CharacterMap'
import ParagraphWithAnnotation from './ParagraphWithAnnotation'
import TimelineView from './TimelineView'
import RhythmChart from './RhythmChart'
import ChapterOverview from './ChapterOverview'
import InteractionMatrix from './InteractionMatrix'
import GhostDeltaView from './GhostDeltaView'

const TABS = [
  { type: 'chapter', label: 'Chapter' },
  { type: 'threads', label: 'Threads' },
  { type: 'characterMap', label: 'Characters' },
  { type: 'network', label: 'Matrix' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'rhythm', label: 'Rhythm' },
]

import { useManuscript } from '../contexts/ManuscriptContext'

export default function RightPanel({ view, onClose, onManageCharacters }) {
  const { 
    activeChapter: chapter, chapters, threads, outlineSections,
    selectedIndex: chapterIndex, annotations, handleUpdateAnnotations: onUpdateAnnotations
  } = useManuscript()
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
        {activeTab === 'network' && (
          <InteractionMatrix chapters={chapters} />
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
  const [showFriction, setShowFriction] = useState(false)
  const [showDelta, setShowDelta] = useState(false)
  
  const hasDiff = !!chapter.diff

  return (
    <div>
      <ChapterOverview stats={chapter.stats} characters={chapter.characters} diff={chapter.diff} />
      <div className="h-px bg-stone-100 dark:bg-stone-800 my-8" />
      
      <div className="flex flex-col gap-3 justify-end mb-8 border-b border-stone-100 dark:border-stone-800 pb-6">
        <label className="flex items-center justify-end gap-2 cursor-pointer group">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={showFriction} onChange={(e) => setShowFriction(e.target.checked)} />
            <div className={`block w-8 h-4 rounded-full transition-colors ${showFriction ? 'bg-indigo-500' : 'bg-stone-200 dark:bg-stone-800'}`}></div>
            <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${showFriction ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="text-xs font-medium text-stone-500 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-300 transition-colors w-40 text-right">
            Prose Blockers X-Ray
          </span>
        </label>
        
        {hasDiff && (
          <label className="flex items-center justify-end gap-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={showDelta} onChange={(e) => setShowDelta(e.target.checked)} />
              <div className={`block w-8 h-4 rounded-full transition-colors ${showDelta ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-800'}`}></div>
              <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${showDelta ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="text-xs font-medium text-stone-500 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-300 transition-colors w-40 text-right">
              Show Draft Delta
            </span>
          </label>
        )}
      </div>

      {showDelta && hasDiff ? (
        <GhostDeltaView diff={chapter.diff} />
      ) : (
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
                      showFriction={showFriction}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
        </div>
      )}
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
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${covered ? 'bg-teal-500' : 'bg-stone-200 dark:bg-stone-700'}`} />
            <p className={`text-sm leading-snug transition-colors ${covered ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-600'}`}>{beat}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
