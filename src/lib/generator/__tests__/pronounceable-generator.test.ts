import { describe, it, expect } from "vitest"
import { generatePronounceablePassword } from "../pronounceable"
import type { PronounceableSettings } from "@/lib/types"

const baseSettings: PronounceableSettings = {
  length: 12,
  caseStyle: "lower",
  includeNumbers: false,
  includeSymbols: false,
  excludeAmbiguous: false,
  customExclusions: "",
}

describe("generatePronounceablePassword", () => {
  it("generates password of exact target length", () => {
    const result = generatePronounceablePassword(baseSettings)
    expect(result.value.length).toBe(12)
  })

  it("clamps length to minimum 4", () => {
    const result = generatePronounceablePassword({ ...baseSettings, length: 1 })
    expect(result.value.length).toBeGreaterThanOrEqual(4)
  })

  it("clamps length to maximum 128", () => {
    const result = generatePronounceablePassword({
      ...baseSettings,
      length: 200,
    })
    expect(result.value.length).toBeLessThanOrEqual(128)
  })

  it("applies lowercase style", () => {
    const result = generatePronounceablePassword({
      ...baseSettings,
      caseStyle: "lower",
    })
    expect(result.value).toBe(result.value.toLowerCase())
  })

  it("applies uppercase style", () => {
    const result = generatePronounceablePassword({
      ...baseSettings,
      caseStyle: "upper",
    })
    expect(result.value).toBe(result.value.toUpperCase())
  })

  it("includes numbers when enabled", () => {
    const settings: PronounceableSettings = {
      ...baseSettings,
      includeNumbers: true,
    }
    let hasNumber = false
    for (let i = 0; i < 30; i++) {
      const result = generatePronounceablePassword(settings)
      if (/[0-9]/.test(result.value)) {
        hasNumber = true
        break
      }
    }
    expect(hasNumber).toBe(true)
  })

  it("includes symbols when enabled", () => {
    const settings: PronounceableSettings = {
      ...baseSettings,
      includeSymbols: true,
    }
    let hasSymbol = false
    for (let i = 0; i < 30; i++) {
      const result = generatePronounceablePassword(settings)
      if (/[^a-zA-Z0-9]/.test(result.value)) {
        hasSymbol = true
        break
      }
    }
    expect(hasSymbol).toBe(true)
  })

  it("maintains exact target length with numbers", () => {
    const settings: PronounceableSettings = {
      ...baseSettings,
      includeNumbers: true,
    }
    for (let i = 0; i < 20; i++) {
      const result = generatePronounceablePassword(settings)
      expect(result.value.length).toBe(12)
    }
  })

  it("maintains exact target length with symbols", () => {
    const settings: PronounceableSettings = {
      ...baseSettings,
      includeSymbols: true,
    }
    for (let i = 0; i < 20; i++) {
      const result = generatePronounceablePassword(settings)
      expect(result.value.length).toBe(12)
    }
  })

  it("maintains exact target length with numbers and symbols", () => {
    const settings: PronounceableSettings = {
      ...baseSettings,
      includeNumbers: true,
      includeSymbols: true,
    }
    for (let i = 0; i < 20; i++) {
      const result = generatePronounceablePassword(settings)
      expect(result.value.length).toBe(12)
    }
  })

  it("excludes ambiguous from numbers when enabled", () => {
    const settings: PronounceableSettings = {
      ...baseSettings,
      includeNumbers: true,
      excludeAmbiguous: true,
    }
    for (let i = 0; i < 20; i++) {
      const result = generatePronounceablePassword(settings)
      expect(result.value).not.toContain("1")
      expect(result.value).not.toContain("0")
    }
  })

  it("returns valid poolSize", () => {
    const result = generatePronounceablePassword(baseSettings)
    expect(result.poolSize).toBeGreaterThan(0)
  })

  it("returns composition", () => {
    const result = generatePronounceablePassword(baseSettings)
    expect(typeof result.composition.letters).toBe("number")
    expect(typeof result.composition.numbers).toBe("number")
    expect(typeof result.composition.symbols).toBe("number")
  })

  it("generates unique passwords", () => {
    const passwords = new Set<string>()
    for (let i = 0; i < 50; i++) {
      passwords.add(generatePronounceablePassword(baseSettings).value)
    }
    expect(passwords.size).toBe(50)
  })
})
