import { useState, useEffect } from 'react'
import SectionBlock from './SectionBlock'
import LastScene from './LastScene'
import CharacterRoster from './CharacterRoster'
import CharacterThreads from './CharacterThreads'
import OutlineDiff from './OutlineDiff'
import ChapterStats from './ChapterStats'
import RhythmChart from './RhythmChart'
import RightPanel from './RightPanel'
import SceneSplitterModal from './SceneSplitterModal'

export default function ReentryBrief({
  chapter, chapters, threads, outlineSections, onOutlineLoaded,
  onUpdateScenes, onManageCharacters, chapterIndex, annotations, onUpdateAnnotations
}) {
  const [expandedView, setExpandedView] = useState(null)
  const [isEditingScenes, setIsEditingScenes] = useState(false)
  const { title, scenes, characters, stats, paragraphs } = chapter

  function handleExpand(view) {
    setExpandedView(prev => prev?.type === view.type ? null : view)
  }

  useEffect(() => {
    setExpandedView(prev => {
      if (!prev) return null

      switch (prev.type) {
        case 'scene':
          return { ...prev, data: chapter.scenes, chapterIndex }
        case 'rhythm':
          return { ...prev, data: { sentenceLengths: chapter.stats.sentenceLengths, sentenceSentiment: chapter.stats.sentenceSentiment, sentences: chapter.stats.sentences } }
        case 'characterMap':
          return { ...prev, chapters }
        case 'timeline':
          return { ...prev, chapters, outlineSections }
        case 'threads':
          return { ...prev, data: threads, chapters }
        case 'outline':
          return null // Requires local diff computation, gracefully close
        default:
          return prev
      }
    })
  }, [chapterIndex, chapter, chapters, threads, outlineSections])

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="w-[520px] shrink-0 overflow-y-auto px-10 py-8">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-xl font-medium text-stone-900 dark:text-stone-100">{title}</h1>
        </div>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setIsEditingScenes(true)}
            className="text-xs font-medium text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Edit scenes
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleExpand({ type: 'characterMap', title: 'Character map', chapters })}
              className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              Character map
            </button>
            <button
              onClick={() => handleExpand({ type: 'timeline', title: 'Story timeline', data: null, chapters, outlineSections })}
              className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              Story timeline
            </button>
          </div>
        </div>
        <div className="h-px bg-stone-200 dark:bg-stone-800 mb-8 transition-colors" />

        <div className="space-y-8">
          <SectionBlock id="last-scene" title="Where you left off" defaultOpen={true}>
            <LastScene
              scenes={scenes}
              onExpand={handleExpand}
              chapterIndex={chapterIndex}
              annotations={annotations}
              onUpdateAnnotations={onUpdateAnnotations}
            />
          </SectionBlock>

          <SectionBlock id="characters" title="Characters" defaultOpen={true}>
            <CharacterRoster characters={characters} />
          </SectionBlock>

          <SectionBlock id="threads" title="Character threads" defaultOpen={false}>
            <CharacterThreads threads={threads} chapters={chapters} onExpand={handleExpand} />
          </SectionBlock>

          <SectionBlock id="outline" title="Outline coverage" defaultOpen={false}>
            <OutlineDiff
              chapterTitle={title}
              chapterParagraphs={paragraphs}
              sections={outlineSections}
              onSectionsLoaded={onOutlineLoaded}
              onExpand={handleExpand}
            />
          </SectionBlock>

          <SectionBlock id="stats" title="At a glance" defaultOpen={true}>
            <ChapterStats stats={stats} />
          </SectionBlock>

          <SectionBlock id="rhythm" title="Sentence Rhythm & Sentiment" defaultOpen={true}>
            <RhythmChart
              sentenceLengths={stats.sentenceLengths}
              sentenceSentiment={stats.sentenceSentiment}
              sentences={stats.sentences}
              onExpand={handleExpand}
            />
          </SectionBlock>
        </div>
      </main>

      <RightPanel
        view={expandedView}
        onClose={() => setExpandedView(null)}
        onManageCharacters={onManageCharacters}
        chapterIndex={chapterIndex}
        annotations={annotations}
        onUpdateAnnotations={onUpdateAnnotations}
      />

      {isEditingScenes && (
        <SceneSplitterModal
          chapterTitle={title}
          paragraphs={paragraphs}
          initialScenes={scenes}
          onConfirm={(boundaries) => {
            onUpdateScenes(boundaries)
            setIsEditingScenes(false)
          }}
          onCancel={() => setIsEditingScenes(false)}
        />
      )}
    </div>
  )
}
