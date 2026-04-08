import { describe, it, expect } from "vitest"
import { generateRandomPassword } from "../random"
import type { RandomSettings } from "@/lib/types"

const baseSettings: RandomSettings = {
  length: 20,
  includeLower: true,
  includeUpper: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
  customExclusions: "",
  startWithLetter: false,
}

describe("generateRandomPassword", () => {
  it("generates password of correct length", () => {
    const result = generateRandomPassword(baseSettings)
    expect(result.value.length).toBe(20)
  })

  it("clamps length to minimum 4", () => {
    const result = generateRandomPassword({ ...baseSettings, length: 1 })
    expect(result.value.length).toBe(4)
  })

  it("clamps length to maximum 128", () => {
    const result = generateRandomPassword({ ...baseSettings, length: 200 })
    expect(result.value.length).toBe(128)
  })

  it("includes lowercase when enabled", () => {
    for (let i = 0; i < 20; i++) {
      const result = generateRandomPassword(baseSettings)
      expect(/[a-z]/.test(result.value)).toBe(true)
    }
  })

  it("includes uppercase when enabled", () => {
    for (let i = 0; i < 20; i++) {
      const result = generateRandomPassword(baseSettings)
      expect(/[A-Z]/.test(result.value)).toBe(true)
    }
  })

  it("includes numbers when enabled", () => {
    for (let i = 0; i < 20; i++) {
      const result = generateRandomPassword(baseSettings)
      expect(/[0-9]/.test(result.value)).toBe(true)
    }
  })

  it("includes symbols when enabled", () => {
    for (let i = 0; i < 20; i++) {
      const result = generateRandomPassword(baseSettings)
      expect(/[^a-zA-Z0-9]/.test(result.value)).toBe(true)
    }
  })

  it("generates lowercase-only password", () => {
    const settings: RandomSettings = {
      ...baseSettings,
      includeLower: true,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
    }
    for (let i = 0; i < 10; i++) {
      const result = generateRandomPassword(settings)
      expect(result.value).toMatch(/^[a-z]+$/)
    }
  })

  it("applies custom exclusions", () => {
    const settings: RandomSettings = {
      ...baseSettings,
      customExclusions: "aeiouAEIOU",
    }
    for (let i = 0; i < 10; i++) {
      const result = generateRandomPassword(settings)
      expect(result.value).not.toMatch(/[aeiouAEIOU]/)
    }
  })

  it("excludes ambiguous characters when enabled", () => {
    const settings: RandomSettings = {
      ...baseSettings,
      excludeAmbiguous: true,
    }
    const ambiguous = "Il1O0o"
    for (let i = 0; i < 20; i++) {
      const result = generateRandomPassword(settings)
      for (const ch of ambiguous) {
        expect(result.value).not.toContain(ch)
      }
    }
  })

  it("starts with letter when startWithLetter is true", () => {
    const settings: RandomSettings = {
      ...baseSettings,
      startWithLetter: true,
    }
    for (let i = 0; i < 30; i++) {
      const result = generateRandomPassword(settings)
      expect(result.value[0]).toMatch(/[a-zA-Z]/)
    }
  })

  it("returns valid poolSize", () => {
    const result = generateRandomPassword(baseSettings)
    expect(result.poolSize).toBeGreaterThan(0)
  })

  it("returns composition counts", () => {
    const result = generateRandomPassword(baseSettings)
    expect(result.composition.letters).toBeGreaterThan(0)
    expect(
      result.composition.letters +
        result.composition.numbers +
        result.composition.symbols
    ).toBe(result.value.length)
  })

  it("generates unique passwords", () => {
    const passwords = new Set<string>()
    for (let i = 0; i < 50; i++) {
      passwords.add(generateRandomPassword(baseSettings).value)
    }
    expect(passwords.size).toBe(50)
  })
})
