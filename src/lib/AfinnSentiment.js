// Extracts the raw JSON dictionaries from the installed module before removing it, 
// or if uninstalled, we can supply the basic fallback (AFINN-165).
// Actually, I should just embed the most heavy-hitting sentiment words if it's uninstalled, or use the JSON file since we haven't uninstalled yet.
// Wait, I will uninstall `sentiment` so I should copy the JSON directly into this file or bring the dependency back?
// Let's keep `sentiment` installed purely as a data-store dependency so Vercel can resolve it,
// OR since it's just a JSON dictionary, importing it dynamically works if it is installed.

import labels from 'sentiment/languages/en/labels.json'
import emojis from 'sentiment/build/emoji.json'

// Spread into a fresh object to prevent Vite Rollup frozen module mutations
const DICT = { ...labels, ...emojis }

const NEGATORS = new Set([
    'cant', 'can\'t', 'dont', 'don\'t', 'doesnt', 'doesn\'t', 'not', 'non',
    'wont', 'won\'t', 'isnt', 'isn\'t', 'never', 'nobody', 'none', 'nothing',
    'nowhere', 'hardly', 'barely', 'scarcely', 'without'
])

export function analyzeSentiment(text) {
    // Tokenize carefully, preserve internal apostrophes but remove bounding punctuation
    const words = text.toLowerCase()
        .replace(/[^a-z0-9\s'’]/g, '')
        .split(/\s+/)
        .filter(Boolean)

    let score = 0
    let matched = 0

    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (DICT[word] !== undefined) {
            let val = DICT[word]

            // Lookbehind for simple negations (e.g. "not good")
            if (i > 0 && NEGATORS.has(words[i - 1])) {
                val = -val
            } else if (i > 1 && NEGATORS.has(words[i - 2])) {
                val = -val
            }

            score += val
            matched++
        }
    }

    return { comparative: words.length > 0 ? score / words.length : 0 }
}
