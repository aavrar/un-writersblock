import mammoth from 'mammoth'

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function tokenize(text) {
  return normalize(text).split(/\s+/).filter(t => t.length > 2)
}

function looksLikeHeader(line) {
  if (/^(chapter|part|section|act|prologue|epilogue|interlude)\s*[\d:]/i.test(line)) return true
  if (line.endsWith(':')) return true
  if (line.length < 55 && !/[,;]/.test(line) && !/\.\s/.test(line)) return true
  return false
}

function parseSections(lines) {
  const sections = []
  let current = null

  for (const line of lines) {
    if (!line.trim()) continue
    if (looksLikeHeader(line)) {
      current = { header: line, beats: [] }
      sections.push(current)
    } else {
      if (!current) {
        current = { header: '', beats: [] }
        sections.push(current)
      }
      current.beats.push(line)
    }
  }

  return sections.filter(s => s.beats.length > 0)
}

function extractNumbers(text) {
  return (text.match(/\d+/g) || []).map(Number)
}

function matchSection(chapterTitle, sections) {
  const normalizedTitle = normalize(chapterTitle)
  const titleTokens = new Set(tokenize(chapterTitle))
  const titleNumbers = extractNumbers(chapterTitle)

  let bestSection = null
  let bestScore = 0

  for (const section of sections) {
    const strippedHeader = section.header.replace(/^(chapter|part|section|act|interlude|prologue|epilogue)\s*\d*\s*[:.-]?\s*/i, '')
    const headerTokens = tokenize(strippedHeader)
    const headerNumbers = extractNumbers(section.header)
    const normalizedHeader = normalize(section.header)

    let score = 0

    const sharedTokens = headerTokens.filter(t => titleTokens.has(t))
    if (titleTokens.size > 0) score += (sharedTokens.length / titleTokens.size) * 0.6

    if (titleNumbers.length > 0 && headerNumbers.length > 0) {
      const numberMatch = titleNumbers.some(n => headerNumbers.includes(n))
      if (numberMatch) score += 0.4
    }

    if (normalizedHeader.includes(normalizedTitle) || normalizedTitle.includes(normalizedHeader)) {
      score += 0.5
    }

    const titleKeyword = normalizedTitle.split(/\s+/)[0]
    if (titleKeyword && normalizedHeader.includes(titleKeyword)) score += 0.2

    if (score > bestScore) {
      bestScore = score
      bestSection = section
    }
  }

  return bestScore >= 0.25 ? bestSection : null
}

function tokenize4(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 3)
}

function beatCoverage(beat, chapterText) {
  const beatTokens = tokenize4(beat)
  const chapterTokens = new Set(tokenize4(chapterText))
  if (beatTokens.length === 0) return 0
  const matched = beatTokens.filter(t => chapterTokens.has(t))
  return matched.length / beatTokens.length
}

async function extractLines(arrayBuffer) {
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.body.children).map(el => el.textContent.trim()).filter(Boolean)
}

export async function parseOutline(arrayBuffer) {
  const lines = await extractLines(arrayBuffer)
  return parseSections(lines)
}

export function parseOutlineText(rawText) {
  const lines = rawText
    .split('\n')
    .map(line => line.replace(/^[-*•]+\s*/, '').trim())
    .filter(Boolean)
  return parseSections(lines)
}

export function diffOutlineAgainstChapter(sections, chapterTitle, chapterParagraphs) {
  const section = matchSection(chapterTitle, sections)
  if (!section) return { section: null, results: [] }

  const chapterText = chapterParagraphs.join(' ')
  const THRESHOLD = 0.45

  const results = section.beats.map(beat => ({
    beat,
    covered: beatCoverage(beat, chapterText) >= THRESHOLD,
  }))

  return { section, results }
}
