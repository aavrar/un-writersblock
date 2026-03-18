import { useState } from 'react'

export default function SceneSplitterModal({ chapterTitle, paragraphs, initialScenes, onConfirm, onCancel }) {
    // initialScenes is an array, we want to map them to paragraph boundary indices
    // The first scene starts at 0, subsequent scenes start at some paragraph index
    // So the boundaries are a Set of those starting indices (excluding 0)
    const initialBoundaries = new Set(
        initialScenes.map(s => s.startParagraphIndex).filter(idx => idx > 0)
    )
    const [boundaries, setBoundaries] = useState(initialBoundaries)

    function toggleBoundary(index) {
        if (index === 0) return
        setBoundaries(prev => {
            const next = new Set(prev)
            next.has(index) ? next.delete(index) : next.add(index)
            return next
        })
    }

    function handleSave() {
        onConfirm([...boundaries])
    }

    return (
        <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-stone-950 overflow-y-auto flex flex-col transition-colors">
            <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-8 py-4 flex items-center justify-between transition-colors">
                <div>
                    <p className="text-stone-800 dark:text-stone-200 font-medium">Edit scenes for "{chapterTitle}"</p>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">
                        Click a paragraph to mark it as the start of a new scene, or click an existing boundary to remove it.
                    </p>
                </div>
                <div className="flex gap-3 ml-8 shrink-0">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm text-white bg-stone-800 dark:bg-stone-700 rounded hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors"
                    >
                        Save Scenes {boundaries.size > 0 ? `(${boundaries.size + 1} scenes)` : '(1 scene)'}
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full px-8 py-12 space-y-1">
                {paragraphs.map((paragraph, i) => (
                    <div key={i} className="group relative">
                        {boundaries.has(i) && (
                            <div className="flex items-center gap-2 mb-2 mt-4">
                                <div className="flex-1 h-px bg-stone-400 dark:bg-stone-600 transition-colors" />
                                <span className="text-xs text-stone-500 dark:text-stone-400 shrink-0 font-medium uppercase tracking-wider transition-colors">scene break</span>
                                <div className="flex-1 h-px bg-stone-400 dark:bg-stone-600 transition-colors" />
                            </div>
                        )}
                        <p
                            onClick={() => toggleBoundary(i)}
                            className={`font-serif text-stone-700 dark:text-stone-300 leading-relaxed py-1.5 px-3 rounded cursor-pointer transition-colors text-base ${boundaries.has(i)
                                ? 'bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200 dark:ring-stone-700'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800/50'
                                }`}
                        >
                            {paragraph}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
