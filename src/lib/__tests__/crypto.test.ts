import { describe, it, expect } from "vitest"
import {
  getRandomInt,
  shuffleArray,
  getRandomChoice,
  generateId,
} from "../crypto"

describe("getRandomInt", () => {
  it("returns 0 when max is 1", () => {
    expect(getRandomInt(1)).toBe(0)
  })

  it("returns values within [0, max)", () => {
    for (let i = 0; i < 200; i++) {
      const result = getRandomInt(10)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(10)
    }
  })

  it("throws when max is 0", () => {
    expect(() => getRandomInt(0)).toThrow("max must be positive")
  })

  it("throws when max is negative", () => {
    expect(() => getRandomInt(-5)).toThrow("max must be positive")
  })

  it("produces a reasonable distribution", () => {
    const counts = new Array(4).fill(0)
    for (let i = 0; i < 400; i++) {
      counts[getRandomInt(4)]++
    }
    // Each bucket should get roughly 100 ± 50
    for (const count of counts) {
      expect(count).toBeGreaterThan(20)
      expect(count).toBeLessThan(180)
    }
  })
})

describe("shuffleArray", () => {
  it("returns a new array", () => {
    const arr = [1, 2, 3]
    const result = shuffleArray(arr)
    expect(result).not.toBe(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it("contains all original elements", () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffleArray(arr)
    expect(result.sort()).toEqual(arr.sort())
  })

  it("handles empty array", () => {
    expect(shuffleArray([])).toEqual([])
  })

  it("handles single element", () => {
    expect(shuffleArray([42])).toEqual([42])
  })

  it("actually shuffles (different order at least once in 20 tries)", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    const results = new Set<string>()
    for (let i = 0; i < 20; i++) {
      results.add(shuffleArray(arr).join(","))
    }
    expect(results.size).toBeGreaterThan(1)
  })
})

describe("getRandomChoice", () => {
  it("returns an element from the array", () => {
    const arr = [10, 20, 30]
    const result = getRandomChoice(arr)
    expect(arr).toContain(result)
  })

  it("throws on empty array", () => {
    expect(() => getRandomChoice([])).toThrow("Cannot pick from empty array")
  })

  it("returns the only element for single-element array", () => {
    expect(getRandomChoice([99])).toBe(99)
  })
})

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string")
  })

  it("returns unique values", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 50; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(50)
  })

  it("returns UUID format", () => {
    const id = generateId()
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })
})
