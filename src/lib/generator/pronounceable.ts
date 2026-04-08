import { getRandomInt } from "@/lib/crypto"
import type { PronounceableSettings, Composition } from "@/lib/types"

type PronounceableResult = {
  value: string
  poolSize: number
  composition: Composition
}

const CONSONANTS_RAW = "bcdfghjklmnpqrstvwxyz"
const VOWELS_RAW = "aeiou"
const AMBIGUOUS = "Il1O0o"

function generateSyllable(consonants: string, vowels: string): string {
  const patterns: readonly string[] = ["CV", "CVC", "VC", "V"]
  const pattern = patterns[getRandomInt(patterns.length)]
  let syllable = ""

  for (const ch of pattern) {
    if (ch === "C") {
      syllable += consonants[getRandomInt(consonants.length)]
    } else {
      syllable += vowels[getRandomInt(vowels.length)]
    }
  }

  return syllable
}

function applyExclusions(chars: string, exclusions: string): string {
  if (!exclusions) return chars
  let result = ""
  for (const ch of chars) {
    if (!exclusions.includes(ch)) result += ch
  }
  return result
}

export function generatePronounceablePassword(
  settings: PronounceableSettings
): PronounceableResult {
  const targetLength = Math.max(4, Math.min(128, settings.length))

  let exclusions = settings.customExclusions ?? ""
  if (settings.excludeAmbiguous) {
    exclusions += AMBIGUOUS
  }

  const consonants = applyExclusions(CONSONANTS_RAW, exclusions.toLowerCase())
  const vowels = applyExclusions(VOWELS_RAW, exclusions.toLowerCase())

  if (consonants.length === 0 && vowels.length === 0) {
    const rawConsonants = CONSONANTS_RAW
    const rawVowels = VOWELS_RAW
    const fallbackBase = Array.from({ length: targetLength }, () => {
      const isVowel = getRandomInt(2) === 0
      return isVowel
        ? rawVowels[getRandomInt(rawVowels.length)]
        : rawConsonants[getRandomInt(rawConsonants.length)]
    }).join("")
    return {
      value: fallbackBase.toLowerCase(),
      poolSize: rawConsonants.length * rawVowels.length,
      composition: { letters: targetLength, numbers: 0, symbols: 0 },
    }
  }

  const fallbackConsonants = consonants.length > 0 ? consonants : vowels
  const fallbackVowels = vowels.length > 0 ? vowels : consonants

  const numberChars = applyExclusions("0123456789", exclusions)
  const effectiveIncludeNumbers =
    settings.includeNumbers && numberChars.length > 0
  const symbolChars = applyExclusions("!@#$%^&*-_=+?", exclusions)
  const effectiveIncludeSymbols =
    settings.includeSymbols && symbolChars.length > 0

  let extraCount = 0
  if (effectiveIncludeNumbers) extraCount += getRandomInt(2) + 1
  if (effectiveIncludeSymbols) extraCount += getRandomInt(2) + 1
  const syllableTarget = Math.max(2, targetLength - extraCount)

  let base = ""
  let attempts = 0
  while (base.length < syllableTarget && attempts < 1000) {
    const syllable = generateSyllable(fallbackConsonants, fallbackVowels)
    if (base.length + syllable.length <= syllableTarget) {
      base += syllable
    }
    attempts++
  }

  while (base.length < syllableTarget) {
    const isVowel = getRandomInt(2) === 0
    base += isVowel
      ? fallbackVowels[getRandomInt(fallbackVowels.length)]
      : fallbackConsonants[getRandomInt(fallbackConsonants.length)]
  }

  let result: string
  switch (settings.caseStyle) {
    case "upper":
      result = base.toUpperCase()
      break
    case "mixed": {
      const chars = base
        .split("")
        .map((ch) =>
          getRandomInt(2) === 0 ? ch.toUpperCase() : ch.toLowerCase()
        )
      result = chars.join("")
      break
    }
    default:
      result = base.toLowerCase()
  }

  let numberCount = 0
  let symbolCount = 0

  if (effectiveIncludeNumbers) {
    const numCount = getRandomInt(2) + 1
    const nums = Array.from(
      { length: numCount },
      () => numberChars[getRandomInt(numberChars.length)]
    ).join("")
    result += nums
    numberCount += numCount
  }

  if (effectiveIncludeSymbols) {
    const symCount = getRandomInt(2) + 1
    const syms = Array.from(
      { length: symCount },
      () => symbolChars[getRandomInt(symbolChars.length)]
    ).join("")
    result = syms + result
    symbolCount += symCount
  }

  if (result.length > targetLength) {
    const removed = result.slice(targetLength)
    for (const ch of removed) {
      if (/[0-9]/.test(ch) && numberCount > 0) numberCount--
      else if (/[^a-zA-Z0-9]/.test(ch) && symbolCount > 0) symbolCount--
    }
    result = result.slice(0, targetLength)
  } else if (result.length < targetLength) {
    while (result.length < targetLength) {
      const isVowel = getRandomInt(2) === 0
      result += isVowel
        ? fallbackVowels[getRandomInt(fallbackVowels.length)]
        : fallbackConsonants[getRandomInt(fallbackConsonants.length)]
    }
  }

  const finalLetters = result.length - numberCount - symbolCount

  let poolSize = consonants.length * vowels.length
  if (effectiveIncludeNumbers) poolSize += numberChars.length
  if (effectiveIncludeSymbols) poolSize += symbolChars.length

  return {
    value: result,
    poolSize,
    composition: {
      letters: finalLetters,
      numbers: numberCount,
      symbols: symbolCount,
    },
  }
}
