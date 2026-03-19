import { analyzeSentiment } from './AfinnSentiment'

export function computeStats(paragraphs, scenes) {
  const fullText = paragraphs.join(' ')

  const wordCount = fullText.split(/\s+/).filter(Boolean).length
  const paragraphCount = paragraphs.length
  const sceneCount = scenes.length

  const sentences = fullText
    .split(/(?<=[.!?]+)\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  const sentenceLengths = sentences
    .map(s => s.split(/\s+/).filter(Boolean).length)
    .filter(len => len > 0)

  const sentenceSentiment = sentences.map(s => {
    return analyzeSentiment(s).comparative
  })

  const dialogueParagraphs = paragraphs.filter(p => /^[\u201C\u0022]/.test(p.trim())).length
  const dialogueRatio = paragraphs.length > 0 ? Math.round((dialogueParagraphs / paragraphs.length) * 100) : 0

  const allWords = fullText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  const lexicalDensity = allWords.length > 0 ? Math.round((new Set(allWords).size / allWords.length) * 100) : 0

  return { wordCount, paragraphCount, sceneCount, sentenceLengths, sentenceSentiment, sentences, dialogueRatio, lexicalDensity }
}
