const EXPLICIT_BREAK = /^\s*([\*\-#~]{3,}|#)\s*$/

const SCENE_NUMBER = /^(scene\s*)?\d{1,3}\.?\s*$/i
const ROMAN_NUMERAL = /^(scene\s*)?(i{1,3}|iv|v?i{0,3}|ix|x{1,3})\s*\.?\s*$/i
const SECTION_WORD = /^(one|two|three|four|five|six|seven|eight|nine|ten|part|chapter|section)\s*\.?\s*$/i

const TRANSITION_OPENERS = [
  /^that (morning|afternoon|evening|night|day)/i,
  /^the next (morning|afternoon|evening|night|day|week|month|year)/i,
  /^later(,| that| —|—)/i,
  /^across (town|the room|the hall|the street|the city|the country|the world)/i,
  /^meanwhile/i,
  /^an? (hour|day|week|month|year|moment|few minutes) later/i,
  /^back at /i,
  /^by the time /i,
  /^(three|two|four|five|six|seven|eight|nine|ten) (days|weeks|months|years|hours)/i,
  /^the following (morning|afternoon|evening|night|day|week)/i,
  /^several (days|weeks|months|hours|minutes) (later|had passed)/i,
  /^a (day|week|month|year|moment|few) (later|had passed|passed)/i,
  /^at (dawn|dusk|midnight|noon|sunrise|sunset|last)/i,
  /^early (the next morning|morning|afternoon|that)/i,
  /^(hours|days|weeks|months|years) later/i,
  /^that same (morning|afternoon|evening|night|day|week)/i,
  /^elsewhere/i,
  /^outside[,\s]/i,
  /^inside[,\s]/i,
  /^upstairs[,\s]/i,
  /^downstairs[,\s]/i,
  /^when (he|she|they|i) (arrived|returned|got|came|walked|left)/i,
  /^after (the|a|an|that|his|her|their)/i,
  /^before (the|a|an|that|his|her|their)/i,
  /^the (morning|afternoon|evening|night|day|week|month|year) (after|before|of)/i,
]

function isTransitionOpener(paragraph) {
  return TRANSITION_OPENERS.some(p => p.test(paragraph))
}

function looksLikeSceneSlug(paragraph) {
  const trimmed = paragraph.trim()
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length
  if (wordCount > 6) return false
  if (SCENE_NUMBER.test(trimmed)) return true
  if (ROMAN_NUMERAL.test(trimmed)) return true
  if (SECTION_WORD.test(trimmed)) return true
  return false
}

export function detectScenes(paragraphs) {
  const boundaryIndices = []

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]
    if (EXPLICIT_BREAK.test(p)) {
      boundaryIndices.push(i + 1)
    } else if (looksLikeSceneSlug(p)) {
      boundaryIndices.push(i)
    } else if (i > 0 && isTransitionOpener(p)) {
      boundaryIndices.push(i)
    }
  }

  const boundaries = [...new Set([0, ...boundaryIndices])].sort((a, b) => a - b)

  return boundaries.map((start, i) => {
    const end = boundaries[i + 1] ?? paragraphs.length
    return {
      startParagraphIndex: start,
      endParagraphIndex: end - 1,
      paragraphs: paragraphs.slice(start, end).filter(p => !EXPLICIT_BREAK.test(p) && !looksLikeSceneSlug(p)),
    }
  }).filter(scene => scene.paragraphs.length > 0)
}
