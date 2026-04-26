"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { checkKHQRPayment, cancelKHQRPayment } from "@/app/actions/bakong"
import { Loader2, CheckCircle2, XCircle, Clock, QrCode, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"

interface KHQRPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrData: string | null
  md5: string | null
  paymentId: string | null
  amountKHR: number
  amountUSD: number
  tier: string
}

const POLL_INTERVAL_MS = 3000
const MAX_POLL_DURATION_MS = 5 * 60 * 1000 // 5 minutes

type PaymentStatus = "pending" | "checking" | "paid" | "canceled" | "expired" | "error"

export function KHQRPaymentDialog({
  open,
  onOpenChange,
  qrData,
  md5,
  paymentId,
  amountKHR,
  amountUSD,
  tier,
}: KHQRPaymentDialogProps) {
  const [status, setStatus] = useState<PaymentStatus>("pending")
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const router = useRouter()

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pollPayment = useCallback(async () => {
    if (!paymentId) return

    try {
      const result = await checkKHQRPayment(paymentId)

      if (result.status === "paid") {
        setStatus("paid")
        cleanup()
        // Redirect after a short delay to show success
        setTimeout(() => {
          router.push("/dashboard?subscription=success")
        }, 2000)
      }
    } catch (err) {
      console.error("Payment check error:", err)
      // Don't stop polling on transient errors
    }
  }, [paymentId, cleanup, router])

  // Start polling when dialog opens
  useEffect(() => {
    if (!open || !paymentId || status === "paid" || status === "canceled") {
      return
    }

    setStatus("pending")
    setError(null)
    setElapsedMs(0)
    startTimeRef.current = Date.now()

    // Start countdown timer
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setElapsedMs(elapsed)

      if (elapsed >= MAX_POLL_DURATION_MS) {
        setStatus("expired")
        cleanup()
      }
    }, 1000)

    // Start polling
    pollRef.current = setInterval(pollPayment, POLL_INTERVAL_MS)

    return cleanup
  }, [open, paymentId, status, pollPayment, cleanup])

  const handleCancel = async () => {
    cleanup()
    if (paymentId) {
      try {
        await cancelKHQRPayment(paymentId)
      } catch {
        // Ignore cancel errors
      }
    }
    setStatus("canceled")
    onOpenChange(false)
  }

  const handleClose = () => {
    if (status === "pending") {
      handleCancel()
    } else {
      onOpenChange(false)
    }
  }

  const remainingSeconds = Math.max(0, Math.ceil((MAX_POLL_DURATION_MS - elapsedMs) / 1000))
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={status !== "paid"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <QrCode className="h-5 w-5 text-primary" />
            Pay with Bakong KHQR
          </DialogTitle>
          <DialogDescription className="text-center">
            Scan the QR code with any Bakong-supported banking app
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* QR Code */}
          {status === "pending" && qrData && (
            <>
              <div className="relative rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                <QRCodeSVG
                  value={qrData}
                  size={240}
                  level="M"
                  marginSize={2}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
                {/* Bakong overlay badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
                  BAKONG KHQR
                </div>
              </div>

              {/* Amount Display */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Banknote className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-foreground">
                    {amountKHR.toLocaleString()} KHR
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ≈ ${amountUSD.toFixed(2)} USD • <span className="capitalize font-medium">{tier}</span> Plan
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Expires in {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Waiting for payment...</span>
              </div>
            </>
          )}

          {/* Paid State */}
          {status === "paid" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your <span className="capitalize font-medium">{tier}</span> plan is now active.
                </p>
                <p className="text-xs text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === "expired" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-4">
                <Clock className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">QR Code Expired</h3>
                <p className="text-sm text-muted-foreground">
                  The payment window has expired. Please try again.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Payment Error</h3>
                <p className="text-sm text-muted-foreground">{error || "Something went wrong."}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          {status === "pending" && (
            <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
              Cancel Payment
            </Button>
          )}
          {(status === "expired" || status === "error" || status === "canceled") && (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
