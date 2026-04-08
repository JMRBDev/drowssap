import { useState, useCallback, useRef } from "react"
import { copyToClipboard, scheduleClipboardClear } from "@/lib/clipboard"

export function useClipboard() {
  const [copied, setCopied] = useState(false)
  const cancelRef = useRef<(() => void) | null>(null)

  const copy = useCallback(async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)

      if (cancelRef.current) {
        cancelRef.current()
      }
      cancelRef.current = scheduleClipboardClear(30000)

      setTimeout(() => setCopied(false), 2000)
    }
    return success
  }, [])

  const clearCopied = useCallback(() => {
    setCopied(false)
    if (cancelRef.current) {
      cancelRef.current()
      cancelRef.current = null
    }
  }, [])

  return { copied, copy, clearCopied } as const
}
