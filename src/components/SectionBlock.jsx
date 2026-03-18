import { useLocalStorage } from '../hooks/useLocalStorage'

export default function SectionBlock({ id, title, defaultOpen = false, action, children }) {
  const [open, setOpen] = useLocalStorage(`section_open_${id}`, defaultOpen)

  return (
    <section>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <h2 className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-medium group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {action}
          <span className="text-stone-300 dark:text-stone-600 text-sm leading-none transition-colors">{open ? '−' : '+'}</span>
        </div>
      </button>
      {open && children}
    </section>
  )
}
