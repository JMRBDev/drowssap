import { describe, it, expect } from "vitest"
import { generatePin } from "../pin"
describe("generatePin", () => {
  it("generates PIN of correct length", () => {
    const result = generatePin({ length: 6 })
    expect(result.value.length).toBe(6)
  })

  it("generates digits only", () => {
    for (let i = 0; i < 50; i++) {
      const result = generatePin({ length: 10 })
      expect(result.value).toMatch(/^[0-9]+$/)
    }
  })

  it("clamps to minimum 4 digits", () => {
    const result = generatePin({ length: 1 })
    expect(result.value.length).toBe(4)
  })

  it("clamps to maximum 128 digits", () => {
    const result = generatePin({ length: 200 })
    expect(result.value.length).toBe(128)
  })

  it("generates PIN of length 4", () => {
    const result = generatePin({ length: 4 })
    expect(result.value.length).toBe(4)
    expect(result.value).toMatch(/^[0-9]{4}$/)
  })

  it("generates unique PINs", () => {
    const pins = new Set<string>()
    for (let i = 0; i < 100; i++) {
      pins.add(generatePin({ length: 6 }).value)
    }
    expect(pins.size).toBe(100)
  })
})
