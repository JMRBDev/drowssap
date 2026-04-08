import { useState, useCallback } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import type { Settings, Preset } from "@/lib/types"
import { Trash2, Plus, Pencil, XIcon, CheckIcon } from "lucide-react"

type SettingsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
  presets: Preset[]
  onAddPreset: (
    name: string,
    settings: Settings,
    overwrite?: boolean
  ) => { success: boolean; error?: string; existingId?: string }
  onRemovePreset: (id: string) => void
  onRenamePreset: (
    id: string,
    newName: string
  ) => { success: boolean; error?: string }
  onApplyPreset: (preset: Preset) => void
}

export function SettingsSheet({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  presets,
  onAddPreset,
  onRemovePreset,
  onRenamePreset,
  onApplyPreset,
}: SettingsSheetProps) {
  const { theme, setTheme } = useTheme()
  const [presetName, setPresetName] = useState("")
  const [presetError, setPresetError] = useState<string | null>(null)
  const [presetOverwriteId, setPresetOverwriteId] = useState<string | null>(
    null
  )
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [renameError, setRenameError] = useState<string | null>(null)

  const handleSavePreset = useCallback(
    (overwrite = false) => {
      const result = onAddPreset(presetName, settings, overwrite)
      if (result.success) {
        setPresetName("")
        setPresetError(null)
        setPresetOverwriteId(null)
      } else if (result.existingId && !overwrite) {
        setPresetOverwriteId(result.existingId)
        setPresetError(result.error ?? "Duplicate name")
      } else {
        setPresetError(result.error ?? "Invalid name")
      }
    },
    [presetName, settings, onAddPreset]
  )

  const handleRenameSubmit = useCallback(
    (id: string) => {
      const result = onRenamePreset(id, renameValue)
      if (result.success) {
        setRenamingId(null)
        setRenameValue("")
        setRenameError(null)
        return
      }

      setRenameError(result.error ?? "Invalid name")
    },
    [onRenamePreset, renameValue]
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="max-h-[85vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Configure generator options, themes, and presets.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          <Section title="Theme">
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(v) => {
                if (v) setTheme(v as "light" | "dark" | "system")
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </Section>

          <Separator />

          <Section title="Advanced - Random">
            <div className="flex flex-col gap-3">
              <ButtonToggleRow
                label="Start with letter"
                pressed={settings.random.startWithLetter}
                onPressedChange={(v) =>
                  onSettingsChange({
                    random: { ...settings.random, startWithLetter: v },
                  })
                }
                disabled={
                  !settings.random.includeLower && !settings.random.includeUpper
                }
                hint={
                  !settings.random.includeLower && !settings.random.includeUpper
                    ? "Enable lowercase or uppercase first"
                    : undefined
                }
              />
              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  Custom exclusions
                </span>
                <Input
                  value={settings.random.customExclusions}
                  onChange={(e) =>
                    onSettingsChange({
                      random: {
                        ...settings.random,
                        customExclusions: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. 0OoIl1"
                  className="h-7 font-mono text-xs"
                />
              </div>
            </div>
          </Section>

          <Separator />

          <Section title="Advanced - Memorable">
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">
                Custom separator
              </span>
              <Input
                value={settings.memorable.customSeparator}
                onChange={(e) =>
                  onSettingsChange({
                    memorable: {
                      ...settings.memorable,
                      customSeparator: e.target.value.slice(0, 8),
                    },
                  })
                }
                placeholder="Custom (max 8)"
                className="h-7 font-mono text-xs"
                maxLength={8}
              />
            </div>
          </Section>

          <Separator />

          <Section title="Advanced - Pronounceable">
            <div className="flex flex-col gap-3">
              <ButtonToggleRow
                label="Exclude ambiguous"
                pressed={settings.pronounceable.excludeAmbiguous}
                onPressedChange={(v) =>
                  onSettingsChange({
                    pronounceable: {
                      ...settings.pronounceable,
                      excludeAmbiguous: v,
                    },
                  })
                }
              />
              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  Custom exclusions
                </span>
                <Input
                  value={settings.pronounceable.customExclusions}
                  onChange={(e) =>
                    onSettingsChange({
                      pronounceable: {
                        ...settings.pronounceable,
                        customExclusions: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. 0OoIl1"
                  className="h-7 font-mono text-xs"
                />
              </div>
            </div>
          </Section>

          <Separator />

          <Section title="Sound">
            <ButtonToggleRow
              label="Generate sound"
              pressed={settings.soundEnabled}
              onPressedChange={(v) => onSettingsChange({ soundEnabled: v })}
            />
          </Section>

          <Separator />

          <Section title="Privacy &amp; Security">
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p>
                All generation happens in your browser. No passwords are ever
                stored or transmitted.
              </p>
              <p>
                Copied passwords are automatically cleared after 30 seconds.
              </p>
            </div>
          </Section>

          <Separator />

          <Section title="Presets">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  value={presetName}
                  onChange={(e) => {
                    setPresetName(e.target.value)
                    setPresetError(null)
                    setPresetOverwriteId(null)
                  }}
                  placeholder="Preset name"
                  className="h-7 text-xs"
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSavePreset(!!presetOverwriteId)
                  }}
                />
                {presetOverwriteId ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSavePreset(true)}
                  >
                    Overwrite
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSavePreset(false)}
                    disabled={!presetName.trim()}
                  >
                    <Plus className="size-3" data-icon="inline-start" />
                    Save
                  </Button>
                )}
              </div>
              {presetError && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-destructive">{presetError}</p>
                  {presetOverwriteId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-xs"
                      onClick={() => {
                        setPresetOverwriteId(null)
                        setPresetError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
              {presets.length > 0 && (
                <div className="flex flex-col gap-1">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-2 rounded-none border border-border px-3 py-2"
                    >
                      {renamingId === preset.id ? (
                        <>
                          <div className="flex flex-1 flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Input
                                value={renameValue}
                                onChange={(e) => {
                                  setRenameValue(e.target.value)
                                  setRenameError(null)
                                }}
                                className="h-6 flex-1 text-xs"
                                maxLength={50}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleRenameSubmit(preset.id)
                                  }
                                  if (e.key === "Escape") {
                                    setRenamingId(null)
                                    setRenameError(null)
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleRenameSubmit(preset.id)}
                                aria-label="Confirm rename"
                              >
                                <CheckIcon className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                  setRenamingId(null)
                                  setRenameError(null)
                                }}
                                aria-label="Cancel rename"
                              >
                                <XIcon className="size-3" />
                              </Button>
                            </div>
                            {renameError && (
                              <p className="text-xs text-destructive">
                                {renameError}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onApplyPreset(preset)}
                            className="flex-1 text-left text-xs font-medium"
                          >
                            {preset.name}
                          </button>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {preset.settings.mode}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setRenamingId(preset.id)
                              setRenameValue(preset.name)
                              setRenameError(null)
                            }}
                            aria-label={`Rename preset ${preset.name}`}
                          >
                            <Pencil className="size-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onRemovePreset(preset.id)}
                            aria-label={`Delete preset ${preset.name}`}
                          >
                            <Trash2 className="size-3 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Separator />

          <Section title="About &amp; Trust">
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p>drowssap v0.0.1</p>
              <p>
                Built with Web Crypto API for cryptographically secure
                randomness.
              </p>
              <p>
                Memorable passphrases use the{" "}
                <a
                  href="https://www.eff.org/dice"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  EFF wordlist
                </a>
                .
              </p>
              <p>Open source. Audit the code.</p>
            </div>
          </Section>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium">{title}</h3>
      {children}
    </div>
  )
}

function ButtonToggleRow({
  label,
  pressed,
  onPressedChange,
  disabled,
  hint,
}: {
  label: string
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  disabled?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={pressed}
          disabled={disabled}
          onClick={() => onPressedChange(!pressed)}
          className={
            `inline-flex h-7 items-center justify-center border px-2.5 text-xs font-medium transition-all select-none ` +
            (pressed
              ? "border-input bg-muted text-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground") +
            (disabled ? " pointer-events-none opacity-50" : "")
          }
        >
          {pressed ? "On" : "Off"}
        </button>
      </div>
      {hint && (
        <span className="text-[10px] text-muted-foreground/60">{hint}</span>
      )}
    </div>
  )
}
