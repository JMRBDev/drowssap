export type GeneratorMode = "random" | "memorable" | "pronounceable" | "pin"

export type RandomSettings = {
  length: number
  includeLower: boolean
  includeUpper: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
  customExclusions: string
  startWithLetter: boolean
}

export type MemorableSettings = {
  words: number
  caseStyle: "lower" | "upper" | "title"
  separator: "hyphen" | "space" | "dot" | "underscore" | "custom"
  customSeparator: string
  leet: boolean
}

export type PronounceableSettings = {
  length: number
  caseStyle: "lower" | "upper" | "mixed"
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
  customExclusions: string
}

export type PinSettings = {
  length: number
}

export type Settings = {
  version: number
  mode: GeneratorMode
  random: RandomSettings
  memorable: MemorableSettings
  pronounceable: PronounceableSettings
  pin: PinSettings
  soundEnabled: boolean
}

export type Composition = {
  letters: number
  numbers: number
  symbols: number
  separators?: number
}

export type GeneratedResult = {
  id: string
  value: string
  mode: GeneratorMode
  entropyBits: number
  strengthLabel: string
  crackTimeEstimate: string
  createdAt: number
  composition?: Composition
}

export type StrengthTier = {
  label: string
  minBits: number
  maxBits: number | null
  color: string
  percent: number
}

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  mode: "random",
  random: {
    length: 20,
    includeLower: true,
    includeUpper: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    customExclusions: "",
    startWithLetter: false,
  },
  memorable: {
    words: 4,
    caseStyle: "lower",
    separator: "hyphen",
    customSeparator: "",
    leet: false,
  },
  pronounceable: {
    length: 12,
    caseStyle: "lower",
    includeNumbers: false,
    includeSymbols: false,
    excludeAmbiguous: false,
    customExclusions: "",
  },
  pin: {
    length: 6,
  },
  soundEnabled: false,
}
