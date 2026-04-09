import { describe, it, expect, vi, beforeEach } from "vitest"
import { copyToClipboard, scheduleClipboardClear } from "../clipboard"

describe("copyToClipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it("returns true on success", async () => {
    const result = await copyToClipboard("test")
    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test")
  })

  it("returns false on failure", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error("denied")
    )
    const result = await copyToClipboard("test")
    expect(result).toBe(false)
  })
})

describe("scheduleClipboardClear", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it("returns a cancel function", () => {
    const cancel = scheduleClipboardClear()
    expect(typeof cancel).toBe("function")
    cancel()
  })

  it("clears clipboard after delay", () => {
    scheduleClipboardClear(5000)
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    vi.advanceTimersByTime(5000)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("")
  })

  it("does not clear clipboard when cancelled", () => {
    const cancel = scheduleClipboardClear(5000)
    cancel()
    vi.advanceTimersByTime(5000)
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })
})
