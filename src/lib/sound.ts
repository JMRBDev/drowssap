export function playGenerateSound(): void {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.frequency.value = 300 + Math.random() * 1000
    oscillator.type = "sine"
    gain.gain.value = 0.5

    oscillator.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    oscillator.stop(ctx.currentTime + 0.05)
  } catch {
    // best effort
  }
}
