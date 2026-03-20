export default function DragHandle({ onDelta }) {
  function handleMouseDown(e) {
    e.preventDefault()
    let lastX = e.clientX

    function onMove(e) {
      onDelta(e.clientX - lastX)
      lastX = e.clientX
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="w-px bg-stone-200 dark:bg-stone-800 hover:bg-indigo-400 dark:hover:bg-indigo-500 cursor-col-resize transition-colors shrink-0 relative group"
    >
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
    </div>
  )
}
