"use client"

import type { SubscriptionProduct } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createCheckoutSession } from "@/app/actions/stripe"
import { createKHQRSession } from "@/app/actions/bakong"
import { KHQRPaymentDialog } from "@/components/checkout/khqr-payment-dialog"
import { Check, Loader2, CreditCard, QrCode } from "lucide-react"
import { useState } from "react"

interface CheckoutFormProps {
  product: SubscriptionProduct
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [khqrLoading, setKhqrLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // KHQR dialog state
  const [khqrOpen, setKhqrOpen] = useState(false)
  const [khqrData, setKhqrData] = useState<string | null>(null)
  const [khqrMd5, setKhqrMd5] = useState<string | null>(null)
  const [khqrPaymentId, setKhqrPaymentId] = useState<string | null>(null)
  const [khqrAmountKHR, setKhqrAmountKHR] = useState(0)
  const [khqrAmountUSD, setKhqrAmountUSD] = useState(0)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = await createCheckoutSession(product.tier)
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create checkout session")
      setIsLoading(false)
    }
  }

  const handleKHQRCheckout = async () => {
    setKhqrLoading(true)
    setError(null)

    try {
      const result = await createKHQRSession(product.tier)
      setKhqrData(result.qr_data)
      setKhqrMd5(result.md5)
      setKhqrPaymentId(result.payment_id)
      setKhqrAmountKHR(result.amount_khr)
      setKhqrAmountUSD(result.amount_usd)
      setKhqrOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate KHQR code")
    } finally {
      setKhqrLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Subscribe to {product.name}</CardTitle>
          <CardDescription>Complete your subscription to unlock premium features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">Subscription Plan</span>
              <div>
                <span className="text-3xl font-bold">${(product.priceInCents / 100).toFixed(2)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">What's included:</h3>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">{error}</div>}

          {/* Payment Buttons */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading || khqrLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Card
                </>
              )}
            </Button>

            <Button
              className="w-full border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              variant="outline"
              size="lg"
              onClick={handleKHQRCheckout}
              disabled={isLoading || khqrLoading}
            >
              {khqrLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating QR code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Pay with KHQR
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span>Stripe</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <QrCode className="h-3 w-3" />
              <span>Bakong KHQR</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Payments are securely processed. Cancel anytime.
          </p>
        </CardContent>
      </Card>

      {/* KHQR Payment Dialog */}
      <KHQRPaymentDialog
        open={khqrOpen}
        onOpenChange={setKhqrOpen}
        qrData={khqrData}
        md5={khqrMd5}
        paymentId={khqrPaymentId}
        amountKHR={khqrAmountKHR}
        amountUSD={khqrAmountUSD}
        tier={product.tier}
      />
    </>
  )
}
