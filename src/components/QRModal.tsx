import { useState, useCallback, useEffect, useRef } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { copyToClipboard, scheduleClipboardClear } from "@/lib/clipboard"
import { Copy, Check } from "lucide-react"

type QRModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string | null
}

export function QRModal({ open, onOpenChange, value }: QRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const cancelClipboardClearRef = useRef<(() => void) | null>(null)

  const generateQR = useCallback(async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: "M",
      })
      setQrDataUrl(url)
      setError(false)
    } catch {
      setError(true)
      setQrDataUrl(null)
    }
  }, [])

  useEffect(() => {
    if (open && value) {
      void generateQR(value)
      return
    }

    if (!open) {
      setQrDataUrl(null)
      setCopied(false)
      setError(false)
      if (cancelClipboardClearRef.current) {
        cancelClipboardClearRef.current()
        cancelClipboardClearRef.current = null
      }
    }
  }, [open, value, generateQR])

  useEffect(() => {
    return () => {
      if (cancelClipboardClearRef.current) {
        cancelClipboardClearRef.current()
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (!value) return
    const success = await copyToClipboard(value)
    if (success) {
      setCopied(true)
      if (cancelClipboardClearRef.current) {
        cancelClipboardClearRef.current()
      }
      cancelClipboardClearRef.current = scheduleClipboardClear(30000)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [value])

  const passwordLabel =
    value && value.length > 8 ? `${value.slice(0, 8)}...` : value

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code Transfer</DialogTitle>
          <DialogDescription>
            Scan this QR code to transfer the password to another device. Be
            aware of shoulder-surfing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {passwordLabel ? (
            <p className="max-w-full truncate font-mono text-xs text-muted-foreground">
              Password: {passwordLabel}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive">
              Could not generate QR code. The password may be too long.
            </p>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR code containing the generated password"
              className="size-56 rounded-none border border-border"
            />
          ) : null}
          <p className="text-center text-xs text-muted-foreground">
            Generated locally. No data sent externally.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
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
            {copied ? "Copied" : "Copy Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
