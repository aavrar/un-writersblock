const RHETORICAL_PATTERNS = [
  /\bwhat (would|could|should|will|might|does|did|is|was|are|were)\b/i,
  /\bwhy (would|could|should|will|might|does|did|is|was|are|were)\b/i,
  /\bhow (would|could|should|will|might|does|did|is|was|are|were)\b/i,
  /\bwho (would|could|should|will|might|does|did|is|was|are|were)\b/i,
  /\bwhether\b/i,
  /\bwondered (if|whether|what|why|how|who|when)\b/i,
  /\bdidn't know (if|whether|what|why|how|who|when)\b/i,
  /\bnever (knew|found out|learned|understood)\b/i,
]

export function detectQuestions(chapters, currentIndex) {
  const questions = []

  for (let i = 0; i <= currentIndex; i++) {
    const chapter = chapters[i]
    const fullText = chapter.paragraphs.join(' ')

    const sentences = fullText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)

    for (const sentence of sentences) {
      const isDirectQuestion = sentence.endsWith('?')
      const isRhetorical = RHETORICAL_PATTERNS.some(p => p.test(sentence))

      if (isDirectQuestion || isRhetorical) {
        const alreadyAnswered = chapters
          .slice(i + 1, currentIndex + 1)
          .some(laterChapter => {
            const laterText = laterChapter.paragraphs.join(' ')
            const keyWords = sentence
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .split(/\s+/)
              .filter(w => w.length > 4)
              .slice(0, 4)
            return keyWords.filter(w => laterText.toLowerCase().includes(w)).length >= 2
          })

        if (!alreadyAnswered) {
          questions.push({
            sentence: sentence.length > 160 ? sentence.slice(0, 157) + '...' : sentence,
            chapterIndex: i,
            chapterTitle: chapter.title,
          })
        }
      }
    }
  }

  return questions.slice(-12)
}
