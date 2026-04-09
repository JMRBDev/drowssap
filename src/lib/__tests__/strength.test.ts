import { describe, it, expect } from "vitest"
import { calculateEntropy, getStrengthTier, formatCrackTime } from "../strength"

describe("calculateEntropy", () => {
  it("returns 0 for zero poolSize", () => {
    expect(calculateEntropy("random", 20, 0)).toBe(0)
  })

  it("returns 0 for negative poolSize", () => {
    expect(calculateEntropy("random", 20, -5)).toBe(0)
  })

  it("calculates correct entropy for known values", () => {
    // 26 lowercase, length 10: 10 * log2(26) ≈ 47.0
    const result = calculateEntropy("random", 10, 26)
    expect(result).toBeCloseTo(10 * Math.log2(26), 1)
  })

  it("returns 0 entropy for length 0", () => {
    expect(calculateEntropy("random", 0, 26)).toBe(0)
  })

  it("calculates higher entropy for larger pools", () => {
    const small = calculateEntropy("random", 10, 10)
    const large = calculateEntropy("random", 10, 94)
    expect(large).toBeGreaterThan(small)
  })

  it("calculates higher entropy for longer passwords", () => {
    const short = calculateEntropy("random", 8, 26)
    const long = calculateEntropy("random", 20, 26)
    expect(long).toBeGreaterThan(short)
  })
})

describe("getStrengthTier", () => {
  it("returns 'Awful' for 0 entropy", () => {
    const tier = getStrengthTier(0)
    expect(tier.label).toBe("Awful")
  })

  it("returns 'Outstanding' for 128+ entropy", () => {
    const tier = getStrengthTier(128)
    expect(tier.label).toBe("Outstanding")
  })

  it("returns 'Outstanding' for very high entropy", () => {
    const tier = getStrengthTier(500)
    expect(tier.label).toBe("Outstanding")
  })

  it("returns correct tiers for boundary values", () => {
    expect(getStrengthTier(27).label).toBe("Awful")
    expect(getStrengthTier(28).label).toBe("Very Weak")
    expect(getStrengthTier(35).label).toBe("Very Weak")
    expect(getStrengthTier(36).label).toBe("Weak")
    expect(getStrengthTier(64).label).toBe("Good")
    expect(getStrengthTier(80).label).toBe("Strong")
    expect(getStrengthTier(96).label).toBe("Excellent")
  })
})

describe("formatCrackTime", () => {
  it("returns 'instant' for 0 entropy", () => {
    expect(formatCrackTime(0)).toBe("instant")
  })

  it("returns 'instant' for very low entropy", () => {
    expect(formatCrackTime(1)).toBe("instant")
  })

  it("returns seconds for low entropy", () => {
    const result = formatCrackTime(45)
    expect(result).toContain("seconds")
  })

  it("returns hours for moderate entropy", () => {
    const result = formatCrackTime(55)
    expect(result).toMatch(/hours|days/)
  })

  it("returns years for high entropy", () => {
    const result = formatCrackTime(80)
    expect(result).toMatch(/years/)
  })

  it("returns universe scale for very high entropy", () => {
    const result = formatCrackTime(200)
    expect(result).toBe("longer than the age of the universe")
  })

  it("handles negative entropy", () => {
    expect(formatCrackTime(-10)).toBe("instant")
  })
})
