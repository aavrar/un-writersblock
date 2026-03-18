export default function DanglingQuestions({ questions }) {
  if (!questions || questions.length === 0) return null

  return (
    <section>
      <h2 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-3">
        Open questions
      </h2>
      <div className="space-y-3">
        {questions.map(({ sentence, chapterIndex, chapterTitle }, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-xs text-stone-300 mt-0.5 shrink-0 w-16 text-right">
              ch. {chapterIndex + 1}
            </span>
            <p className="text-sm text-stone-600 leading-snug">{sentence}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
