import { memo } from 'react'

export default memo(function InteractionMatrix({ chapters }) {
  const allChars = new Set()
  const matrix = {}

  chapters.forEach(ch => {
    ch.scenes?.forEach(scene => {
      const chars = scene.characters || []
      chars.forEach(c => allChars.add(c))
      
      for (let i = 0; i < chars.length; i++) {
        for (let j = i + 1; j < chars.length; j++) {
           const a = chars[i]
           const b = chars[j]
           if (!matrix[a]) matrix[a] = {}
           if (!matrix[b]) matrix[b] = {}
           matrix[a][b] = (matrix[a][b] || 0) + 1
           matrix[b][a] = (matrix[b][a] || 0) + 1
        }
      }
    })
  })

  const sortedChars = Array.from(allChars).sort((a, b) => a.localeCompare(b))

  if (sortedChars.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-500 text-sm">
        Not enough character overlaps to build a relational matrix.
      </div>
    )
  }

  let maxWeight = 1;
  sortedChars.forEach(a => {
    sortedChars.forEach(b => {
      if (matrix[a]?.[b]) maxWeight = Math.max(maxWeight, matrix[a][b])
    })
  })

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-500 dark:text-stone-400 italic mb-8">
        A heatmap of scene-level character intersections. Darker cells indicate a higher volume of shared scenes.
      </p>
      
      <div className="overflow-x-auto relative pb-8">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 border-b border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky left-0 z-20 transition-colors"></th>
              {sortedChars.map(c => (
                <th key={c} className="p-2 border-b border-stone-200 dark:border-stone-800 font-medium text-stone-600 dark:text-stone-400 text-left align-bottom transition-colors" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '140px' }}>
                  <span className="truncate max-w-[130px] block">{c}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedChars.map(rowChar => (
               <tr key={rowChar}>
                <th className="p-2 pr-4 border-b border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky left-0 z-10 font-medium text-stone-600 dark:text-stone-400 text-right whitespace-nowrap max-w-[160px] truncate transition-colors">
                  {rowChar}
                </th>
                {sortedChars.map(colChar => {
                  if (rowChar === colChar) {
                    return <td key={colChar} className="p-2 border-b border-stone-100 dark:border-stone-800/50 bg-stone-50 dark:bg-stone-900/50 transition-colors" />
                  }
                  const weight = matrix[rowChar]?.[colChar] || 0
                  const opacity = weight > 0 ? Math.max(0.15, weight / maxWeight) : 0
                  
                  return (
                    <td key={colChar} className="p-1 border-b border-stone-100 dark:border-stone-800/50 text-center transition-colors" title={`${rowChar} & ${colChar}: ${weight} scene${weight !== 1 ? 's' : ''}`}>
                      <div 
                        className="w-full h-8 min-w-[32px] flex items-center justify-center rounded transition-colors"
                        style={{ backgroundColor: weight > 0 ? `rgba(99, 102, 241, ${opacity})` : 'transparent' }}
                      >
                        {weight > 0 && <span className={`${opacity > 0.6 ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}>{weight}</span>}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
