export function detectThreads(chapters, currentIndex) {
  if (currentIndex === 0) return { reappearing: [], absent: [] }

  const currentCharacters = new Set(chapters[currentIndex].characters)

  const characterHistory = {}
  for (let i = 0; i < currentIndex; i++) {
    for (const name of chapters[i].characters) {
      if (!characterHistory[name]) {
        characterHistory[name] = { firstChapter: i, lastChapter: i }
      } else {
        characterHistory[name].lastChapter = i
      }
    }
  }

  const reappearing = []
  const absent = []

  for (const [name, { firstChapter, lastChapter }] of Object.entries(characterHistory)) {
    if (currentCharacters.has(name)) {
      if (lastChapter < currentIndex - 1) {
        reappearing.push({ name, lastChapter, firstChapter })
      }
    } else {
      absent.push({ name, lastChapter, firstChapter })
    }
  }

  absent.sort((a, b) => b.lastChapter - a.lastChapter)
  reappearing.sort((a, b) => a.lastChapter - b.lastChapter)

  return { reappearing, absent }
}
