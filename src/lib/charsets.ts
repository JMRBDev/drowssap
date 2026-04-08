export const LOWERS = "abcdefghijklmnopqrstuvwxyz"
export const UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
export const DIGITS = "0123456789"
export const SYMBOLS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
export const AMBIGUOUS_CHARS = "Il1O0o"

export type CharsetOptions = {
  includeLower: boolean
  includeUpper: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
  customExclusions: string
}

export type CharsetValidation = {
  valid: boolean
  warnings: string[]
}

export function validateCharsetOptions(
  options: CharsetOptions
): CharsetValidation {
  const warnings: string[] = []
  const exclusions =
    (options.customExclusions ?? "") +
    (options.excludeAmbiguous ? AMBIGUOUS_CHARS : "")

  if (options.includeLower) {
    const filtered = excludeChars(LOWERS, exclusions)
    if (filtered.length === 0) warnings.push("All lowercase letters excluded")
  }
  if (options.includeUpper) {
    const filtered = excludeChars(UPPERS, exclusions)
    if (filtered.length === 0) warnings.push("All uppercase letters excluded")
  }
  if (options.includeNumbers) {
    const filtered = excludeChars(DIGITS, exclusions)
    if (filtered.length === 0) warnings.push("All numbers excluded")
  }
  if (options.includeSymbols) {
    const filtered = excludeChars(SYMBOLS, exclusions)
    if (filtered.length === 0) warnings.push("All symbols excluded")
  }

  return { valid: warnings.length === 0, warnings }
}

export type CharsetResult = {
  pool: string
  poolSize: number
  sets: {
    lowers: string
    uppers: string
    digits: string
    symbols: string
  }
}

function excludeChars(set: string, exclusions: string): string {
  if (!exclusions) return set
  let result = ""
  for (const ch of set) {
    if (!exclusions.includes(ch)) {
      result += ch
    }
  }
  return result
}

/**
 * Build the character pool and individual sets based on settings.
 */
export function buildCharset(options: CharsetOptions): CharsetResult {
  let lowers = LOWERS
  let uppers = UPPERS
  let digits = DIGITS
  let symbols = SYMBOLS

  // Build exclusion string
  let exclusions = options.customExclusions ?? ""
  if (options.excludeAmbiguous) {
    exclusions += AMBIGUOUS_CHARS
  }

  // Apply exclusions to each set
  if (exclusions) {
    lowers = excludeChars(lowers, exclusions)
    uppers = excludeChars(uppers, exclusions)
    digits = excludeChars(digits, exclusions)
    symbols = excludeChars(symbols, exclusions)
  }

  // Build the pool from enabled sets
  let pool = ""
  if (options.includeLower) pool += lowers
  if (options.includeUpper) pool += uppers
  if (options.includeNumbers) pool += digits
  if (options.includeSymbols) pool += symbols

  // Fallback: if pool is empty, use lowercase + numbers
  if (!pool) {
    pool = excludeChars(LOWERS, exclusions) + excludeChars(DIGITS, exclusions)
    lowers = excludeChars(LOWERS, exclusions)
    digits = excludeChars(DIGITS, exclusions)
  }

  // Ultimate safety: if even the fallback is empty, use digits
  if (!pool) {
    pool = DIGITS
    digits = DIGITS
  }

  return {
    pool,
    poolSize: pool.length,
    sets: { lowers, uppers, digits, symbols },
  }
}

/**
 * Get the separator string for memorable mode.
 */
export function getSeparatorString(
  separator: string,
  customSeparator: string
): string {
  switch (separator) {
    case "hyphen":
      return "-"
    case "space":
      return " "
    case "dot":
      return "."
    case "underscore":
      return "_"
    case "custom":
      return customSeparator || "-"
    default:
      return "-"
  }
}
