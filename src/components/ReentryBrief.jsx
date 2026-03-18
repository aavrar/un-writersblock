import { useState } from 'react'
import SectionBlock from './SectionBlock'
import LastScene from './LastScene'
import CharacterRoster from './CharacterRoster'
import CharacterThreads from './CharacterThreads'
import OutlineDiff from './OutlineDiff'
import ChapterStats from './ChapterStats'
import RhythmChart from './RhythmChart'
import RightPanel from './RightPanel'

export default function ReentryBrief({ chapter, chapters, threads, outlineSections, onOutlineLoaded }) {
  const [expandedView, setExpandedView] = useState(null)
  const { title, scenes, characters, stats, paragraphs } = chapter

  function handleExpand(view) {
    setExpandedView(prev => prev?.type === view.type ? null : view)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="w-[520px] shrink-0 overflow-y-auto px-10 py-8">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-xl font-medium text-stone-900">{title}</h1>
          <button
            onClick={() => handleExpand({ type: 'characterMap', title: 'Character map', chapters })}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors mt-1 shrink-0 ml-4"
          >
            Character map
          </button>
        </div>
        <div className="h-px bg-stone-200 mb-8" />

        <div className="space-y-8">
          <SectionBlock id="last-scene" title="Where you left off" defaultOpen={true}>
            <LastScene scenes={scenes} onExpand={handleExpand} />
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

          <SectionBlock id="rhythm" title="Sentence rhythm" defaultOpen={false}>
            <RhythmChart sentenceLengths={stats.sentenceLengths} />
          </SectionBlock>
        </div>
      </main>

      <RightPanel view={expandedView} onClose={() => setExpandedView(null)} />
    </div>
  )
}
