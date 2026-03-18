import { useRef, useState } from 'react'

export default function UploadZone({ onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file) {
    if (!file || !file.name.endsWith('.docx')) return
    file.arrayBuffer().then(buffer => onFile(buffer, file.name))
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`cursor-pointer border-2 border-dashed rounded-lg px-20 py-16 flex flex-col items-center gap-4 transition-colors ${
          dragging ? 'border-stone-500 bg-stone-100' : 'border-stone-300 bg-white'
        }`}
      >
        <div className="text-stone-400 text-5xl select-none">+</div>
        <p className="text-stone-700 text-lg font-medium">Drop your manuscript here</p>
        <p className="text-stone-400 text-sm">or click to select a .docx file</p>
      </div>
      <p className="mt-6 text-stone-400 text-xs">Your manuscript never leaves this browser.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}
