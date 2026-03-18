export function buildCharacterMap(chapters) {
  const charOrder = []
  const seen = new Set()
  for (const chapter of chapters) {
    for (const name of chapter.characters) {
      if (!seen.has(name)) { seen.add(name); charOrder.push(name) }
    }
  }
  return charOrder.map(name => ({
    name,
    presence: chapters.map(ch => ch.characters.includes(name)),
  }))
}

export default function CharacterMap({ chapters }) {
  const rows = buildCharacterMap(chapters)

  if (rows.length === 0) {
    return <p className="text-stone-400 text-sm">No characters detected across chapters.</p>
  }

  const abbrev = title => title.replace(/^(chapter|ch\.?)\s*\d+\s*[:.-]?\s*/i, '').slice(0, 12) || `Ch ${chapters.indexOf(chapters.find(c => c.title === title)) + 1}`

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse" style={{ minWidth: chapters.length * 36 + 140 }}>
        <thead>
          <tr>
            <th className="w-36 shrink-0" />
            {chapters.map((ch, i) => (
              <th key={i} className="w-8 text-center pb-3 font-normal text-stone-400" title={ch.title}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-stone-300">{i + 1}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, presence }) => (
            <tr key={name} className="group">
              <td className="pr-4 py-1 text-stone-600 text-right whitespace-nowrap w-36 group-hover:text-stone-900 transition-colors">
                {name}
              </td>
              {presence.map((present, i) => (
                <td key={i} className="w-8 text-center py-1">
                  <div className={`w-2 h-2 rounded-full mx-auto transition-colors ${
                    present ? 'bg-stone-500 group-hover:bg-stone-700' : 'bg-stone-100'
                  }`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-stone-500" />
          <span className="text-xs text-stone-400">appears</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-stone-100 border border-stone-200" />
          <span className="text-xs text-stone-400">absent</span>
        </div>
      </div>
    </div>
  )
}
