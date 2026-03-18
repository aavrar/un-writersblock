import { useState } from 'react'

export default function CharacterManagerModal({ chapters, rules, onSaveRules, onClose }) {
    const [localRules, setLocalRules] = useState({ ...rules })
    const activeCharacters = Array.from(new Set(chapters.flatMap(c => c.characters)))

    const [mergeSource, setMergeSource] = useState('')
    const [mergeTarget, setMergeTarget] = useState('')

    function handleAddMerge() {
        if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return
        setLocalRules(prev => ({ ...prev, [mergeSource]: { action: 'merge', target: mergeTarget } }))
        setMergeSource('')
    }

    function handleSave() {
        onSaveRules(localRules)
    }

    return (
        <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-stone-950 overflow-y-auto flex flex-col transition-colors">
            <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-8 py-4 flex items-center justify-between transition-colors">
                <div>
                    <p className="text-stone-800 dark:text-stone-200 font-medium">Manage Characters</p>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">
                        Merge duplicate names together, or delete falsely detected characters to clean up your stats.
                    </p>
                </div>
                <div className="flex gap-3 ml-8 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm text-white bg-stone-800 dark:bg-stone-700 rounded hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors"
                    >
                        Apply & Re-analyze
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full px-8 py-10 space-y-8">
                <section>
                    <h2 className="text-stone-800 dark:text-stone-200 font-medium mb-4">Active Characters</h2>
                    <div className="flex flex-wrap gap-2">
                        {activeCharacters.map(name => (
                            <div key={name} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded shadow-sm">
                                <span className="text-sm text-stone-700 dark:text-stone-300">{name}</span>
                                <button
                                    onClick={() => setLocalRules(prev => ({ ...prev, [name]: { action: 'delete' } }))}
                                    className="text-stone-400 hover:text-red-500 transition-colors ml-1"
                                    title="Delete character"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {activeCharacters.length === 0 && <p className="text-stone-500 text-sm italic">No active characters detected.</p>}
                    </div>
                </section>

                <section>
                    <h2 className="text-stone-800 dark:text-stone-200 font-medium mb-4">Merge Aliases</h2>
                    <div className="flex gap-3 items-center p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded shadow-sm">
                        <select
                            value={mergeSource}
                            onChange="{(e) => setMergeSource(e.target.value)}"
                            className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-sm text-stone-800 dark:text-stone-200"
                        >
                            <option value="">Select character to merge...</option>
                            {activeCharacters.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <span className="text-stone-400 text-sm">into</span>
                        <select
                            value={mergeTarget}
                            onChange="{(e) => setMergeTarget(e.target.value)}"
                            className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-sm text-stone-800 dark:text-stone-200"
                        >
                            <option value="">Target character...</option>
                            {activeCharacters.filter(n => n !== mergeSource).map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <button
                            onClick={handleAddMerge}
                            disabled={!mergeSource || !mergeTarget}
                            className="px-4 py-2 text-sm bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors"
                        >
                            Merge
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="text-stone-800 dark:text-stone-200 font-medium mb-4">Active Rules</h2>
                    {Object.keys(localRules).length === 0 ? (
                        <p className="text-stone-500 text-sm italic">No active aliases or deletions.</p>
                    ) : (
                        <ul className="space-y-2">
                            {Object.entries(localRules).map(([name, rule]) => (
                                <li key={name} className="flex items-center justify-between p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded shadow-sm">
                                    <span className="text-sm text-stone-700 dark:text-stone-300">
                                        {rule.action === 'delete' ? (
                                            <span className="line-through opacity-60">{name}</span>
                                        ) : (
                                            <span>{name} &rarr; <strong>{rule.target}</strong></span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setLocalRules(prev => {
                                                const next = { ...prev }; delete next[name]; return next;
                                            })
                                        }}
                                        className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline transition-colors"
                                    >
                                        Remove Rule
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}
