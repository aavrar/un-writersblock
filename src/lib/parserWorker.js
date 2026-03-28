import { detectScenes } from './detectScenes'
import { detectCharacters } from './detectCharacters'
import { computeStats } from './computeStats'
import { diffArrays } from 'diff'

self.addEventListener('message', (e) => {
    const { type, payload } = e.data

    if (type === 'analyze') {
        const { chapters, rules, previousChapters = [] } = payload
        const analyzed = chapters.map(chapter => {
            const scenes = chapter.scenes || detectScenes(chapter.paragraphs)
            const characters = detectCharacters(chapter.paragraphs, rules)
            const scenesWithCharacters = scenes.map(scene => ({
                ...scene,
                characters: detectCharacters(scene.paragraphs, rules)
            }))
            const stats = computeStats(chapter.paragraphs, scenesWithCharacters)

            let chapterDiff = null
            const oldChapter = previousChapters.find(c => c.title === chapter.title)
            
            if (oldChapter) {
                try {
                    const changes = diffArrays(oldChapter.paragraphs, chapter.paragraphs)
                    let addedWords = 0
                    let removedWords = 0

                    const paragraphDeltas = changes.flatMap(change => {
                        const wordCount = change.value.join(' ').split(/\s+/).filter(Boolean).length
                        if (change.added) addedWords += wordCount
                        else if (change.removed) removedWords += wordCount
                        
                        return change.value.map(p => ({
                           text: p,
                           type: change.added ? 'added' : change.removed ? 'removed' : 'unchanged'
                        }))
                    })

                    if (addedWords > 0 || removedWords > 0) {
                       chapterDiff = { addedWords, removedWords, paragraphDeltas }
                    }
                } catch (err) {
                    console.error('Ghost Delta failed:', err)
                }
            }

            return { ...chapter, scenes: scenesWithCharacters, characters, stats, diff: chapterDiff }
        })

        self.postMessage({ type: 'done', payload: analyzed })
    }
})
