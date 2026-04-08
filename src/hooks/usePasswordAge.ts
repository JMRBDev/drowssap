import { useState, useEffect, useRef, useMemo } from "react"

function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function usePasswordAge(createdAt: number | null) {
  const [now, setNow] = useState(Date.now)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!createdAt) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [createdAt])

  const age = useMemo(() => {
    if (!createdAt) return null
    return formatAge(now - createdAt)
  }, [createdAt, now])

  return age
}
