"use client"

import type { SubscriptionProduct } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Check, Loader2 } from "lucide-react"
import { useState } from "react"

interface CheckoutFormProps {
  product: SubscriptionProduct
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
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

        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You'll be redirected to Stripe's secure checkout page. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  )
}
