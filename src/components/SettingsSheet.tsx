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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  FieldGroup,
  FieldTitle,
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
} from "@/components/ui/field"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item"
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
          <FieldGroup>
            <FieldTitle>Theme</FieldTitle>
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
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>Advanced - Random</FieldTitle>
            <div className="flex flex-col gap-3">
              <SwitchRow
                label="Start with letter"
                checked={settings.random.startWithLetter}
                onCheckedChange={(v) =>
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
              <Field orientation="horizontal" className="items-center gap-2">
                <FieldLabel className="w-24 shrink-0">
                  Custom exclusions
                </FieldLabel>
                <FieldContent>
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
                </FieldContent>
              </Field>
            </div>
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>Advanced - Memorable</FieldTitle>
            <Field orientation="horizontal" className="items-center gap-2">
              <FieldLabel className="w-24 shrink-0">
                Custom separator
              </FieldLabel>
              <FieldContent>
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
              </FieldContent>
            </Field>
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>Advanced - Pronounceable</FieldTitle>
            <div className="flex flex-col gap-3">
              <SwitchRow
                label="Exclude ambiguous"
                checked={settings.pronounceable.excludeAmbiguous}
                onCheckedChange={(v) =>
                  onSettingsChange({
                    pronounceable: {
                      ...settings.pronounceable,
                      excludeAmbiguous: v,
                    },
                  })
                }
              />
              <Field orientation="horizontal" className="items-center gap-2">
                <FieldLabel className="w-24 shrink-0">
                  Custom exclusions
                </FieldLabel>
                <FieldContent>
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
                </FieldContent>
              </Field>
            </div>
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>Sound</FieldTitle>
            <SwitchRow
              label="Generate sound"
              checked={settings.soundEnabled}
              onCheckedChange={(v) => onSettingsChange({ soundEnabled: v })}
            />
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>Privacy &amp; Security</FieldTitle>
            <FieldDescription>
              All generation happens in your browser. No passwords are ever
              stored or transmitted.
            </FieldDescription>
            <FieldDescription>
              Copied passwords are automatically cleared after 30 seconds.
            </FieldDescription>
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>Presets</FieldTitle>
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
                <ItemGroup>
                  {presets.map((preset) => (
                    <Item key={preset.id} variant="outline">
                      {renamingId === preset.id ? (
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
                      ) : (
                        <>
                          <ItemContent
                            className="cursor-pointer"
                            onClick={() => onApplyPreset(preset)}
                          >
                            <ItemTitle>{preset.name}</ItemTitle>
                          </ItemContent>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {preset.settings.mode}
                          </span>
                          <ItemActions>
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
                          </ItemActions>
                        </>
                      )}
                    </Item>
                  ))}
                </ItemGroup>
              )}
            </div>
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <FieldTitle>About &amp; Trust</FieldTitle>
            <FieldDescription>drowssap v0.0.1</FieldDescription>
            <FieldDescription>
              Built with Web Crypto API for cryptographically secure randomness.
            </FieldDescription>
            <FieldDescription>
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
            </FieldDescription>
            <FieldDescription>Open source. Audit the code.</FieldDescription>
          </FieldGroup>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SwitchRow({
  label,
  checked,
  onCheckedChange,
  disabled,
  hint,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={label}
        />
      </div>
      {hint && (
        <span className="text-[10px] text-muted-foreground/60">{hint}</span>
      )}
    </div>
  )
}
