import { detectScenes } from './detectScenes'
import { detectCharacters } from './detectCharacters'
import { computeStats } from './computeStats'

self.addEventListener('message', (e) => {
    const { type, payload } = e.data

    if (type === 'analyze') {
        const { chapters, rules } = payload
        const analyzed = chapters.map(chapter => {
            const scenes = chapter.scenes || detectScenes(chapter.paragraphs)
            const characters = detectCharacters(chapter.paragraphs, rules)
            const stats = computeStats(chapter.paragraphs, scenes)
            return { ...chapter, scenes, characters, stats }
        })

        self.postMessage({ type: 'done', payload: analyzed })
    }
})
