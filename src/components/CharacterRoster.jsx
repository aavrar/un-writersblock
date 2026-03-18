import { memo } from 'react'

export default memo(function CharacterRoster({ characters }) {
  return (
    <div>
      {characters.length === 0 ? (
        <p className="text-stone-400 text-sm">No character names detected in this chapter.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {characters.map(name => (
            <span
              key={name}
              className="px-3 py-1 bg-stone-100 text-stone-700 text-sm rounded-full"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})
