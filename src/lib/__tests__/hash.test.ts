import { describe, it, expect } from "vitest"
import { generateHash, formatHash } from "../hash"

describe("generateHash", () => {
  it("generates a SHA-256 hash as hex string", async () => {
    const hash = await generateHash("test")
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it("produces consistent hash for same input", async () => {
    const hash1 = await generateHash("password123")
    const hash2 = await generateHash("password123")
    expect(hash1).toBe(hash2)
  })

  it("produces different hash for different input", async () => {
    const hash1 = await generateHash("password1")
    const hash2 = await generateHash("password2")
    expect(hash1).not.toBe(hash2)
  })

  it("produces known SHA-256 hash for empty string", async () => {
    // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const hash = await generateHash("")
    expect(hash).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
  })

  it("produces known SHA-256 hash for 'abc'", async () => {
    // SHA-256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    const hash = await generateHash("abc")
    expect(hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    )
  })
})

describe("formatHash", () => {
  it("formats hash with spaces every 8 characters", () => {
    const hash =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    const formatted = formatHash(hash)
    expect(formatted).toBe(
      "e3b0c442 98fc1c14 9afbf4c8 996fb924 27ae41e4 649b934c a495991b 7852b855"
    )
  })

  it("handles short hash", () => {
    expect(formatHash("abcdef12")).toBe("abcdef12")
  })

  it("handles hash shorter than 8 chars", () => {
    expect(formatHash("abcd")).toBe("abcd")
  })

  it("handles empty string", () => {
    expect(formatHash("")).toBe("")
  })
})
