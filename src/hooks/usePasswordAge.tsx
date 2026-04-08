import { useState, useMemo } from "react"
import { useMountEffect } from "@/hooks/useMountEffect"

function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function PasswordAge({ createdAt }: { createdAt: number }) {
  const [now, setNow] = useState(Date.now)

  useMountEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  })

  const age = useMemo(() => formatAge(now - createdAt), [createdAt, now])

  return <p className="text-[10px] text-muted-foreground/60">{age}</p>
}
