import { useState, useCallback, useEffect } from "react"
import { loadPresets, savePresets } from "@/lib/storage"
import type { Preset, Settings } from "@/lib/types"
import {
  createPreset,
  deletePreset,
  renamePreset,
  validatePresetName,
} from "@/lib/presets"

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>(loadPresets)

  useEffect(() => {
    savePresets(presets)
  }, [presets])

  const addPreset = useCallback(
    (name: string, settings: Settings, overwrite = false) => {
      const trimmed = name.trim()
      if (!trimmed || trimmed.length > 50)
        return {
          success: false as const,
          error: "Name must be 1-50 characters",
        }

      const existing = presets.find(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase()
      )
      if (existing && !overwrite) {
        return {
          success: false as const,
          error:
            "A preset with this name already exists. Use overwrite to update it.",
          existingId: existing.id,
        }
      }

      if (existing && overwrite) {
        setPresets((prev) =>
          prev.map((p) =>
            p.id === existing.id
              ? {
                  ...p,
                  name: trimmed,
                  settings: structuredClone(settings),
                  updatedAt: Date.now(),
                }
              : p
          )
        )
        return { success: true as const, preset: existing }
      }

      const preset = createPreset(name, settings)
      setPresets((prev) => [...prev, preset])
      return { success: true as const, preset }
    },
    [presets]
  )

  const removePreset = useCallback((id: string) => {
    setPresets((prev) => deletePreset(prev, id))
  }, [])

  const updatePresetName = useCallback(
    (id: string, newName: string) => {
      const validation = validatePresetName(newName, presets, id)
      if (!validation.valid)
        return { success: false as const, error: validation.error }
      setPresets((prev) =>
        prev.map((p) => (p.id === id ? renamePreset(p, newName) : p))
      )
      return { success: true as const }
    },
    [presets]
  )

  const validateName = useCallback(
    (name: string, excludeId?: string) => {
      return validatePresetName(name, presets, excludeId)
    },
    [presets]
  )

  return {
    presets,
    addPreset,
    removePreset,
    updatePresetName,
    validateName,
  } as const
}
