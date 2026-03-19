import nlp from 'compromise'

const NOISE_WORDS = new Set([
  'god', 'lord', 'sir', 'mr', 'mrs', 'ms', 'dr', 'prof', 'phd', 'mba', 'esq',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'american', 'english', 'arabic', 'muslim', 'christian', 'jewish', 'hindu',
  'pakistani', 'indian', 'british', 'french', 'italian', 'mexican',
  'united', 'international', 'national', 'airport', 'states', 'city',
  'new', 'old', 'first', 'last', 'next', 'back',
  'toyota', 'honda', 'suzuki', 'ford', 'bmw', 'mercedes', 'corolla',
  'instagram', 'facebook', 'twitter', 'youtube', 'google', 'apple',
])

function normalizeText(text) {
  return text
    .replace(/[\u2013\u2014]/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
}

function cleanName(raw) {
  return raw
    .replace(/^[\u2018\u2019\u201C\u201D"'\-\u2013\u2014,.:;!?()\[\]{}]+/, '')
    .replace(/[\u2018\u2019\u201C\u201D"'\-\u2013\u2014,.:;!?()\[\]{}]+$/, '')
    .replace(/[''`]s$/i, '')
    .trim()
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function detectCharacters(paragraphs, rules = {}) {
  const rawText = paragraphs.join(' ')
  const normalizedText = normalizeText(rawText)
  const doc = nlp(normalizedText)

  const raw = doc.people().out('array')
  const places = new Set(doc.places().out('array').map(cleanName).map(s => s.toLowerCase()))
  const orgs = new Set(doc.organizations().out('array').map(cleanName).map(s => s.toLowerCase()))

  const cleaned = raw
    .map(cleanName)
    .filter(name => {
      if (name.length < 2) return false
      if (/^[a-z]/.test(name)) return false
      if (/[—\-"']/.test(name)) return false
      if (/[.!?;:]/.test(name)) return false // Strip cross-sentence punctuation bleeds like "Amina. It"
      if (name.split(/\s+/).length > 2) return false
      const lower = name.toLowerCase()
      if (NOISE_WORDS.has(lower)) return false
      if (NOISE_WORDS.has(lower.split(' ')[0])) return false
      if (places.has(lower) || orgs.has(lower)) return false
      if (/^\d/.test(name)) return false
      return true
    })

  // 2. Custom Regex: Consecutive capitalized words NOT at the start of a sentence
  // Lookbehind for a lowercase letter, comma, quote, or colon followed by space
  const regexMatches = rawText.match(/(?<=[a-z,:"”’]\s+)[A-Z][a-z]+\s+[A-Z][a-z]+/g) || []
  for (const match of regexMatches) {
    const lower = match.toLowerCase()
    if (!places.has(lower) && !orgs.has(lower) && !NOISE_WORDS.has(lower) && !NOISE_WORDS.has(lower.split(' ')[0])) {
      cleaned.push(match)
    }
  }

  const dedupedNames = new Set(cleaned)

  // 3. First-Person Narrator Detection ("I" outside of dialogue)
  const nonDialogueText = rawText.replace(/["“”].*?["“”]/g, ' ')
  const narratorCount = (nonDialogueText.match(/\bI\b/g) || []).length
  if (narratorCount > 2) {
    dedupedNames.add('Narrator ("I")')
  }

  for (const [name, rule] of Object.entries(rules)) {
    if (rule.action === 'add') dedupedNames.add(name)
  }

  const deduped = [...dedupedNames]

  const counts = {}
  if (dedupedNames.has('Narrator ("I")')) {
    counts['Narrator ("I")'] = narratorCount
  }

  deduped.forEach(name => {
    if (name === 'Narrator ("I")') return // already counted accurately above
    const c = (rawText.match(new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi')) || []).length
    if (c > 0) {
      let finalName = name
      const rule = rules[name]
      if (rule?.action === 'delete') return
      if (rule?.action === 'merge' && rule.target) finalName = rule.target

      counts[finalName] = (counts[finalName] || 0) + c
    }
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => ({ name: entry[0], count: entry[1] }))
}
