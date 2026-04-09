import { describe, it, expect } from "vitest"
import {
  buildCharset,
  validateCharsetOptions,
  getSeparatorString,
} from "../charsets"

describe("buildCharset", () => {
  it("returns full pool when all enabled", () => {
    const result = buildCharset({
      includeLower: true,
      includeUpper: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
      customExclusions: "",
    })
    expect(result.pool.length).toBe(26 + 26 + 10 + 32)
    expect(result.poolSize).toBe(26 + 26 + 10 + 32)
  })

  it("returns lowercase only", () => {
    const result = buildCharset({
      includeLower: true,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "",
    })
    expect(result.pool).toBe("abcdefghijklmnopqrstuvwxyz")
    expect(result.poolSize).toBe(26)
  })

  it("excludes ambiguous characters when enabled", () => {
    const result = buildCharset({
      includeLower: true,
      includeUpper: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: true,
      customExclusions: "",
    })
    for (const ch of "Il1O0o") {
      expect(result.pool).not.toContain(ch)
    }
  })

  it("applies custom exclusions", () => {
    const result = buildCharset({
      includeLower: true,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "abc",
    })
    expect(result.pool).not.toContain("a")
    expect(result.pool).not.toContain("b")
    expect(result.pool).not.toContain("c")
    expect(result.pool).toContain("d")
  })

  it("falls back to lowercase + digits when pool is empty", () => {
    const result = buildCharset({
      includeLower: false,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "",
    })
    expect(result.pool.length).toBeGreaterThan(0)
  })

  it("populates individual sets even when not included in pool", () => {
    const result = buildCharset({
      includeLower: false,
      includeUpper: true,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "",
    })
    expect(result.sets.lowers).toBe("abcdefghijklmnopqrstuvwxyz")
    expect(result.sets.uppers).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
  })
})

describe("validateCharsetOptions", () => {
  it("returns valid with no warnings for default options", () => {
    const result = validateCharsetOptions({
      includeLower: true,
      includeUpper: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
      customExclusions: "",
    })
    expect(result.valid).toBe(true)
    expect(result.warnings).toEqual([])
  })

  it("warns when all lowercase are excluded", () => {
    const result = validateCharsetOptions({
      includeLower: true,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "abcdefghijklmnopqrstuvwxyz",
    })
    expect(result.valid).toBe(false)
    expect(result.warnings).toContain("All lowercase letters excluded")
  })

  it("warns when ambiguous exclusion removes all digits", () => {
    const result = validateCharsetOptions({
      includeLower: false,
      includeUpper: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "0123456789",
    })
    expect(result.valid).toBe(false)
    expect(result.warnings).toContain("All numbers excluded")
  })

  it("returns valid when no sets are enabled", () => {
    const result = validateCharsetOptions({
      includeLower: false,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
      customExclusions: "",
    })
    expect(result.valid).toBe(true)
    expect(result.warnings).toEqual([])
  })
})

describe("getSeparatorString", () => {
  it("returns hyphen for 'hyphen'", () => {
    expect(getSeparatorString("hyphen", "")).toBe("-")
  })

  it("returns space for 'space'", () => {
    expect(getSeparatorString("space", "")).toBe(" ")
  })

  it("returns dot for 'dot'", () => {
    expect(getSeparatorString("dot", "")).toBe(".")
  })

  it("returns underscore for 'underscore'", () => {
    expect(getSeparatorString("underscore", "")).toBe("_")
  })

  it("returns custom separator for 'custom'", () => {
    expect(getSeparatorString("custom", "***")).toBe("***")
  })

  it("falls back to hyphen for empty custom separator", () => {
    expect(getSeparatorString("custom", "")).toBe("-")
  })

  it("defaults to hyphen for unknown separator", () => {
    expect(getSeparatorString("unknown", "")).toBe("-")
  })
})
