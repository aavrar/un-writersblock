export function computeStats(paragraphs, scenes) {
  const fullText = paragraphs.join(' ')

  const wordCount = fullText.split(/\s+/).filter(Boolean).length
  const paragraphCount = paragraphs.length
  const sceneCount = scenes.length

  const sentenceLengths = fullText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.split(/\s+/).filter(Boolean).length)
    .filter(len => len > 0)

  return { wordCount, paragraphCount, sceneCount, sentenceLengths }
}
