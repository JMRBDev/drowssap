import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { Settings } from "@/lib/types"
import { validateCharsetOptions } from "@/lib/charsets"

type QuickControlsProps = {
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
  className?: string
}

export function QuickControls({
  settings,
  onSettingsChange,
  className,
}: QuickControlsProps) {
  const mode = settings.mode

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {mode === "random" && (
        <RandomControls
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
      {mode === "memorable" && (
        <MemorableControls
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
      {mode === "pronounceable" && (
        <PronounceableControls
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
      {mode === "pin" && (
        <PinControls settings={settings} onSettingsChange={onSettingsChange} />
      )}
    </div>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <span className="w-8 text-right font-mono text-xs tabular-nums">
        {value}
      </span>
    </div>
  )
}

function RandomControls({
  settings,
  onSettingsChange,
}: {
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
}) {
  const s = settings.random
  const canStartWithLetter = s.includeLower || s.includeUpper
  const validation = validateCharsetOptions({
    includeLower: s.includeLower,
    includeUpper: s.includeUpper,
    includeNumbers: s.includeNumbers,
    includeSymbols: s.includeSymbols,
    excludeAmbiguous: s.excludeAmbiguous,
    customExclusions: s.customExclusions,
  })
  return (
    <>
      <SliderControl
        label="Length"
        value={s.length}
        min={4}
        max={128}
        onChange={(v) => onSettingsChange({ random: { ...s, length: v } })}
      />
      {!validation.valid && (
        <div className="rounded-none border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {validation.warnings.join(". ")}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <ButtonToggle
          label="a-z"
          pressed={s.includeLower}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeLower: v } })
          }
        />
        <ButtonToggle
          label="A-Z"
          pressed={s.includeUpper}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeUpper: v } })
          }
        />
        <ButtonToggle
          label="0-9"
          pressed={s.includeNumbers}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeNumbers: v } })
          }
        />
        <ButtonToggle
          label="!@#"
          pressed={s.includeSymbols}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeSymbols: v } })
          }
        />
        <ButtonToggle
          label="Start w/ letter"
          pressed={s.startWithLetter}
          disabled={!canStartWithLetter}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, startWithLetter: v } })
          }
        />
        <ButtonToggle
          label="No ambiguous"
          pressed={s.excludeAmbiguous}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, excludeAmbiguous: v } })
          }
        />
      </div>
      {!canStartWithLetter && (
        <p className="text-[11px] text-muted-foreground">
          Enable lowercase or uppercase letters to use start-with-letter.
        </p>
      )}
      <InlineInputRow
        label="Exclude"
        value={s.customExclusions}
        onChange={(value) =>
          onSettingsChange({ random: { ...s, customExclusions: value } })
        }
        placeholder="e.g. 0OoIl1"
      />
    </>
  )
}

function MemorableControls({
  settings,
  onSettingsChange,
}: {
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
}) {
  const s = settings.memorable
  return (
    <>
      <SliderControl
        label="Words"
        value={s.words}
        min={2}
        max={20}
        onChange={(v) => onSettingsChange({ memorable: { ...s, words: v } })}
      />
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Case:</span>
          <ToggleGroup
            type="single"
            value={s.caseStyle}
            onValueChange={(v) => {
              if (v)
                onSettingsChange({
                  memorable: {
                    ...s,
                    caseStyle: v as "lower" | "upper" | "title",
                  },
                })
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="lower">abc</ToggleGroupItem>
            <ToggleGroupItem value="upper">ABC</ToggleGroupItem>
            <ToggleGroupItem value="title">Abc</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sep:</span>
          <ToggleGroup
            type="single"
            value={s.separator}
            onValueChange={(v) => {
              if (v)
                onSettingsChange({
                  memorable: {
                    ...s,
                    separator: v as
                      | "hyphen"
                      | "space"
                      | "dot"
                      | "underscore"
                      | "custom",
                  },
                })
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="hyphen">-</ToggleGroupItem>
            <ToggleGroupItem value="space">⎵</ToggleGroupItem>
            <ToggleGroupItem value="dot">.</ToggleGroupItem>
            <ToggleGroupItem value="underscore">_</ToggleGroupItem>
            <ToggleGroupItem value="custom">...</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ButtonToggle
          label="Leet"
          pressed={s.leet}
          onPressedChange={(v) =>
            onSettingsChange({ memorable: { ...s, leet: v } })
          }
        />
      </div>
      {s.separator === "custom" && (
        <InlineInputRow
          label="Custom sep"
          value={s.customSeparator}
          onChange={(value) =>
            onSettingsChange({
              memorable: { ...s, customSeparator: value.slice(0, 8) },
            })
          }
          placeholder="Custom (max 8)"
          maxLength={8}
        />
      )}
    </>
  )
}

function PronounceableControls({
  settings,
  onSettingsChange,
}: {
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
}) {
  const s = settings.pronounceable
  return (
    <>
      <SliderControl
        label="Length"
        value={s.length}
        min={4}
        max={128}
        onChange={(v) =>
          onSettingsChange({ pronounceable: { ...s, length: v } })
        }
      />
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Case:</span>
          <ToggleGroup
            type="single"
            value={s.caseStyle}
            onValueChange={(v) => {
              if (v)
                onSettingsChange({
                  pronounceable: {
                    ...s,
                    caseStyle: v as "lower" | "upper" | "mixed",
                  },
                })
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="lower">abc</ToggleGroupItem>
            <ToggleGroupItem value="upper">ABC</ToggleGroupItem>
            <ToggleGroupItem value="mixed">AbC</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ButtonToggle
          label="Numbers"
          pressed={s.includeNumbers}
          onPressedChange={(v) =>
            onSettingsChange({ pronounceable: { ...s, includeNumbers: v } })
          }
        />
        <ButtonToggle
          label="Symbols"
          pressed={s.includeSymbols}
          onPressedChange={(v) =>
            onSettingsChange({ pronounceable: { ...s, includeSymbols: v } })
          }
        />
        <ButtonToggle
          label="No ambiguous"
          pressed={s.excludeAmbiguous}
          onPressedChange={(v) =>
            onSettingsChange({ pronounceable: { ...s, excludeAmbiguous: v } })
          }
        />
      </div>
      <InlineInputRow
        label="Exclude"
        value={s.customExclusions}
        onChange={(value) =>
          onSettingsChange({ pronounceable: { ...s, customExclusions: value } })
        }
        placeholder="e.g. 0OoIl1"
      />
    </>
  )
}

function PinControls({
  settings,
  onSettingsChange,
}: {
  settings: Settings
  onSettingsChange: (partial: Partial<Settings>) => void
}) {
  const s = settings.pin
  return (
    <SliderControl
      label="Length"
      value={s.length}
      min={4}
      max={128}
      onChange={(v) => onSettingsChange({ pin: { ...s, length: v } })}
    />
  )
}

function InlineInputRow({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  maxLength?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 font-mono text-xs"
        maxLength={maxLength}
      />
    </div>
  )
}

function ButtonToggle({
  label,
  pressed,
  disabled = false,
  onPressedChange,
}: {
  label: string
  pressed: boolean
  disabled?: boolean
  onPressedChange: (pressed: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex h-7 items-center justify-center border px-2.5 text-xs font-medium transition-all select-none",
        pressed
          ? "border-input bg-muted text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {label}
    </button>
  )
}
