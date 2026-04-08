import { useState, useCallback, useRef } from "react"
import { useSettings } from "@/hooks/useSettings"
import { useGenerator } from "@/hooks/useGenerator"
import { useClipboard } from "@/hooks/useClipboard"
import { useHash } from "@/hooks/useHash"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { PasswordAge } from "@/hooks/usePasswordAge"
import { useMountEffect } from "@/hooks/useMountEffect"
import { PasswordDisplay } from "@/components/PasswordDisplay"
import { ModeSelector } from "@/components/ModeSelector"
import { StrengthBar, CrackTimeDisplay } from "@/components/StrengthBar"
import { QuickControls } from "@/components/QuickControls"
import { QRModal } from "@/components/QRModal"
import { HashModal } from "@/components/HashModal"
import { SettingsSheet } from "@/components/SettingsSheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import { Alert } from "@/components/ui/alert"
import { sharePassword } from "@/lib/share"
import { playGenerateSound } from "@/lib/sound"
import { validateCharsetOptions } from "@/lib/charsets"
import { useTheme } from "@/components/theme-provider"
import type { Settings as SettingsType } from "@/lib/types"
import {
  RefreshCw,
  Copy,
  Check,
  Share2,
  QrCode,
  Trash2,
  Hash,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"

export function App() {
  const { settings, updateSettings } = useSettings()
  const { activeResult, generate, clearActive } = useGenerator()
  const { copied, copy, clearCopied } = useClipboard()
  const { hash, formattedHash, generateAndShow, clear: clearHash } = useHash()
  const { theme, setTheme } = useTheme()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [hashOpen, setHashOpen] = useState(false)
  const [copyFailed, setCopyFailed] = useState<string | null>(null)
  const copyFailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleGenerate = useCallback(() => {
    if (settings.mode === "random") {
      const validation = validateCharsetOptions({
        includeLower: settings.random.includeLower,
        includeUpper: settings.random.includeUpper,
        includeNumbers: settings.random.includeNumbers,
        includeSymbols: settings.random.includeSymbols,
        excludeAmbiguous: settings.random.excludeAmbiguous,
        customExclusions: settings.random.customExclusions,
      })

      if (!validation.valid) {
        return
      }
    }

    if (settings.soundEnabled) playGenerateSound()
    generate(settings)
  }, [settings, generate])

  const handleModeChange = useCallback(
    (mode: SettingsType["mode"]) => {
      const newSettings = updateSettings({ mode })
      generate(newSettings)
    },
    [updateSettings, generate]
  )

  const handleSettingsChange = useCallback(
    (partial: Partial<SettingsType>) => {
      const newSettings = updateSettings(partial)
      generate(newSettings)
    },
    [updateSettings, generate]
  )

  const handleCopy = useCallback(async () => {
    if (!activeResult) {
      return false
    }
    const success = await copy(activeResult.value)
    if (copyFailTimerRef.current) {
      clearTimeout(copyFailTimerRef.current)
      copyFailTimerRef.current = null
    }
    if (success) {
      setCopyFailed(null)
    } else {
      setCopyFailed("Copy failed - permission denied")
      copyFailTimerRef.current = setTimeout(() => setCopyFailed(null), 3000)
    }
    return success
  }, [activeResult, copy])

  const handleShare = useCallback(async () => {
    if (activeResult) {
      await sharePassword(activeResult.value)
    }
  }, [activeResult])

  const handleWipe = useCallback(() => {
    clearActive()
    clearHash()
    clearCopied()
    setQrOpen(false)
    setHashOpen(false)
  }, [clearActive, clearHash, clearCopied])

  const handleShowHash = useCallback(async () => {
    if (activeResult) {
      await generateAndShow(activeResult.value)
      setHashOpen(true)
    }
  }, [activeResult, generateAndShow])

  const handleEscape = useCallback(() => {
    setSettingsOpen(false)
    setQrOpen(false)
    setHashOpen(false)
  }, [])

  useKeyboardShortcuts({
    onGenerate: handleGenerate,
    onCopy: handleCopy,
    onEscape: handleEscape,
  })

  useMountEffect(() => {
    generate(settings)
  })

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div aria-live="polite" className="sr-only" role="status">
        {activeResult
          ? `Password generated. ${activeResult.strengthLabel}. ${activeResult.entropyBits.toFixed(0)} bits.`
          : ""}
        {copied ? "Password copied to clipboard." : ""}
      </div>
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <h1 className="font-heading text-sm font-semibold tracking-tight">
            drowssap
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Private. Offline. On-device.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (theme === "dark") setTheme("light")
              else if (theme === "light") setTheme("system")
              else setTheme("dark")
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Moon className="size-4" />
            ) : theme === "light" ? (
              <Sun className="size-4" />
            ) : (
              <Monitor className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            aria-expanded={settingsOpen}
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[75ch] flex-1 flex-col gap-4 px-4 py-4">
        <ModeSelector
          activeMode={settings.mode}
          onModeChange={handleModeChange}
        />

        <Card>
          <CardContent className="flex flex-col gap-3">
            <PasswordDisplay
              value={activeResult?.value ?? null}
              mode={settings.mode}
              composition={activeResult?.composition}
            />

            {activeResult && (
              <div className="flex flex-col gap-1">
                <StrengthBar entropyBits={activeResult.entropyBits} />
                <CrackTimeDisplay
                  crackTimeEstimate={activeResult.crackTimeEstimate}
                />
                {activeResult.createdAt != null && (
                  <PasswordAge
                    key={activeResult.createdAt}
                    createdAt={activeResult.createdAt}
                  />
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerate}
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" data-icon="inline-start" />
                Generate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copied ? (
                  <Check
                    className="size-3.5 text-green-500"
                    data-icon="inline-start"
                  />
                ) : (
                  <Copy className="size-3.5" data-icon="inline-start" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              {copyFailed ? (
                <Alert
                  variant="destructive"
                  className="self-center px-2 py-1 text-xs"
                >
                  {copyFailed}
                </Alert>
              ) : null}
              {activeResult && (
                <>
                  {"share" in navigator && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="gap-1.5"
                    >
                      <Share2 className="size-3.5" data-icon="inline-start" />
                      Share
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrOpen(true)}
                    className="gap-1.5"
                  >
                    <QrCode className="size-3.5" data-icon="inline-start" />
                    QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowHash}
                    className="gap-1.5"
                  >
                    <Hash className="size-3.5" data-icon="inline-start" />
                    Hash
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWipe}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Trash2 className="size-3.5" data-icon="inline-start" />
                    Wipe
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <QuickControls
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </main>

      <footer className="border-t px-4 py-3">
        <div className="mx-auto flex max-w-[75ch] items-center justify-between text-[10px] text-muted-foreground">
          <span>Generated locally. No data leaves your browser.</span>
          <span>
            <Kbd>⌘G</Kbd> generate <Kbd>⌘C</Kbd> copy
          </span>
        </div>
      </footer>

      <QRModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        value={activeResult?.value ?? null}
      />
      <HashModal
        open={hashOpen}
        onOpenChange={setHashOpen}
        hash={hash}
        formattedHash={formattedHash}
      />
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}

export default App
