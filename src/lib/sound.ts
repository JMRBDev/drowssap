let ctx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext()
    }
    if (ctx.state === "suspended") {
      ctx.resume()
    }
    return ctx
  } catch {
    return null
  }
}

export function playGenerateSound(): void {
  const audioCtx = getAudioContext()
  if (!audioCtx) return

  try {
    const oscillator = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    oscillator.connect(gain)
    gain.connect(audioCtx.destination)

    oscillator.frequency.value = 300 + Math.random() * 1000
    oscillator.type = "sine"
    gain.gain.value = 0.5

    oscillator.start()
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)
    oscillator.stop(audioCtx.currentTime + 0.05)

    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
  } catch {
    // best effort
  }
}
