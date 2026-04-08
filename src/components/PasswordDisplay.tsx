import { useMemo } from "react"
import type { Composition } from "@/lib/types"
import { cn } from "@/lib/utils"

type CharType = "letter" | "number" | "symbol" | "separator"

function classifyChar(ch: string): CharType {
  if (/[a-zA-Z]/.test(ch)) return "letter"
  if (/[0-9]/.test(ch)) return "number"
  return "symbol"
}

const CHAR_COLORS: Record<CharType, string> = {
  letter: "text-foreground",
  number: "text-blue-500 dark:text-blue-400",
  symbol: "text-amber-600 dark:text-amber-400",
  separator: "text-muted-foreground",
}

type PasswordDisplayProps = {
  value: string | null
  mode: string
  composition?: Composition
  className?: string
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`
}

function getCompositionDescription(composition?: Composition) {
  if (!composition) return null

  const parts = [
    composition.letters > 0 ? pluralize(composition.letters, "letter") : null,
    composition.numbers > 0 ? pluralize(composition.numbers, "number") : null,
    composition.symbols > 0 ? pluralize(composition.symbols, "symbol") : null,
    composition.separators && composition.separators > 0
      ? pluralize(composition.separators, "separator")
      : null,
  ].filter(Boolean)

  return parts.length > 0 ? `Contains ${parts.join(", ")}` : null
}

export function PasswordDisplay({
  value,
  mode,
  composition,
  className,
}: PasswordDisplayProps) {
  const segments = useMemo(() => {
    if (!value) return []
    return value.split("").map((ch, i) => ({
      char: ch,
      type:
        mode === "memorable" && /[- ._]/.test(ch)
          ? ("separator" as CharType)
          : classifyChar(ch),
      key: i,
    }))
  }, [value, mode])

  const compositionDescription = useMemo(
    () => getCompositionDescription(composition),
    [composition]
  )

  if (!value) {
    return (
      <div
        className={cn(
          "flex min-h-16 items-center justify-center rounded-none border border-dashed border-border px-4 py-3 text-muted-foreground",
          className
        )}
      >
        Press generate to create a password
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-16 items-center justify-center rounded-none border border-border bg-background px-4 py-3 font-mono text-xl leading-relaxed tracking-wide break-all transition-colors",
        className
      )}
      role="textbox"
      aria-label="Generated password"
      aria-readonly="true"
    >
      {segments.map(({ char, type, key }) => (
        <span key={key} className={cn(CHAR_COLORS[type])}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
      {compositionDescription ? (
        <span className="sr-only">{compositionDescription}</span>
      ) : null}
    </div>
  )
}
