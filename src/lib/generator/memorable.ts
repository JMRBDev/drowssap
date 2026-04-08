import wordlistText from "@/data/eff-wordlist.txt?raw"
import { getRandomInt } from "@/lib/crypto"
import { getSeparatorString } from "@/lib/charsets"
import type { MemorableSettings, Composition } from "@/lib/types"

type MemorableResult = {
  value: string
  composition: Composition
}

let cachedWordlist: string[] | null = null

function getWordlist(): string[] {
  if (cachedWordlist) return cachedWordlist

  cachedWordlist = wordlistText
    .split("\n")
    .map((line) => {
      const tabIdx = line.indexOf("\t")
      return tabIdx >= 0 ? line.slice(tabIdx + 1) : ""
    })
    .filter((word) => word.length > 0)

  return cachedWordlist
}

export function isWordlistAvailable(): boolean {
  try {
    return getWordlist().length >= 7776
  } catch {
    return false
  }
}

const LEET_MAP: Record<string, string> = {
  a: "@",
  e: "3",
  i: "1",
  o: "0",
  s: "5",
  t: "7",
}

function applyLeet(word: string): string {
  return word
    .split("")
    .map((ch) => LEET_MAP[ch.toLowerCase()] ?? ch)
    .join("")
}

function applyCase(word: string, caseStyle: string): string {
  switch (caseStyle) {
    case "upper":
      return word.toUpperCase()
    case "title":
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    default:
      return word.toLowerCase()
  }
}

export function generateMemorablePassphrase(
  settings: MemorableSettings
): MemorableResult {
  const wordlist = getWordlist()
  const wordCount = Math.max(2, Math.min(20, settings.words))
  const sep = getSeparatorString(settings.separator, settings.customSeparator)

  const words: string[] = []
  let letterCount = 0
  let separatorCount = 0

  for (let i = 0; i < wordCount; i++) {
    let word = wordlist[getRandomInt(wordlist.length)]
    word = applyCase(word, settings.caseStyle)
    if (settings.leet) {
      word = applyLeet(word)
    }
    words.push(word)
    letterCount += word.length
  }

  if (wordCount > 1) {
    separatorCount = (wordCount - 1) * sep.length
  }

  return {
    value: words.join(sep),
    composition: {
      letters: letterCount,
      numbers: 0,
      symbols: separatorCount,
      separators: separatorCount,
    },
  }
}
