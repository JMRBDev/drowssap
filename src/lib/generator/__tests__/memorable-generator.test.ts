import { describe, it, expect } from "vitest"
import { generateMemorablePassphrase, isWordlistAvailable } from "../memorable"
import type { MemorableSettings } from "@/lib/types"

const baseSettings: MemorableSettings = {
  words: 4,
  caseStyle: "lower",
  separator: "hyphen",
  customSeparator: "",
  leet: false,
}

describe("isWordlistAvailable", () => {
  it("returns true when wordlist is loaded", () => {
    expect(isWordlistAvailable()).toBe(true)
  })
})

describe("generateMemorablePassphrase", () => {
  it("generates correct number of words with hyphen separator", () => {
    const result = generateMemorablePassphrase(baseSettings)
    const words = result.value.split("-")
    expect(words.length).toBe(4)
  })

  it("uses space separator", () => {
    const settings: MemorableSettings = { ...baseSettings, separator: "space" }
    const result = generateMemorablePassphrase(settings)
    expect(result.value).toContain(" ")
    expect(result.value.split(" ").length).toBe(4)
  })

  it("uses dot separator", () => {
    const settings: MemorableSettings = { ...baseSettings, separator: "dot" }
    const result = generateMemorablePassphrase(settings)
    expect(result.value).toContain(".")
  })

  it("uses underscore separator", () => {
    const settings: MemorableSettings = {
      ...baseSettings,
      separator: "underscore",
    }
    const result = generateMemorablePassphrase(settings)
    expect(result.value).toContain("_")
  })

  it("uses custom separator", () => {
    const settings: MemorableSettings = {
      ...baseSettings,
      separator: "custom",
      customSeparator: "***",
    }
    const result = generateMemorablePassphrase(settings)
    expect(result.value).toContain("***")
  })

  it("applies lowercase style", () => {
    const settings: MemorableSettings = { ...baseSettings, caseStyle: "lower" }
    const result = generateMemorablePassphrase(settings)
    expect(result.value).toBe(result.value.toLowerCase())
  })

  it("applies uppercase style", () => {
    const settings: MemorableSettings = { ...baseSettings, caseStyle: "upper" }
    const result = generateMemorablePassphrase(settings)
    // Words (not separators) should be uppercase
    const words = result.value.split("-")
    for (const word of words) {
      expect(word).toBe(word.toUpperCase())
    }
  })

  it("applies titlecase style", () => {
    const settings: MemorableSettings = { ...baseSettings, caseStyle: "title" }
    const result = generateMemorablePassphrase(settings)
    const words = result.value.split("-")
    for (const word of words) {
      expect(word[0]).toBe(word[0].toUpperCase())
    }
  })

  it("applies leet speak", () => {
    const settings: MemorableSettings = { ...baseSettings, leet: true }
    // Run multiple times to ensure at least one leet substitution
    let hasLeet = false
    for (let i = 0; i < 50; i++) {
      const result = generateMemorablePassphrase(settings)
      if (/@|3|1|0|5|7/.test(result.value)) {
        hasLeet = true
        break
      }
    }
    expect(hasLeet).toBe(true)
  })

  it("clamps word count to minimum 2", () => {
    const settings: MemorableSettings = { ...baseSettings, words: 0 }
    const result = generateMemorablePassphrase(settings)
    expect(result.value.split("-").length).toBeGreaterThanOrEqual(2)
  })

  it("clamps word count to maximum 20", () => {
    const settings: MemorableSettings = { ...baseSettings, words: 100 }
    const result = generateMemorablePassphrase(settings)
    expect(result.value.split("-").length).toBeLessThanOrEqual(20)
  })

  it("returns composition", () => {
    const result = generateMemorablePassphrase(baseSettings)
    expect(result.composition.letters).toBeGreaterThan(0)
    expect(typeof result.composition.separators).toBe("number")
  })

  it("generates unique passphrases", () => {
    const passphrases = new Set<string>()
    for (let i = 0; i < 30; i++) {
      passphrases.add(generateMemorablePassphrase(baseSettings).value)
    }
    // With 7776 words, 4 words should be very likely unique
    expect(passphrases.size).toBeGreaterThan(25)
  })
})
