import { buildCharacterMap } from './CharacterMap'

function TimelineGrid({ chapters, rows, renderCell }) {
    return (
        <div className="relative overflow-x-auto pb-4">
            <div className="flex select-none shadow-sm pb-2 border-b border-stone-100 dark:border-stone-800/80 mb-2 min-w-max">
                <div className="w-48 shrink-0 border-r border-stone-200 dark:border-stone-800" />
                {chapters.map((ch, i) => (
                    <div key={i} className="w-16 shrink-0 flex items-center justify-center">
                        <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Ch {i + 1}</span>
                    </div>
                ))}
            </div>
            <div className="space-y-0.5 min-w-max">
                {rows.map((row, ri) => (
                    <div key={row.id || ri} className="flex group hover:bg-stone-50 dark:hover:bg-stone-900/40 rounded transition-colors">
                        <div className="w-48 shrink-0 py-2.5 pr-6 flex items-center justify-end border-r border-transparent group-hover:border-stone-200 dark:group-hover:border-stone-800 transition-colors">
                            <span className="text-xs font-medium text-stone-600 dark:text-stone-300 text-right truncate">{row.label}</span>
                        </div>
                        {chapters.map((ch, i) => (
                            <div key={i} className="w-16 shrink-0 flex flex-col items-center justify-center border-l border-stone-100 dark:border-stone-800/30 py-2.5 relative">
                                {renderCell(row, i, ch)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function TimelineView({ chapters, outlineSections, onManageCharacters }) {
    if (!chapters || chapters.length === 0) return null

    const characters = buildCharacterMap(chapters)

    const outlineRows = [{ id: 'beats', label: 'Outline Integrity' }]
    const renderOutlineCell = (row, i, ch) => {
        const sectionBody = outlineSections?.[i]?.body || ''
        const hasOutlineMatch = sectionBody.length > 20
        return (
            <div
                className={`w-10 h-1.5 rounded-full transition-colors ${hasOutlineMatch ? 'bg-amber-500 shadow-sm shadow-amber-500/20' : 'bg-stone-200 dark:bg-stone-800'}`}
                title={hasOutlineMatch ? 'Outline constraints active' : 'No strict outline body'}
            />
        )
    }

    const renderCharacterCell = (row, i) => {
        const isPresent = row.presence[i]
        return (
            <div className="relative flex items-center justify-center w-full h-full">
                <div className={`absolute top-1/2 -translate-y-1/2 w-full h-0.5 ${isPresent ? 'bg-stone-200 dark:bg-stone-800 group-hover:bg-stone-300 dark:group-hover:bg-stone-700' : ''} transition-colors z-0`} />
                <div className={`relative z-10 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-stone-950 transition-all ${isPresent ? 'bg-stone-500 dark:bg-stone-400 scale-100' : 'bg-transparent border-none scale-0 group-hover:scale-50 group-hover:bg-stone-300 dark:group-hover:bg-stone-700'} `} />
            </div>
        )
    }

    const characterRows = characters.map(c => ({ id: c.name, label: c.name, presence: c.presence }))

    return (
        <div className="space-y-16 animate-in fade-in duration-500">
            <div>
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pacing & Beats
                </h3>
                <TimelineGrid chapters={chapters} rows={outlineRows} renderCell={renderOutlineCell} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Character Arcs
                    </h3>
                    {onManageCharacters && (
                        <button
                            onClick={onManageCharacters}
                            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline transition-colors"
                        >
                            Manage characters
                        </button>
                    )}
                </div>
                {characterRows.length > 0 ? (
                    <TimelineGrid chapters={chapters} rows={characterRows} renderCell={renderCharacterCell} />
                ) : (
                    <div className="py-6 flex justify-center">
                        <p className="text-sm text-stone-500 dark:text-stone-400 italic">No characters detected to track.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
