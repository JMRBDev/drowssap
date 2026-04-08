import type { Preset, Settings } from "@/lib/types"
import { generateId } from "@/lib/crypto"

export function createPreset(name: string, settings: Settings): Preset {
  const now = Date.now()
  return {
    id: generateId(),
    name: name.trim(),
    settings: structuredClone(settings),
    createdAt: now,
    updatedAt: now,
  }
}

export function deletePreset(presets: Preset[], id: string): Preset[] {
  return presets.filter((p) => p.id !== id)
}

export function renamePreset(preset: Preset, newName: string): Preset {
  return {
    ...preset,
    name: newName.trim(),
    updatedAt: Date.now(),
  }
}

export function validatePresetName(
  name: string,
  existingPresets: Preset[],
  excludeId?: string
): { valid: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, error: "Name is required" }
  if (trimmed.length > 50)
    return { valid: false, error: "Name must be 50 characters or less" }
  if (trimmed.length < 1) return { valid: false, error: "Name is required" }

  const duplicate = existingPresets.find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.id !== excludeId
  )
  if (duplicate)
    return { valid: false, error: "A preset with this name already exists" }

  return { valid: true }
}
