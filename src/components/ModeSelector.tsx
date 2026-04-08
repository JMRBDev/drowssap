import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GeneratorMode } from "@/lib/types"
import { isWordlistAvailable } from "@/lib/generator/memorable"
import { Shuffle, MessageSquareText, Mic, Hash } from "lucide-react"
import type { ComponentType } from "react"

type ModeConfig = {
  mode: GeneratorMode
  label: string
  icon: ComponentType<{ className?: string }>
  disabled?: boolean
  disabledReason?: string
}

const MODES: ModeConfig[] = [
  { mode: "random", label: "Random", icon: Shuffle },
  {
    mode: "memorable",
    label: "Memorable",
    icon: MessageSquareText,
    disabled: !isWordlistAvailable(),
    disabledReason:
      "Passphrase mode unavailable - word list could not be loaded",
  },
  { mode: "pronounceable", label: "Pronounceable", icon: Mic },
  { mode: "pin", label: "PIN", icon: Hash },
]

type ModeSelectorProps = {
  activeMode: GeneratorMode
  onModeChange: (mode: GeneratorMode) => void
  className?: string
}

export function ModeSelector({
  activeMode,
  onModeChange,
  className,
}: ModeSelectorProps) {
  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      role="radiogroup"
      aria-label="Password mode"
    >
      <div className="flex gap-1">
        {MODES.map(({ mode, label, icon: Icon, disabled, disabledReason }) => (
          <Button
            key={mode}
            variant={activeMode === mode ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 gap-1.5",
              activeMode === mode && "shadow-none",
              disabled && "opacity-50"
            )}
            onClick={() => !disabled && onModeChange(mode)}
            disabled={disabled}
            role="radio"
            aria-checked={activeMode === mode}
            title={disabledReason}
          >
            <Icon className="size-3.5" data-icon="inline-start" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
