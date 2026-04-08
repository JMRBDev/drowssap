import { describe, it, expect, vi } from "vitest"
import {
  createPreset,
  deletePreset,
  renamePreset,
  validatePresetName,
} from "../presets"
import { DEFAULT_SETTINGS } from "@/lib/types"
import type { Preset, Settings } from "@/lib/types"

// Mock crypto.randomUUID for deterministic tests
const mockUuids = ["uuid-1", "uuid-2", "uuid-3"]
let uuidIndex = 0
vi.stubGlobal("crypto", {
  randomUUID: () => mockUuids[uuidIndex++ % mockUuids.length],
})

function makePreset(id: string, name: string): Preset {
  return {
    id,
    name,
    settings: { ...DEFAULT_SETTINGS },
    createdAt: 1000,
    updatedAt: 1000,
  }
}

describe("createPreset", () => {
  it("creates a preset with trimmed name", () => {
    const preset = createPreset("  My Preset  ", DEFAULT_SETTINGS)
    expect(preset.name).toBe("My Preset")
  })

  it("creates a preset with generated id", () => {
    const preset = createPreset("Test", DEFAULT_SETTINGS)
    expect(preset.id).toBeTruthy()
  })

  it("creates a preset with timestamps", () => {
    const before = Date.now()
    const preset = createPreset("Test", DEFAULT_SETTINGS)
    const after = Date.now()
    expect(preset.createdAt).toBeGreaterThanOrEqual(before)
    expect(preset.createdAt).toBeLessThanOrEqual(after)
    expect(preset.updatedAt).toBe(preset.createdAt)
  })

  it("deep clones settings", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, mode: "pin" }
    const preset = createPreset("Test", settings)
    expect(preset.settings.mode).toBe("pin")
    // Mutating original shouldn't affect preset
    settings.mode = "random"
    expect(preset.settings.mode).toBe("pin")
  })
})

describe("deletePreset", () => {
  it("removes the preset with given id", () => {
    const presets = [makePreset("a", "A"), makePreset("b", "B")]
    const result = deletePreset(presets, "a")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("b")
  })

  it("returns same array if id not found", () => {
    const presets = [makePreset("a", "A")]
    const result = deletePreset(presets, "z")
    expect(result).toHaveLength(1)
  })

  it("does not mutate the original array", () => {
    const presets = [makePreset("a", "A"), makePreset("b", "B")]
    deletePreset(presets, "a")
    expect(presets).toHaveLength(2)
  })
})

describe("renamePreset", () => {
  it("updates the name and timestamp", () => {
    const preset = makePreset("a", "Old")
    const before = Date.now()
    const renamed = renamePreset(preset, "New")
    expect(renamed.name).toBe("New")
    expect(renamed.updatedAt).toBeGreaterThanOrEqual(before)
  })

  it("trims the new name", () => {
    const preset = makePreset("a", "Old")
    const renamed = renamePreset(preset, "  Trimmed  ")
    expect(renamed.name).toBe("Trimmed")
  })

  it("preserves other fields", () => {
    const preset = makePreset("a", "Old")
    const renamed = renamePreset(preset, "New")
    expect(renamed.id).toBe("a")
    expect(renamed.createdAt).toBe(1000)
    expect(renamed.settings).toEqual(preset.settings)
  })
})

describe("validatePresetName", () => {
  const existing: Preset[] = [makePreset("1", "Existing")]

  it("rejects empty name", () => {
    const result = validatePresetName("", existing)
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it("rejects whitespace-only name", () => {
    const result = validatePresetName("   ", existing)
    expect(result.valid).toBe(false)
  })

  it("rejects name over 50 characters", () => {
    const result = validatePresetName("a".repeat(51), existing)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("50")
  })

  it("accepts 50 character name", () => {
    const result = validatePresetName("a".repeat(50), existing)
    expect(result.valid).toBe(true)
  })

  it("rejects duplicate name (case insensitive)", () => {
    const result = validatePresetName("existing", existing)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("already exists")
  })

  it("allows duplicate name when excluding own id", () => {
    const result = validatePresetName("Existing", existing, "1")
    expect(result.valid).toBe(true)
  })

  it("accepts unique name", () => {
    const result = validatePresetName("Unique", existing)
    expect(result.valid).toBe(true)
  })
})
