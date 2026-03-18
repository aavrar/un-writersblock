# Manuscript Re-Entry Tool

## What this is
A client-side web app for novelists. You upload your manuscript (.docx exported from Google Docs), it parses it into chapters, and for each chapter shows a structured "re-entry brief" — designed to help you quickly remember where you are and what to write next without re-reading everything.

No server. No AI. No data ever leaves the browser. All analysis is purely algorithmic.

---

## The problem it solves
Opening a long manuscript (80+ pages) and experiencing context-loading paralysis — knowing where the story is going but not being able to figure out what to write next because you can't hold the whole thing in working memory.

---

## Tech stack
- Vite + React (client-side only)
- mammoth.js — parses .docx files in the browser
- compromise — lightweight NLP for character name detection
- Tailwind CSS v3

---

## File structure
```
src/
  lib/
    parseManuscript.js    # mammoth -> Chapter[] (or raw paragraphs if no headings)
    detectScenes.js       # finds scene boundaries within a chapter
    detectCharacters.js   # extracts character names using compromise NER
    computeStats.js       # word count, scene count, sentence lengths for rhythm
  components/
    UploadZone.jsx        # file drop/select UI
    ChapterSplitter.jsx   # manual chapter boundary UI (when no headings found)
    ChapterList.jsx       # sidebar chapter navigation
    ReentryBrief.jsx      # full brief layout, composes the four sections below
    LastScene.jsx         # verbatim last scene in serif font
    CharacterRoster.jsx   # character name pills sorted by frequency
    ChapterStats.jsx      # word count, scene count, paragraph count
    RhythmChart.jsx       # SVG bar chart of sentence lengths
  App.jsx                 # state machine: idle | parsing | splitting | browsing
  main.jsx
```

---

## App states
- **idle** — upload screen
- **parsing** — loading overlay while mammoth processes the file
- **splitting** — shown when no H1 chapter headings found; user manually marks chapter boundaries by clicking paragraphs, or skips to use the whole manuscript as one chapter
- **browsing** — two-column layout: chapter list sidebar + re-entry brief for selected chapter

---

## How chapter detection works
1. mammoth converts .docx to HTML, preserving heading styles
2. H1 elements = chapter boundaries
3. If no H1s found, user enters manual splitting mode where they click paragraphs to mark chapter starts

---

## How scene detection works (within a chapter)
Three passes in order:
1. Explicit break markers (`***`, `---`, `###`)
2. Transition phrase heuristics (~20 regex patterns: "That evening", "The next morning", "Meanwhile", etc.)
3. Fallback: whole chapter = 1 scene

---

## How character detection works
- compromise NLP: `.people()` + `.nouns().isProper()`
- Deduplicated, subset-merged (removes "John" if "John Harmon" also present)
- Frequency-sorted, capped at 20 names

---

## The re-entry brief (per chapter)
Four sections:
1. **Where you left off** — last 3 paragraphs of the last scene, verbatim, in serif font. Toggle to expand.
2. **Characters detected** — name pills, sorted by how often they appear
3. **At a glance** — word count, scene count, paragraph count
4. **Sentence rhythm** — thin SVG bar chart where each bar = one sentence, height = word count. Color bands: short (stone-400), medium (stone-600), long (stone-700). No axes — it reads as texture.

---

## Running it
```
npm install
npm run dev
```

---

## Known limitations / future work
- Character detection is heuristic — compromise may miss unusual names or tag places as people
- Scene detection relies on explicit markers or known transition phrases; non-standard breaks won't be caught
- No outline/notes differ yet (planned: upload a separate notes file, diff its beats against chapter text)
- No persistence — everything resets on page refresh
- No mobile layout
