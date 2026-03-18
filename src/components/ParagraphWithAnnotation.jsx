import { useState } from 'react'

export default function ParagraphWithAnnotation({ text, note, onSaveNote }) {
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(note || '')

    function handleSave() {
        onSaveNote(draft.trim())
        setIsEditing(false)
    }

    return (
        <div className="relative group">
            <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(e => !e)} className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                    {note ? (
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123A7.014 7.014 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    )}
                </button>
            </div>

            <p className={`font-serif leading-relaxed text-base transition-colors ${note ? 'text-stone-800 dark:text-stone-200 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 -mx-2 rounded' : 'text-stone-700 dark:text-stone-300'}`}>
                {text}
            </p>

            {isEditing && (
                <div className="mt-2 mb-4 p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded shadow-sm">
                    <textarea
                        autoFocus
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Type your notes here..."
                        className="w-full h-24 text-sm bg-transparent border-none resize-none focus:outline-none text-stone-700 dark:text-stone-300 placeholder-stone-400"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-stone-800 dark:bg-stone-700 text-white rounded hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors">Save note</button>
                    </div>
                </div>
            )}
            {!isEditing && note && (
                <div className="mt-1 mb-4 text-sm text-stone-500 dark:text-stone-400 italic pl-4 border-l-2 border-amber-200 dark:border-amber-900/50">
                    {note}
                </div>
            )}
        </div>
    )
}
