import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { Alert } from "@/components/ui/alert"
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
} from "@/components/ui/field"
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
    <Field className="items-center gap-3">
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={1}
          onValueChange={([v]) => onChange(v)}
        />
      </FieldContent>
      <FieldDescription className="text-end tabular-nums">
        {value}
      </FieldDescription>
    </Field>
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
        <Alert variant="destructive" className="px-3 py-2 text-xs">
          {validation.warnings.join(". ")}
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.includeLower}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeLower: v } })
          }
        >
          a-z
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.includeUpper}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeUpper: v } })
          }
        >
          A-Z
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.includeNumbers}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeNumbers: v } })
          }
        >
          0-9
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.includeSymbols}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, includeSymbols: v } })
          }
        >
          !@#
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.startWithLetter}
          disabled={!canStartWithLetter}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, startWithLetter: v } })
          }
        >
          Start w/ letter
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.excludeAmbiguous}
          onPressedChange={(v) =>
            onSettingsChange({ random: { ...s, excludeAmbiguous: v } })
          }
        >
          No ambiguous
        </Toggle>
      </div>
      {!canStartWithLetter && (
        <p className="text-[11px] text-muted-foreground">
          Enable lowercase or uppercase letters to use start-with-letter.
        </p>
      )}
      <Field>
        <FieldLabel>Exclude</FieldLabel>
        <FieldContent>
          <Input
            value={s.customExclusions}
            onChange={(event) => {
              onSettingsChange({
                random: { ...s, customExclusions: event.target.value },
              })
            }}
            placeholder="e.g. 0OoIl1"
            className="h-7 font-mono text-xs"
          />
        </FieldContent>
      </Field>
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
          <span className="text-xs text-muted-foreground">Separator:</span>
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
            <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.leet}
          onPressedChange={(v) =>
            onSettingsChange({ memorable: { ...s, leet: v } })
          }
        >
          L33t syntax
        </Toggle>
      </div>
      {s.separator === "custom" && (
        <Field>
          <FieldLabel>Custom separator</FieldLabel>
          <FieldContent>
            <Input
              value={s.customSeparator}
              onChange={(event) => {
                onSettingsChange({
                  memorable: {
                    ...s,
                    customSeparator: event.target.value.slice(0, 8),
                  },
                })
              }}
              placeholder="Custom (max 8)"
              maxLength={8}
              className="h-7 font-mono text-xs"
            />
          </FieldContent>
        </Field>
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
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.includeNumbers}
          onPressedChange={(v) =>
            onSettingsChange({ pronounceable: { ...s, includeNumbers: v } })
          }
        >
          Numbers
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.includeSymbols}
          onPressedChange={(v) =>
            onSettingsChange({ pronounceable: { ...s, includeSymbols: v } })
          }
        >
          Symbols
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={s.excludeAmbiguous}
          onPressedChange={(v) =>
            onSettingsChange({ pronounceable: { ...s, excludeAmbiguous: v } })
          }
        >
          No ambiguous
        </Toggle>
      </div>
      <Field>
        <FieldLabel>Exclude</FieldLabel>
        <FieldContent>
          <Input
            value={s.customExclusions}
            onChange={(event) => {
              onSettingsChange({
                pronounceable: { ...s, customExclusions: event.target.value },
              })
            }}
            placeholder="e.g. 0OoIl1"
          />
        </FieldContent>
      </Field>
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
