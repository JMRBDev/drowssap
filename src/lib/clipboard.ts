export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export async function clearClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText("")
  } catch {
    // best effort
  }
}

export function scheduleClipboardClear(delayMs = 30000): () => void {
  const timeout = setTimeout(() => {
    clearClipboard()
  }, delayMs)
  return () => clearTimeout(timeout)
}
