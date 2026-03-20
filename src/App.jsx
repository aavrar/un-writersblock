import { useState, useEffect } from 'react'
import { parseManuscript, buildChaptersFromBoundaries } from './lib/parseManuscript'
import { detectScenes } from './lib/detectScenes'
import { detectCharacters } from './lib/detectCharacters'
import { computeStats } from './lib/computeStats'
import { detectThreads } from './lib/detectThreads'
import { useLocalStorage } from './hooks/useLocalStorage'
import { set, get, del } from 'idb-keyval'
import { Analytics } from '@vercel/analytics/react'
import UploadZone from './components/UploadZone'
import ChapterSplitter from './components/ChapterSplitter'
import ChapterList from './components/ChapterList'
import ReentryBrief from './components/ReentryBrief'
import ThemeToggle from './components/ThemeToggle'
import CharacterManagerModal from './components/CharacterManagerModal'
import DragHandle from './components/DragHandle'

async function analyzeChapters(chapters, rules = {}) {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./lib/parserWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      if (e.data.type === 'done') {
        const rawProcessed = e.data.payload
        const globalCounts = {}
        for (const ch of rawProcessed) {
          for (const char of ch.characters) {
            globalCounts[char.name] = (globalCounts[char.name] || 0) + char.count
          }
        }
        const processed = rawProcessed.map(ch => ({
          ...ch,
          characters: ch.characters.filter(char => {
            if (rules[char.name] && rules[char.name].action === 'add') return true
            if (char.name === 'Narrator ("I")') return true
            return globalCounts[char.name] >= 3
          }).map(c => c.name)
        }))
        resolve(processed)
        worker.terminate()
      }
    }
    worker.postMessage({ type: 'analyze', payload: { chapters, rules } })
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
  const [sidebarWidth, setSidebarWidth] = useLocalStorage('panel_sidebar_width', 256)
  const [centerWidth, setCenterWidth] = useLocalStorage('panel_center_width', 520)
  const [outlineSections, setOutlineSections] = useState(null)
  const [characterRules, setCharacterRules] = useState({})
  const [annotations, setAnnotations] = useState({})
  const [projectGoal, setProjectGoal] = useState(null)
  const [isManagingCharacters, setIsManagingCharacters] = useState(false)

  useEffect(() => {
    async function init() {
      const storedChapters = await get('manuscript_chapters')
      const storedParagraphs = await get('all_paragraphs')
      const storedOutline = await get('outline_sections')
      const storedRules = await get('character_rules')
      const storedAnnotations = await get('inline_annotations')
      const storedGoal = await get('project_goal')

      if (storedOutline) setOutlineSections(storedOutline)
      if (storedRules) setCharacterRules(storedRules)
      if (storedAnnotations) setAnnotations(storedAnnotations)
      if (storedGoal) setProjectGoal(storedGoal)

      if (storedChapters && storedChapters.length > 0) {
        setChapters(storedChapters)
        setPhase('browsing')
      } else if (storedParagraphs && storedParagraphs.length > 0) {
        setAllParagraphs(storedParagraphs)
        setPhase('splitting')
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (phase !== 'browsing') return
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  async function applyChapters(analyzed) {
    const key = manuscriptKey(analyzed)
    if (key !== storedKey) {
      setOutlineSections(null)
      await del('outline_sections')
      setSelectedIndex(0)
      setStoredKey(key)
    }
    setChapters(analyzed)
    await set('manuscript_chapters', analyzed)
    setPhase('browsing')
  }

  async function handleFile(arrayBuffer) {
    setPhase('parsing')
    setParseError(null)
    try {
      const result = await parseManuscript(arrayBuffer)
      if (result.hasHeadings) {
        const analyzed = await analyzeChapters(result.chapters, characterRules)
        await applyChapters(analyzed)
      } else {
        setAllParagraphs(result.allParagraphs)
        await set('all_paragraphs', result.allParagraphs)
        setPhase('splitting')
      }
    } catch {
      setParseError('Could not parse this file. Make sure it is a valid .docx file.')
      setPhase('idle')
    }
  }

  async function handleSplitConfirm(boundaryIndices) {
    setPhase('parsing')
    const analyzed = await analyzeChapters(buildChaptersFromBoundaries(allParagraphs, boundaryIndices), characterRules)
    await applyChapters(analyzed)
  }

  async function handleSkip() {
    setPhase('parsing')
    const analyzed = await analyzeChapters([{ title: 'Full Manuscript', paragraphs: allParagraphs }], characterRules)
    await applyChapters(analyzed)
  }

  async function handleReset() {
    setPhase('idle')
    setChapters([])
    setAllParagraphs([])
    setParseError(null)
    setStoredKey(null)
    setOutlineSections(null)
    setSelectedIndex(0)
    setAnnotations({})
    setCharacterRules({})
    setProjectGoal(null)
    await del('manuscript_chapters')
    await del('all_paragraphs')
    await del('outline_sections')
    await del('inline_annotations')
    await del('character_rules')
    await del('project_goal')
  }

  async function handleAddChapter({ title, paragraphs }) {
    setPhase('parsing')
    const [analyzed] = await analyzeChapters([{ title, paragraphs }], characterRules)
    const newChapters = [...chapters, analyzed]
    await applyChapters(newChapters)
  }

  async function updateOutlineSections(sections) {
    setOutlineSections(sections)
    if (sections) {
      await set('outline_sections', sections)
    } else {
      await del('outline_sections')
    }
  }

  async function handleUpdateChapterScenes(chapterIndex, sceneBoundaries) {
    const chapter = chapters[chapterIndex]
    const boundaries = [0, ...sceneBoundaries].sort((a, b) => a - b)
    const newScenes = boundaries.map((start, i) => {
      const end = boundaries[i + 1] ?? chapter.paragraphs.length
      return {
        startParagraphIndex: start,
        endParagraphIndex: end - 1,
        paragraphs: chapter.paragraphs.slice(start, end)
      }
    }).filter(scene => scene.paragraphs.length > 0)

    const updatedStats = computeStats(chapter.paragraphs, newScenes)

    const newChapters = [...chapters]
    newChapters[chapterIndex] = { ...chapter, scenes: newScenes, stats: updatedStats }

    await applyChapters(newChapters)
  }

  async function handleUpdateProjectGoal(goal) {
    if (!goal) {
      setProjectGoal(null)
      await del('project_goal')
    } else {
      setProjectGoal(goal)
      await set('project_goal', goal)
    }
  }

  async function handleUpdateAnnotations(chapterIndex, paragraphIndex, note) {
    setAnnotations(prev => {
      const next = { ...prev }
      if (!next[chapterIndex]) next[chapterIndex] = {}
      if (note) {
        next[chapterIndex] = { ...next[chapterIndex], [paragraphIndex]: note }
      } else {
        const nextChap = { ...next[chapterIndex] }
        delete nextChap[paragraphIndex]
        next[chapterIndex] = nextChap
        if (Object.keys(nextChap).length === 0) delete next[chapterIndex]
      }
      set('inline_annotations', next)
      return next
    })
  }

  async function handleSaveCharacterRules(newRules) {
    setCharacterRules(newRules)
    await set('character_rules', newRules)
    setIsManagingCharacters(false)
    if (chapters.length > 0) {
      setPhase('parsing')
      const analyzed = await analyzeChapters(chapters, newRules)
      await applyChapters(analyzed)
    }
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
        <ThemeToggle />
        <Analytics />
      </div>
    )
  }

  if (phase === 'splitting') {
    return (
      <>
        <ChapterSplitter
          paragraphs={allParagraphs}
          onConfirm={handleSplitConfirm}
          onSkip={handleSkip}
        />
        <Analytics />
      </>
    )
  }

  const safeIndex = Math.min(selectedIndex ?? 0, chapters.length - 1)
  const threads = detectThreads(chapters, safeIndex)

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-950 transition-colors">
      <ChapterList
        panelWidth={sidebarWidth}
        chapters={chapters}
        selectedIndex={safeIndex}
        onSelect={setSelectedIndex}
        onReset={handleReset}
        onAddChapter={handleAddChapter}
        projectGoal={projectGoal}
        onUpdateProjectGoal={handleUpdateProjectGoal}
      />
      <DragHandle onDelta={d => setSidebarWidth(w => Math.min(400, Math.max(180, w + d)))} />
      <ReentryBrief
        centerWidth={centerWidth}
        onCenterResize={d => setCenterWidth(w => Math.min(720, Math.max(360, w + d)))}
        chapter={chapters[safeIndex]}
        chapters={chapters}
        threads={threads}
        outlineSections={outlineSections}
        onOutlineLoaded={updateOutlineSections}
        onUpdateScenes={(sceneBoundaries) => handleUpdateChapterScenes(safeIndex, sceneBoundaries)}
        onManageCharacters={() => setIsManagingCharacters(true)}
        chapterIndex={safeIndex}
        annotations={annotations[safeIndex] || {}}
        onUpdateAnnotations={handleUpdateAnnotations}
      />
      {isManagingCharacters && (
        <CharacterManagerModal
          chapters={chapters}
          rules={characterRules}
          onSaveRules={handleSaveCharacterRules}
          onClose={() => setIsManagingCharacters(false)}
        />
      )}
      <ThemeToggle />
      <Analytics />
    </div>
  )
}
