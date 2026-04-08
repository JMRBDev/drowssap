import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <Tabs
      value={activeMode}
      onValueChange={(v) => onModeChange(v as GeneratorMode)}
      className={className}
    >
      <TabsList className="w-full bg-background">
        {MODES.map(({ mode, label, icon: Icon, disabled, disabledReason }) => (
          <TabsTrigger
            key={mode}
            value={mode}
            disabled={disabled}
            title={disabledReason}
          >
            <Icon className="size-3.5" data-icon="inline-start" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
