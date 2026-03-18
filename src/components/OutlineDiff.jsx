import { useRef, useState } from 'react'
import { parseOutline, parseOutlineText, diffOutlineAgainstChapter } from '../lib/parseOutline'

export default function OutlineDiff({ chapterTitle, chapterParagraphs, sections, onSectionsLoaded, onExpand }) {
  const [loading, setLoading] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    setLoading(true)
    try {
      let parsed
      if (file.name.endsWith('.docx')) {
        const buffer = await file.arrayBuffer()
        parsed = await parseOutline(buffer)
      } else {
        const text = await file.text()
        parsed = parseOutlineText(text)
      }
      onSectionsLoaded(parsed)
    } finally {
      setLoading(false)
    }
  }

  function handlePasteConfirm() {
    onSectionsLoaded(parseOutlineText(pasteText))
    setPasteMode(false)
    setPasteText('')
  }

  if (!sections) {
    return (
      <div>
        {pasteMode ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste your outline notes here, one beat per line..."
              className="w-full h-36 text-sm text-stone-700 border border-stone-200 rounded p-3 resize-none focus:outline-none focus:border-stone-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasteConfirm}
                disabled={!pasteText.trim()}
                className="px-3 py-1.5 text-xs text-white bg-stone-800 rounded hover:bg-stone-700 disabled:opacity-40 transition-colors"
              >
                Parse outline
              </button>
              <button
                onClick={() => setPasteMode(false)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <button
              onClick={() => inputRef.current.click()}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 border border-stone-300 rounded hover:bg-stone-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Upload outline (.docx or .txt)'}
            </button>
            <span className="text-stone-300 text-xs">or</span>
            <button
              onClick={() => setPasteMode(true)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Paste notes
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".docx,.txt,.md"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        )}
      </div>
    )
  }

  const { section, results } = diffOutlineAgainstChapter(sections, chapterTitle, chapterParagraphs)

  if (!section) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onSectionsLoaded(null)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Change outline
          </button>
        </div>
        <p className="text-stone-400 text-sm">
          No matching outline section found for this chapter.
        </p>
      </div>
    )
  }

  const coveredCount = results.filter(r => r.covered).length
  const PREVIEW = 4

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span />
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400">{coveredCount}/{results.length} beats found</span>
          <button
            onClick={() => onExpand({ type: 'outline', title: 'Outline coverage', data: results, sectionHeader: section.header })}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Expand
          </button>
          <button onClick={() => onSectionsLoaded(null)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Change
          </button>
        </div>
      </div>
      {section.header && (
        <p className="text-xs text-stone-400 mb-3 italic">{section.header}</p>
      )}
      <div className="space-y-2">
        {results.slice(0, PREVIEW).map(({ beat, covered }, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${covered ? 'bg-stone-500' : 'bg-stone-200'}`} />
            <p className={`text-sm leading-snug ${covered ? 'text-stone-600' : 'text-stone-400'}`}>{beat}</p>
          </div>
        ))}
        {results.length > PREVIEW && (
          <button
            onClick={() => onExpand({ type: 'outline', title: 'Outline coverage', data: results, sectionHeader: section.header })}
            className="text-xs text-stone-300 hover:text-stone-500 transition-colors pt-1 block"
          >
            +{results.length - PREVIEW} more beats
          </button>
        )}
      </div>
    </div>
  )
}
