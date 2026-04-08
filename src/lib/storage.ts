import type { Settings } from "@/lib/types"
import { DEFAULT_SETTINGS } from "@/lib/types"

const SETTINGS_KEY = "drowssap-settings"

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      return { ...DEFAULT_SETTINGS }
    }
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      random: { ...DEFAULT_SETTINGS.random, ...(parsed.random ?? {}) },
      memorable: { ...DEFAULT_SETTINGS.memorable, ...(parsed.memorable ?? {}) },
      pronounceable: {
        ...DEFAULT_SETTINGS.pronounceable,
        ...(parsed.pronounceable ?? {}),
      },
      pin: { ...DEFAULT_SETTINGS.pin, ...(parsed.pin ?? {}) },
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable or full - silently ignore
  }
}
