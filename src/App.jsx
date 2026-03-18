import { useState, useEffect } from 'react'
import { parseManuscript, buildChaptersFromBoundaries } from './lib/parseManuscript'
import { detectScenes } from './lib/detectScenes'
import { detectCharacters } from './lib/detectCharacters'
import { computeStats } from './lib/computeStats'
import { detectThreads } from './lib/detectThreads'
import { useLocalStorage } from './hooks/useLocalStorage'
import UploadZone from './components/UploadZone'
import ChapterSplitter from './components/ChapterSplitter'
import ChapterList from './components/ChapterList'
import ReentryBrief from './components/ReentryBrief'

function analyzeChapters(rawChapters) {
  return rawChapters.map(chapter => {
    const scenes = detectScenes(chapter.paragraphs)
    const characters = detectCharacters(chapter.paragraphs)
    const stats = computeStats(chapter.paragraphs, scenes)
    return { ...chapter, scenes, characters, stats }
  })
}

function manuscriptKey(chapters) {
  return `${chapters.length}|${chapters[0]?.title ?? ''}`
}

export default function App() {
  const [phase, setPhase] = useState('idle')
  const [allParagraphs, setAllParagraphs] = useState([])
  const [chapters, setChapters] = useState([])
  const [parseError, setParseError] = useState(null)

  const [storedKey, setStoredKey] = useLocalStorage('manuscript_key', null)
  const [selectedIndex, setSelectedIndex] = useLocalStorage('selected_chapter', 0)
  const [outlineSections, setOutlineSections] = useLocalStorage('outline_sections', null)

  useEffect(() => {
    if (phase !== 'browsing') return
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  function applyChapters(analyzed) {
    const key = manuscriptKey(analyzed)
    if (key !== storedKey) {
      setOutlineSections(null)
      setSelectedIndex(0)
      setStoredKey(key)
    }
    setChapters(analyzed)
    setPhase('browsing')
  }

  async function handleFile(arrayBuffer) {
    setPhase('parsing')
    setParseError(null)
    try {
      const result = await parseManuscript(arrayBuffer)
      if (result.hasHeadings) {
        applyChapters(analyzeChapters(result.chapters))
      } else {
        setAllParagraphs(result.allParagraphs)
        setPhase('splitting')
      }
    } catch {
      setParseError('Could not parse this file. Make sure it is a valid .docx file.')
      setPhase('idle')
    }
  }

  function handleSplitConfirm(boundaryIndices) {
    applyChapters(analyzeChapters(buildChaptersFromBoundaries(allParagraphs, boundaryIndices)))
  }

  function handleSkip() {
    applyChapters(analyzeChapters([{ title: 'Full Manuscript', paragraphs: allParagraphs }]))
  }

  function handleReset() {
    setPhase('idle')
    setChapters([])
    setAllParagraphs([])
    setParseError(null)
    setStoredKey(null)
    setOutlineSections(null)
    setSelectedIndex(0)
  }

  if (phase === 'idle' || phase === 'parsing') {
    return (
      <div>
        <UploadZone onFile={handleFile} />
        {phase === 'parsing' && (
          <div className="fixed inset-0 bg-white/80 flex items-center justify-center">
            <p className="text-stone-500 text-sm">Parsing manuscript...</p>
          </div>
        )}
        {parseError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {parseError}
          </div>
        )}
      </div>
    )
  }

  if (phase === 'splitting') {
    return (
      <ChapterSplitter
        paragraphs={allParagraphs}
        onConfirm={handleSplitConfirm}
        onSkip={handleSkip}
      />
    )
  }

  const safeIndex = Math.min(selectedIndex ?? 0, chapters.length - 1)
  const threads = detectThreads(chapters, safeIndex)

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <ChapterList
        chapters={chapters}
        selectedIndex={safeIndex}
        onSelect={setSelectedIndex}
        onReset={handleReset}
      />
      <ReentryBrief
        chapter={chapters[safeIndex]}
        chapters={chapters}
        threads={threads}
        outlineSections={outlineSections}
        onOutlineLoaded={setOutlineSections}
      />
    </div>
  )
}
