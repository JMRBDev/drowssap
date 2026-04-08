import { useState, useCallback } from "react"
import { loadSettings, saveSettings } from "@/lib/storage"
import type { Settings } from "@/lib/types"
import { DEFAULT_SETTINGS } from "@/lib/types"

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  partial: DeepPartial<T>
): T {
  const result = { ...base }
  for (const key of Object.keys(partial) as (keyof T)[]) {
    const partialVal = partial[key]
    const baseVal = base[key]
    if (
      partialVal !== undefined &&
      typeof partialVal === "object" &&
      partialVal !== null &&
      !Array.isArray(partialVal) &&
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        partialVal as DeepPartial<Record<string, unknown>>
      ) as T[keyof T]
    } else if (partialVal !== undefined) {
      result[key] = partialVal as T[keyof T]
    }
  }
  return result
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((partial: DeepPartial<Settings>) => {
    let newSettings: Settings
    setSettings((prev) => {
      newSettings = deepMerge(prev, partial)
      return newSettings
    })
    saveSettings(newSettings!)
    return newSettings!
  }, [])

  const resetSettings = useCallback(() => {
    const newSettings = { ...DEFAULT_SETTINGS }
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [])

  return { settings, updateSettings, resetSettings } as const
}
