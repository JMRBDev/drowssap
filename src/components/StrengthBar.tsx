import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { getStrengthTier } from "@/lib/strength"

type StrengthBarProps = {
  entropyBits: number
  className?: string
}

export function StrengthBar({ entropyBits, className }: StrengthBarProps) {
  const tier = getStrengthTier(entropyBits)

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
      <Progress
        value={tier.percent}
        className="h-1.5 **:data-[slot=progress-indicator]:bg-(--tier-color)"
        aria-label={`${tier.label} — ${entropyBits.toFixed(1)} bits of entropy`}
        style={{ "--tier-color": tier.color } as React.CSSProperties}
      />
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
