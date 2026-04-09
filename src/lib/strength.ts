import type { StrengthTier } from "@/lib/types"

const STRENGTH_TIERS: StrengthTier[] = [
  {
    label: "Awful",
    minBits: 0,
    maxBits: 27,
    color: "oklch(0.6 0.25 25)",
    percent: 5,
  },
  {
    label: "Very Weak",
    minBits: 28,
    maxBits: 35,
    color: "oklch(0.65 0.22 25)",
    percent: 15,
  },
  {
    label: "Weak",
    minBits: 36,
    maxBits: 49,
    color: "oklch(0.7 0.2 60)",
    percent: 30,
  },
  {
    label: "Fair",
    minBits: 50,
    maxBits: 63,
    color: "oklch(0.75 0.18 85)",
    percent: 45,
  },
  {
    label: "Good",
    minBits: 64,
    maxBits: 79,
    color: "oklch(0.75 0.15 145)",
    percent: 60,
  },
  {
    label: "Strong",
    minBits: 80,
    maxBits: 95,
    color: "oklch(0.7 0.17 165)",
    percent: 75,
  },
  {
    label: "Excellent",
    minBits: 96,
    maxBits: 127,
    color: "oklch(0.7 0.15 175)",
    percent: 90,
  },
  {
    label: "Outstanding",
    minBits: 128,
    maxBits: null,
    color: "oklch(0.7 0.12 185)",
    percent: 100,
  },
]

export function getStrengthTier(entropyBits: number): StrengthTier {
  for (const tier of STRENGTH_TIERS) {
    if (tier.maxBits === null || entropyBits <= tier.maxBits) {
      return tier
    }
  }
  return STRENGTH_TIERS[STRENGTH_TIERS.length - 1]
}

export function calculateEntropy(
  _mode: string,
  lengthOrWords: number,
  poolSize: number
): number {
  if (poolSize <= 0) return 0
  return lengthOrWords * Math.log2(poolSize)
}

export function formatCrackTime(entropyBits: number): string {
  if (entropyBits <= 0) return "instant"

  const guessesPerSecond = 1e12
  const totalCombinations = Math.pow(2, entropyBits)
  const seconds = totalCombinations / (guessesPerSecond * 2)

  if (seconds < 0.001) return "instant"
  if (seconds < 1) return `${Math.round(seconds * 1000)} milliseconds`
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 86400 * 30) return `${Math.round(seconds / 86400)} days`
  if (seconds < 86400 * 365)
    return `${Math.round(seconds / (86400 * 30))} months`
  if (seconds < 86400 * 365 * 100)
    return `${Math.round(seconds / (86400 * 365))} years`
  if (seconds < 86400 * 365 * 1e3)
    return `${Math.round(seconds / (86400 * 365))} years`
  if (seconds < 86400 * 365 * 1e6)
    return `${Math.round(seconds / (86400 * 365 * 1e3))} thousand years`
  if (seconds < 86400 * 365 * 1e9)
    return `${Math.round(seconds / (86400 * 365 * 1e6))} million years`
  if (seconds < 86400 * 365 * 1e12)
    return `${Math.round(seconds / (86400 * 365 * 1e9))} billion years`

  return "longer than the age of the universe"
}
