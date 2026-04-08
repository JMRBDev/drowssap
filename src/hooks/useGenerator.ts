import { useState, useCallback } from "react"
import type { Settings, GeneratedResult } from "@/lib/types"
import { generate as generatePassword } from "@/lib/generator"

export function useGenerator() {
  const [activeResult, setActiveResult] = useState<GeneratedResult | null>(null)
  const [password, setPassword] = useState<GeneratedResult | null>(null)

  const generate = useCallback((settings: Settings) => {
    setPassword(() => {
      const result = generatePassword(settings)
      setActiveResult(result ?? null)
      return result
    })
  }, [])

  const setActive = useCallback((result: GeneratedResult) => {
    setActiveResult(result)
  }, [])

  const clearActive = useCallback(() => {
    setActiveResult(null)
    setPassword(null)
  }, [])

  return {
    activeResult,
    password,
    generate,
    setActive,
    clearActive,
  } as const
}
