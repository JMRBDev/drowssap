import { getRandomInt, shuffleArray } from "@/lib/crypto"
import { buildCharset } from "@/lib/charsets"
import type { RandomSettings, Composition } from "@/lib/types"

type RandomResult = {
  value: string
  poolSize: number
  composition: Composition
}

export function generateRandomPassword(settings: RandomSettings): RandomResult {
  const effectiveLower =
    settings.includeLower && settings.customExclusions
      ? !isFullyExcluded("abcdefghijklmnopqrstuvwxyz", settings)
      : settings.includeLower
  const effectiveUpper =
    settings.includeUpper && settings.customExclusions
      ? !isFullyExcluded("ABCDEFGHIJKLMNOPQRSTUVWXYZ", settings)
      : settings.includeUpper
  const effectiveNumbers =
    settings.includeNumbers && settings.customExclusions
      ? !isFullyExcluded("0123456789", settings)
      : settings.includeNumbers
  const effectiveSymbols =
    settings.includeSymbols && settings.customExclusions
      ? !isFullyExcluded("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~", settings)
      : settings.includeSymbols

  const charset = buildCharset({
    includeLower: effectiveLower,
    includeUpper: effectiveUpper,
    includeNumbers: effectiveNumbers,
    includeSymbols: effectiveSymbols,
    excludeAmbiguous: settings.excludeAmbiguous,
    customExclusions: settings.customExclusions,
  })

  const { pool, poolSize, sets } = charset
  const length = Math.max(4, Math.min(128, settings.length))

  const guaranteed: string[] = []
  let letterCount = 0
  let numberCount = 0
  let symbolCount = 0

  if (effectiveLower && sets.lowers.length > 0) {
    guaranteed.push(sets.lowers[getRandomInt(sets.lowers.length)])
    letterCount++
  }
  if (effectiveUpper && sets.uppers.length > 0) {
    guaranteed.push(sets.uppers[getRandomInt(sets.uppers.length)])
    letterCount++
  }
  if (effectiveNumbers && sets.digits.length > 0) {
    guaranteed.push(sets.digits[getRandomInt(sets.digits.length)])
    numberCount++
  }
  if (effectiveSymbols && sets.symbols.length > 0) {
    guaranteed.push(sets.symbols[getRandomInt(sets.symbols.length)])
    symbolCount++
  }

  const remaining = length - guaranteed.length
  const chars: string[] = [...guaranteed]
  for (let i = 0; i < remaining; i++) {
    const ch = pool[getRandomInt(poolSize)]
    chars.push(ch)
    if (/[a-z]/.test(ch) || /[A-Z]/.test(ch)) letterCount++
    else if (/[0-9]/.test(ch)) numberCount++
    else symbolCount++
  }

  const shuffled = shuffleArray(chars)
  let result = shuffled.join("")

  if (settings.startWithLetter) {
    const letterChars = effectiveLower ? sets.lowers : ""
    const upperChars = effectiveUpper ? sets.uppers : ""
    const availableLetters = letterChars + upperChars
    if (availableLetters.length > 0) {
      const firstLetterIdx = result
        .split("")
        .findIndex((ch) => /[a-zA-Z]/.test(ch))
      if (firstLetterIdx > 0) {
        const arr = result.split("")
        ;[arr[0], arr[firstLetterIdx]] = [arr[firstLetterIdx], arr[0]]
        result = arr.join("")
      } else if (firstLetterIdx === -1) {
        const arr = result.split("")
        arr[0] = availableLetters[getRandomInt(availableLetters.length)]
        result = arr.join("")
        letterCount++
      }
    }
  }

  return {
    value: result,
    poolSize,
    composition: {
      letters: letterCount,
      numbers: numberCount,
      symbols: symbolCount,
    },
  }
}

function isFullyExcluded(charset: string, settings: RandomSettings): boolean {
  const AMBIGUOUS = "Il1O0o"
  let exclusions = settings.customExclusions ?? ""
  if (settings.excludeAmbiguous) exclusions += AMBIGUOUS

  for (const ch of charset) {
    if (!exclusions.includes(ch)) return false
  }
  return true
}
