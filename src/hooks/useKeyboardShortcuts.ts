import { useMountEffect } from "@/hooks/useMountEffect"
import { useLatest } from "@/hooks/useLatest"

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return !!target.closest("input, textarea, select, [contenteditable='true']")
}

function hasSelection(): boolean {
  const selection = window.getSelection()
  return !!selection && selection.toString().length > 0
}

type ShortcutHandlers = {
  onGenerate: () => void
  onCopy: () => void
  onEscape: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useLatest(handlers)

  useMountEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (isEditableTarget(e.target)) return

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault()
        handlersRef.current.onGenerate()
        return
      }

      if (mod && e.key.toLowerCase() === "c" && !hasSelection()) {
        e.preventDefault()
        handlersRef.current.onCopy()
        return
      }

      if (e.key === "Escape") {
        e.preventDefault()
        handlersRef.current.onEscape()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })
}
