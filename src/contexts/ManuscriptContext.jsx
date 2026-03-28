import { createContext, useContext, useState, useEffect } from 'react'
import { parseManuscript, buildChaptersFromBoundaries } from '../lib/parseManuscript'
import { computeStats } from '../lib/computeStats'
import { detectThreads } from '../lib/detectThreads'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { set, get, del } from 'idb-keyval'

const ManuscriptContext = createContext(null)

const analyzeChapters = (chaps, rules, previousChapters = []) => {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('../lib/parserWorker.js', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (e) => {
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
          }).map(c => c.name),
          scenes: (ch.scenes || []).map(s => ({
            ...s,
            characters: (s.characters || []).filter(char => {
              if (rules[char.name] && rules[char.name].action === 'add') return true
              if (char.name === 'Narrator ("I")') return true
              return globalCounts[char.name] >= 3
            }).map(c => c.name)
          }))
        }))
        resolve(processed)
        worker.terminate()
      }
    })
    worker.postMessage({ 
      type: 'analyze', 
      payload: { chapters: chaps, rules, previousChapters } 
    })
  })
}

function manuscriptKey(chapters) {
  return `${chapters.length}|${chapters[0]?.title ?? ''}`
}

export function ManuscriptProvider({ children }) {
  const [phase, setPhase] = useState('idle')
  const [allParagraphs, setAllParagraphs] = useState([])
  const [chapters, setChapters] = useState([])
  const [parseError, setParseError] = useState(null)

  const [storedKey, setStoredKey] = useLocalStorage('manuscript_key', null)
  const [selectedIndex, setSelectedIndex] = useLocalStorage('selected_chapter', 0)
  const [outlineSections, setOutlineSections] = useState(null)
  const [characterRules, setCharacterRules] = useState({})
  const [annotations, setAnnotations] = useState({})
  const [projectGoal, setProjectGoal] = useState(null)

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
    
    // Store the previous state silently in IDB as backup
    if (chapters && chapters.length > 0) {
      await set('previous_manuscript_chapters', chapters)
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
        const prevChaps = (await get('manuscript_chapters')) || (await get('previous_manuscript_chapters')) || []
        const analyzed = await analyzeChapters(result.chapters, characterRules, prevChaps)
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
    try {
      const prevChaps = (await get('manuscript_chapters')) || (await get('previous_manuscript_chapters')) || []
      const analyzed = await analyzeChapters(buildChaptersFromBoundaries(allParagraphs, boundaryIndices), characterRules, prevChaps)
      await applyChapters(analyzed)
    } catch (e) {
      setParseError(e.message)
      setPhase('idle')
    }
  }

  async function handleSkip() {
    setPhase('parsing')
    const analyzed = await analyzeChapters([{ title: 'Full Manuscript', paragraphs: allParagraphs }], characterRules)
    await applyChapters(analyzed)
  }

  async function handleReset() {
    const activeChaps = await get('manuscript_chapters')
    if (activeChaps && activeChaps.length > 0) {
      await set('previous_manuscript_chapters', activeChaps)
    }

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
    if (chapters.length > 0) {
      setPhase('parsing')
      const analyzed = await analyzeChapters(chapters, newRules)
      await applyChapters(analyzed)
    }
  }

  const safeIndex = Math.min(selectedIndex ?? 0, chapters.length > 0 ? chapters.length - 1 : 0)
  const activeChapter = chapters[safeIndex]
  const threads = chapters.length > 0 ? detectThreads(chapters, safeIndex) : null

  const value = {
    // Phase & Initialization
    phase,
    parseError,
    allParagraphs,
    // Core Data
    chapters,
    activeChapter,
    selectedIndex,
    setSelectedIndex,
    threads,
    // Ancillary Data
    outlineSections,
    annotations,
    projectGoal,
    characterRules,
    // Database Functions
    handleFile,
    handleSplitConfirm,
    handleSkip,
    handleReset,
    handleAddChapter,
    updateOutlineSections,
    handleUpdateChapterScenes,
    handleUpdateProjectGoal,
    handleUpdateAnnotations,
    handleSaveCharacterRules
  }

  return (
    <ManuscriptContext.Provider value={value}>
      {children}
    </ManuscriptContext.Provider>
  )
}

export function useManuscript() {
  const context = useContext(ManuscriptContext)
  if (!context) throw new Error('useManuscript must be used within a ManuscriptProvider')
  return context
}
