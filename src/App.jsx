import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { ManuscriptProvider, useManuscript } from './contexts/ManuscriptContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import UploadZone from './components/UploadZone'
import ChapterSplitter from './components/ChapterSplitter'
import ChapterList from './components/ChapterList'
import ReentryBrief from './components/ReentryBrief'
import ThemeToggle from './components/ThemeToggle'
import CharacterManagerModal from './components/CharacterManagerModal'
import DragHandle from './components/DragHandle'

function MainContent() {
  const {
    phase, parseError, allParagraphs, chapters, characterRules,
    handleFile, handleSplitConfirm, handleSkip, handleSaveCharacterRules
  } = useManuscript()
  
  const [sidebarWidth, setSidebarWidth] = useLocalStorage('panel_sidebar_width', 256)
  const [centerWidth, setCenterWidth] = useLocalStorage('panel_center_width', 520)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isManagingCharacters, setIsManagingCharacters] = useState(false)

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
        <ChapterSplitter paragraphs={allParagraphs} onConfirm={handleSplitConfirm} onSkip={handleSkip} />
        <Analytics />
      </>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-950 transition-colors relative">
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? '' : '!w-0 opacity-0 overflow-hidden'}`}>
        <ChapterList panelWidth={sidebarWidth} />
      </div>
      
      {isSidebarOpen && <DragHandle onDelta={d => setSidebarWidth(w => Math.min(400, Math.max(180, w + d)))} />}
      
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-0 top-6 z-50 p-1.5 bg-white dark:bg-stone-800 border border-l-0 border-stone-200 dark:border-stone-700 shadow-sm rounded-r-md text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
          title="Open Chapters"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className={`relative transition-all duration-300 ease-in-out flex flex-1 ${isSidebarOpen ? '' : 'pl-6'}`}>
        <ReentryBrief 
          centerWidth={centerWidth} 
          onCenterResize={d => setCenterWidth(w => Math.min(720, Math.max(360, w + d)))}
          onManageCharacters={() => setIsManagingCharacters(true)} 
        />
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute left-6 top-6 z-50 p-1.5 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-stone-900/80 backdrop-blur border border-stone-200 dark:border-stone-800 shadow-sm rounded-md text-stone-400 hover:text-stone-600 transition-all"
            title="Collapse Sidebar"
            style={{ transform: 'translateX(-50%)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
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

export default function App() {
  return (
    <ManuscriptProvider>
      <MainContent />
    </ManuscriptProvider>
  )
}
