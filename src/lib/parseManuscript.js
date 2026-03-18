import mammoth from 'mammoth'

export async function parseManuscript(arrayBuffer) {
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const children = Array.from(doc.body.children)

  const chapters = []
  let currentChapter = null

  for (const el of children) {
    const tag = el.tagName.toLowerCase()
    const text = el.textContent.trim()

    if (tag === 'h1' && text) {
      currentChapter = { title: text, paragraphs: [] }
      chapters.push(currentChapter)
    } else if (text) {
      if (!currentChapter) {
        currentChapter = { title: '[Preamble]', paragraphs: [] }
        chapters.push(currentChapter)
      }
      currentChapter.paragraphs.push(text)
    }
  }

  const hasHeadings = chapters.length > 1 || (chapters.length === 1 && chapters[0].title !== '[Preamble]')

  if (!hasHeadings) {
    const allParagraphs = chapters.flatMap(c => c.paragraphs)
    return { chapters: null, allParagraphs, hasHeadings: false }
  }

  return { chapters, allParagraphs: null, hasHeadings: true }
}

export function buildChaptersFromBoundaries(allParagraphs, boundaryIndices) {
  const boundaries = [...new Set([0, ...boundaryIndices])].sort((a, b) => a - b)
  return boundaries.map((start, i) => {
    const end = boundaries[i + 1] ?? allParagraphs.length
    return {
      title: `Chapter ${i + 1}`,
      paragraphs: allParagraphs.slice(start, end),
    }
  })
}
