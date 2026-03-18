import Sentiment from 'sentiment'

const sentimentAnalyser = new Sentiment()

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
    const res = sentimentAnalyser.analyze(s)
    return res.comparative
  })

  return { wordCount, paragraphCount, sceneCount, sentenceLengths, sentenceSentiment, sentences }
}
