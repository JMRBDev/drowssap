/**
 * Cryptographic utilities using Web Crypto API only.
 * Math.random() is NEVER used.
 */

/**
 * Get a cryptographically secure random integer in [0, max).
 * Uses rejection sampling to avoid modulo bias.
 */
export function getRandomInt(max: number): number {
  if (max <= 0) {
    throw new Error("max must be positive")
  }
  if (max === 1) return 0

  const limit = Math.floor(0xffffffff / max) * max
  const array = new Uint32Array(1)

  let value: number
  do {
    crypto.getRandomValues(array)
    value = array[0]
  } while (value >= limit)

  return value % max
}

/**
 * Fisher-Yates shuffle using cryptographically secure random indices.
 * Returns a new array (does not mutate the input).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Generate a cryptographically secure random UUID.
 */
export function generateId(): string {
  return crypto.randomUUID()
}
