import { describe, it, expect } from "vitest"
import { generate } from "../index"
import { DEFAULT_SETTINGS } from "@/lib/types"
import type { Settings } from "@/lib/types"

describe("generate", () => {
  it("generates random password", () => {
    const result = generate(DEFAULT_SETTINGS)
    expect(result.mode).toBe("random")
    expect(result.value.length).toBe(20)
    expect(result.id).toBeTruthy()
    expect(result.entropyBits).toBeGreaterThan(0)
    expect(result.strengthLabel).toBeTruthy()
    expect(result.crackTimeEstimate).toBeTruthy()
    expect(result.createdAt).toBeGreaterThan(0)
    expect(result.composition).toBeDefined()
  })

  it("generates memorable passphrase", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, mode: "memorable" }
    const result = generate(settings)
    expect(result.mode).toBe("memorable")
    expect(result.value).toBeTruthy()
    expect(result.composition).toBeDefined()
  })

  it("generates pronounceable password", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, mode: "pronounceable" }
    const result = generate(settings)
    expect(result.mode).toBe("pronounceable")
    expect(result.value.length).toBeGreaterThan(0)
    expect(result.composition).toBeDefined()
  })

  it("generates PIN", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, mode: "pin" }
    const result = generate(settings)
    expect(result.mode).toBe("pin")
    expect(result.value).toMatch(/^[0-9]+$/)
    expect(result.composition?.numbers).toBe(result.value.length)
  })

  it("includes entropy calculation", () => {
    const result = generate(DEFAULT_SETTINGS)
    // 20 chars from ~94 char pool should be well over 100 bits
    expect(result.entropyBits).toBeGreaterThan(50)
  })

  it("includes crack time estimate", () => {
    const result = generate(DEFAULT_SETTINGS)
    expect(result.crackTimeEstimate).toBeTruthy()
    expect(result.crackTimeEstimate).not.toBe("instant")
  })

  it("generates unique IDs", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 30; i++) {
      ids.add(generate(DEFAULT_SETTINGS).id)
    }
    expect(ids.size).toBe(30)
  })
})
