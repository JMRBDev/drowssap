import { getRandomInt } from "@/lib/crypto"
import type { PinSettings } from "@/lib/types"

type PinResult = {
  value: string
}

export function generatePin(settings: PinSettings): PinResult {
  const length = Math.max(4, Math.min(128, settings.length))
  const digits = "0123456789"

  let pin = ""
  for (let i = 0; i < length; i++) {
    pin += digits[getRandomInt(10)]
  }

  return { value: pin }
}
