import { cn } from "@/lib/utils"
import { getStrengthTier } from "@/lib/strength"
import type { GeneratorMode } from "@/lib/types"

type StrengthBarProps = {
  entropyBits: number
  mode?: GeneratorMode
  className?: string
}

const METHODOLOGY_HINTS: Partial<Record<GeneratorMode, string>> = {
  memorable: "Entropy based on 7,776-word EFF list (log2(7776) × words)",
  pronounceable: "Entropy approximates CV/CVC syllable state space",
}

export function StrengthBar({
  entropyBits,
  mode,
  className,
}: StrengthBarProps) {
  const tier = getStrengthTier(entropyBits)
  const methodologyHint = mode ? METHODOLOGY_HINTS[mode] : undefined

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium" style={{ color: tier.color }}>
          {tier.label}
        </span>
        <span className="text-muted-foreground">
          {entropyBits.toFixed(1)} bits
        </span>
      </div>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-none bg-muted"
        role="progressbar"
        aria-valuenow={tier.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${tier.label} — ${entropyBits.toFixed(1)} bits of entropy`}
      >
        <div
          className="relative h-full overflow-hidden transition-all duration-500"
          style={{
            width: `${tier.percent}%`,
            backgroundColor: tier.color,
          }}
        >
          <div
            aria-hidden="true"
            className="strength-bar-shine pointer-events-none absolute inset-y-0 w-1/2"
          />
        </div>
      </div>
      {methodologyHint ? (
        <p className="text-[10px] text-muted-foreground/80">
          {methodologyHint}
        </p>
      ) : null}
    </div>
  )
}

export function CrackTimeDisplay({
  crackTimeEstimate,
  className,
}: {
  crackTimeEstimate: string
  className?: string
}) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      ~{crackTimeEstimate} at 1T guesses/sec
    </div>
  )
}
