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
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what', 'whatever',
  'someone', 'everyone', 'anyone', 'no', 'nobody', 'nothing', 'everything', 'something', 'anything',
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now',
  'made', 'make', 'do', 'does', 'did', 'done', 'go', 'goes', 'went', 'gone', 'see', 'saw', 'seen', 'look', 'looks', 'looked', 'say', 'says', 'said', 'tell', 'tells', 'told', 'speak', 'speaks', 'spoke', 'spoken', 'talk', 'talks', 'talked', 'men', 'women', 'boy', 'girl', 'man', 'woman', 'kids', 'kid', 'child', 'children',
  'dad', 'mom', 'papa', 'mama', 'father', 'mother', 'americans', 'quran', 'pokemon'
])

const HONORIFICS = new Set([
  'god', 'lord', 'sir', 'mr', 'mrs', 'ms', 'dr', 'prof', 'phd',
  'tío', 'tía', 'doña', 'don', 'baba', 'mama', 'abuela', 'abuelo', 'olu', 'chief',
  'aunt', 'auntie', 'uncle', 'cousin', 'brother', 'sister', 'father', 'mother'
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
    .map(name => {
      // Gracefully strip cultural or formal honorifics rather than rejecting the name outright
      const parts = name.split(/\s+/)
      if (parts.length > 1 && HONORIFICS.has(parts[0].toLowerCase())) {
        return parts.slice(1).join(' ')
      }
      return name
    })
    .filter(name => {
      if (name.length < 2) return false
      if (/^[a-z]/.test(name)) return false
      if (/[—\-"']/.test(name)) return false
      if (/[.!?;:]/.test(name)) return false // Strip cross-sentence punctuation bleeds like "Amina. It"
      if (name.split(/\s+/).length > 2) return false
      const lower = name.toLowerCase()
      if (NOISE_WORDS.has(lower)) return false
      if (places.has(lower) || orgs.has(lower)) return false
      if (/^\d/.test(name)) return false
      return true
    })

  // 2. Anti-Bias Heuristics (Unicode-aware & Dialogue tags)
  const speechVerbs = ['said', 'asked', 'replied', 'shouted', 'murmured', 'whispered', 'cried', 'sighed', 'yelled', 'answered', 'muttered', 'demanded']
  const speechPattern = `(?:${speechVerbs.join('|')})`

  // Mid-sentence capitalized words (strictly TWO words to prevent standard word captures) following a lowercase letter
  const midSentenceRegex = /(?<=[a-z]\s+)[\p{Lu}][\p{Ll}]+\s+[\p{Lu}][\p{Ll}]+/gu
  // Dialogue Tags (e.g. "said Kwame" or "Alejandro asked")
  const verbBeforeRegex = new RegExp(`(?<=\\b${speechPattern}\\s+)[\\p{Lu}][\\p{Ll}]+(?:\\s+[\\p{Lu}][\\p{Ll}]+)?`, 'gu')
  const verbAfterRegex = new RegExp(`[\\p{Lu}][\\p{Ll}]+(?:\\s+[\\p{Lu}][\\p{Ll}]+)?(?=\\s+${speechPattern}\\b)`, 'gu')

  const verbBeforeRaw = rawText.match(verbBeforeRegex) || []
  const verbAfterRaw = rawText.match(verbAfterRegex) || []

  const extraMatches = [
    ...(rawText.match(midSentenceRegex) || []),
    ...verbBeforeRaw,
    ...verbAfterRaw
  ].map(cleanName)

  for (const match of extraMatches) {
    const lower = match.toLowerCase()
    if (!places.has(lower) && !orgs.has(lower) && !NOISE_WORDS.has(lower) && !HONORIFICS.has(lower.split(' ')[0])) {
      cleaned.push(match)
    }
  }

  // Layer 2: greedy single-cap candidates — graduate only via dialogue tag confirmation
  const dialoguePromoted = new Set([...verbBeforeRaw, ...verbAfterRaw].map(cleanName))
  const singleCapRegex = /(?<=[a-z]\s+)[\p{Lu}][\p{Ll}]+/gu
  const layer2Graduates = (normalizedText.match(singleCapRegex) || [])
    .map(cleanName)
    .filter(name => {
      if (name.length < 2) return false
      const lower = name.toLowerCase()
      if (NOISE_WORDS.has(lower)) return false
      if (HONORIFICS.has(lower)) return false
      if (places.has(lower) || orgs.has(lower)) return false
      return dialoguePromoted.has(name)
    })

  for (const name of layer2Graduates) {
    cleaned.push(name)
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
