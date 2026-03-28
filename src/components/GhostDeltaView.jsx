import { memo } from 'react'

export default memo(function GhostDeltaView({ diff }) {
  if (!diff || !diff.paragraphDeltas) return null

  return (
    <div className="space-y-4 font-serif leading-relaxed text-base">
      <div className="mb-8 text-xs text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800 pb-2">
        Tracking Unsaved Changes from Previous Session
      </div>
      {diff.paragraphDeltas.map((delta, i) => {
        if (delta.type === 'unchanged') {
          return <p key={i} className="text-stone-700 dark:text-stone-300 transition-colors">{delta.text}</p>
        }
        if (delta.type === 'added') {
          return (
            <div key={i} className="pl-3 py-1 -ml-4 border-l-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-r">
              <p className="text-emerald-900 dark:text-emerald-200">{delta.text}</p>
            </div>
          )
        }
        if (delta.type === 'removed') {
          return (
            <div key={i} className="pl-3 py-1 -ml-4 border-l-4 border-rose-400 bg-rose-50 dark:bg-rose-900/10 rounded-r">
              <p className="text-rose-900/60 dark:text-rose-200/50 line-through select-none">{delta.text}</p>
            </div>
          )
        }
        return null
      })}
    </div>
  )
})
