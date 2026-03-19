import { memo } from 'react'
import ParagraphWithAnnotation from './ParagraphWithAnnotation'

export default memo(function LastScene({ scenes, onExpand, chapterIndex, annotations, onUpdateAnnotations }) {
  if (!scenes || scenes.length === 0) return null

  const lastScene = scenes[scenes.length - 1]
  const paragraphs = lastScene.paragraphs
  const preview = paragraphs.slice(-3)
  const hasMore = paragraphs.length > 3
  const startIdx = Math.max(0, paragraphs.length - 3)

  return (
    <div>
      <div className="border-l-2 border-stone-300 pl-5">
        {hasMore && (
          <button
            onClick={() => onExpand({ type: 'chapter' })}
            className="text-xs text-stone-400 hover:text-stone-600 mb-3 block transition-colors"
          >
            Show full chapter ({paragraphs.length} paragraphs)
          </button>
        )}
        {preview.map((paragraph, i) => {
          const absIndex = lastScene.startParagraphIndex + startIdx + i
          return (
            <div key={absIndex} className="mb-4 last:mb-0">
              <ParagraphWithAnnotation
                text={paragraph}
                note={annotations?.[absIndex]}
                onSaveNote={(note) => onUpdateAnnotations(chapterIndex, absIndex, note)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})
