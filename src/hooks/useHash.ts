import { useState, useCallback } from "react"
import { generateHash, formatHash } from "@/lib/hash"

export function useHash() {
  const [hash, setHash] = useState<string | null>(null)
  const [showHash, setShowHash] = useState(false)

  const generateAndShow = useCallback(async (value: string) => {
    try {
      const h = await generateHash(value)
      setHash(h)
      setShowHash(true)
    } catch {
      // hash generation failed - don't clear the active result
    }
  }, [])

  const hide = useCallback(() => {
    setShowHash(false)
  }, [])

  const clear = useCallback(() => {
    setHash(null)
    setShowHash(false)
  }, [])

  const formattedHash = hash ? formatHash(hash) : null

  return {
    hash,
    showHash,
    formattedHash,
    generateAndShow,
    hide,
    clear,
  } as const
}
