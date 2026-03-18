import { useState } from 'react'

export default function GoalTracker({ totalWords, projectGoal, onUpdateProjectGoal }) {
    const [isEditing, setIsEditing] = useState(false)
    const [targetStr, setTargetStr] = useState(projectGoal ? String(projectGoal.target) : '80000')

    function handleSave() {
        const val = parseInt(targetStr, 10)
        if (val > 0) {
            onUpdateProjectGoal({ target: val })
        } else {
            onUpdateProjectGoal(null)
        }
        setIsEditing(false)
    }

    if (!projectGoal && !isEditing) {
        return (
            <div className="mt-2">
                <button onClick={() => setIsEditing(true)} className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 underline transition-colors">
                    + Set word count goal
                </button>
            </div>
        )
    }

    if (isEditing) {
        return (
            <div className="mt-3 p-3 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Target Word Count</label>
                <input
                    type="number"
                    value={targetStr}
                    onChange={e => setTargetStr(e.target.value)}
                    className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-sm mb-3 text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
                    autoFocus
                />
                <div className="flex gap-2 text-xs">
                    <button onClick={handleSave} className="px-3 py-1.5 bg-stone-800 dark:bg-stone-700 text-white rounded hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors font-medium">Save</button>
                    <button
                        onClick={() => { setIsEditing(false); setTargetStr(projectGoal ? String(projectGoal.target) : '80000') }}
                        className="px-3 py-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                    >
                        Cancel
                    </button>
                    {projectGoal && (
                        <button onClick={() => { onUpdateProjectGoal(null); setIsEditing(false) }} className="px-3 py-1.5 text-red-500 hover:text-red-600 dark:hover:text-red-400 ml-auto transition-colors">
                            Clear
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const percentage = Math.min(100, Math.round((totalWords / projectGoal.target) * 100))

    return (
        <div className="mt-3 group cursor-pointer" onClick={() => setIsEditing(true)} title="Click to edit goal">
            <div className="flex justify-between items-center mb-1.5 px-0.5">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-medium">Target: {projectGoal.target.toLocaleString()}</span>
                <span className={`text-[10px] font-bold transition-colors ${percentage >= 100 ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white'}`}>
                    {percentage}%
                </span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${percentage >= 100 ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-stone-400 dark:bg-stone-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
