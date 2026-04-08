import type { Settings, GeneratedResult } from "@/lib/types"
import { generateRandomPassword } from "./random"
import { generateMemorablePassphrase } from "./memorable"
import { generatePronounceablePassword } from "./pronounceable"
import { generatePin } from "./pin"
import {
  calculateEntropy,
  getStrengthTier,
  formatCrackTime,
} from "@/lib/strength"
import { generateId } from "@/lib/crypto"

function buildResult(
  value: string,
  mode: Settings["mode"],
  poolSize: number,
  lengthOrWords: number,
  composition?: GeneratedResult["composition"]
): GeneratedResult {
  const entropyBits =
    Math.round(calculateEntropy(mode, lengthOrWords, poolSize) * 100) / 100
  const tier = getStrengthTier(entropyBits)

  return {
    id: generateId(),
    value,
    mode,
    entropyBits,
    strengthLabel: tier.label,
    crackTimeEstimate: formatCrackTime(entropyBits),
    createdAt: Date.now(),
    composition,
  }
}

export function generate(settings: Settings): GeneratedResult {
  switch (settings.mode) {
    case "random": {
      const result = generateRandomPassword(settings.random)
      return buildResult(
        result.value,
        "random",
        result.poolSize,
        settings.random.length,
        result.composition
      )
    }
    case "memorable": {
      const result = generateMemorablePassphrase(settings.memorable)
      return buildResult(
        result.value,
        "memorable",
        7776,
        settings.memorable.words,
        result.composition
      )
    }
    case "pronounceable": {
      const result = generatePronounceablePassword(settings.pronounceable)
      return buildResult(
        result.value,
        "pronounceable",
        result.poolSize,
        result.value.length,
        result.composition
      )
    }
    case "pin": {
      const result = generatePin(settings.pin)
      return buildResult(result.value, "pin", 10, settings.pin.length, {
        letters: 0,
        numbers: result.value.length,
        symbols: 0,
      })
    }
  }
}
