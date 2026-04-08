import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check } from "lucide-react"
import { useState, useCallback } from "react"

type HashModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hash: string | null
  formattedHash: string | null
}

export function HashModal({
  open,
  onOpenChange,
  hash,
  formattedHash,
}: HashModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!hash) return
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }, [hash])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>SHA-256 Hash</DialogTitle>
          <DialogDescription>
            Use this hash to verify you typed the password correctly later,
            without revealing the original password.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {formattedHash ? (
            <div className="rounded-none border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed break-all">
              {formattedHash}
            </div>
          ) : (
            <Skeleton className="h-16 w-full" />
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Copy the hash to verify your typed password later.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!hash}
              className="gap-1.5"
            >
              {copied ? (
                <Check
                  className="size-3 text-green-500"
                  data-icon="inline-start"
                />
              ) : (
                <Copy className="size-3" data-icon="inline-start" />
              )}
              {copied ? "Copied" : "Copy Hash"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
