import { describe, it, expect, beforeEach } from "vitest"
import { loadSettings, saveSettings } from "../storage"
import { DEFAULT_SETTINGS } from "@/lib/types"
import type { Settings } from "@/lib/types"

describe("loadSettings", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns default settings when localStorage is empty", () => {
    const settings = loadSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it("returns default settings for invalid JSON", () => {
    localStorage.setItem("drowssap-settings", "not-json")
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it("returns default settings for wrong version", () => {
    localStorage.setItem(
      "drowssap-settings",
      JSON.stringify({ version: 99, mode: "pin" })
    )
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it("merges partial settings with defaults", () => {
    const partial = { version: 1, mode: "pin" as const }
    localStorage.setItem("drowssap-settings", JSON.stringify(partial))
    const settings = loadSettings()
    expect(settings.mode).toBe("pin")
    expect(settings.random).toEqual(DEFAULT_SETTINGS.random)
    expect(settings.memorable).toEqual(DEFAULT_SETTINGS.memorable)
    expect(settings.pronounceable).toEqual(DEFAULT_SETTINGS.pronounceable)
    expect(settings.pin).toEqual(DEFAULT_SETTINGS.pin)
  })

  it("deep merges nested random settings", () => {
    const partial = {
      version: 1,
      random: { length: 50 },
    }
    localStorage.setItem("drowssap-settings", JSON.stringify(partial))
    const settings = loadSettings()
    expect(settings.random.length).toBe(50)
    expect(settings.random.includeLower).toBe(
      DEFAULT_SETTINGS.random.includeLower
    )
  })

  it("handles null parsed value", () => {
    localStorage.setItem("drowssap-settings", "null")
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})

describe("saveSettings + loadSettings roundtrip", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("saves and loads settings correctly", () => {
    const custom: Settings = {
      ...DEFAULT_SETTINGS,
      mode: "pin",
      pin: { length: 8 },
    }
    saveSettings(custom)
    const loaded = loadSettings()
    expect(loaded.mode).toBe("pin")
    expect(loaded.pin.length).toBe(8)
  })
})
