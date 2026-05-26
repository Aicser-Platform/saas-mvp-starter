"use client"

import type { User } from "@/lib/types"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Sparkles, Zap, Shield, Loader2, CreditCard, ExternalLink, QrCode } from "lucide-react"
import { createCheckoutSession, createPortalSession } from "@/app/actions/stripe"
import { createKHQRSession } from "@/app/actions/bakong"
import { KHQRPaymentDialog } from "@/components/checkout/khqr-payment-dialog"
import { PaymentMethodDialog } from "@/components/checkout/payment-method-dialog"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSubscription } from "@/lib/hooks/use-subscription"

interface SubscriptionContentProps {
  profile: User | null
}

const tierIcons: Record<string, React.ReactNode> = {
  free: <Shield className="h-6 w-6" />,
  pro: <Zap className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
}

const tierGradients: Record<string, string> = {
  free: "from-slate-500/20 to-slate-600/10",
  pro: "from-blue-500/20 to-indigo-600/10",
  premium: "from-purple-500/20 to-pink-600/10",
}

const tierBorders: Record<string, string> = {
  free: "border-slate-200 dark:border-slate-800",
  pro: "border-blue-300 dark:border-blue-800 shadow-blue-500/10",
  premium: "border-purple-300 dark:border-purple-800 shadow-purple-500/10",
}

const tierBadgeColors: Record<string, string> = {
  free: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  premium: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
}

export function SubscriptionContent({ profile }: SubscriptionContentProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [khqrLoadingTier, setKhqrLoadingTier] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const { tier, status, isLoading, refresh } = useSubscription()

  // KHQR dialog state
  const [khqrOpen, setKhqrOpen] = useState(false)
  const [khqrData, setKhqrData] = useState<string | null>(null)
  const [khqrMd5, setKhqrMd5] = useState<string | null>(null)
  const [khqrPaymentId, setKhqrPaymentId] = useState<string | null>(null)
  const [khqrAmountKHR, setKhqrAmountKHR] = useState(0)
  const [khqrAmountUSD, setKhqrAmountUSD] = useState(0)
  const [khqrTier, setKhqrTier] = useState("")

  // Payment Method Dialog State
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false)
  const [selectedTierForPayment, setSelectedTierForPayment] = useState<string | null>(null)

  useEffect(() => {
    // If user just returned from checkout success
    if (searchParams.get("canceled")) {
      setError("Payment canceled. Your plan handles were not changed.")
      router.replace("/dashboard/subscription")
    } else {
      // Force refresh on mount in case it was cached
      refresh()
    }
  }, [searchParams, router, refresh])

  // Use the fetched tier or fallback to profile
  const currentTier = !isLoading ? tier : (profile?.subscription_tier || "free")
  const isActive = !isLoading ? (status === "active" || status === "trialing") : (profile?.subscription_status === "active")

  const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }
  const currentLevel = tierHierarchy[currentTier] ?? 0

  const handleCheckout = async (targetTier: string) => {
    setLoadingTier(targetTier)
    setError(null)
    setSuccessMessage(null)
    try {
      const url = await createCheckoutSession(targetTier)
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout")
      setLoadingTier(null)
    }
  }

  const handleKHQRCheckout = async (targetTier: string) => {
    setKhqrLoadingTier(targetTier)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await createKHQRSession(targetTier)
      setKhqrData(result.qr_data)
      setKhqrMd5(result.md5)
      setKhqrPaymentId(result.payment_id)
      setKhqrAmountKHR(result.amount_khr)
      setKhqrAmountUSD(result.amount_usd)
      setKhqrTier(targetTier)
      setKhqrOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate KHQR")
    } finally {
      setKhqrLoadingTier(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const url = await createPortalSession()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal")
      setPortalLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground text-lg">
          Choose the plan that works best for you. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current Plan Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-6 shadow-sm">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/15 text-primary-foreground">
              {tierIcons[currentTier]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize text-primary-foreground">{currentTier} Plan</h2>
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary-foreground/60" />
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-primary-foreground">
                    {isActive ? "Active" : status || "Inactive"}
                  </span>
                )}
              </div>
              <p className="text-sm text-primary-foreground/70 mt-0.5">
                {currentTier === "free"
                  ? "You're on the free plan. Upgrade to unlock more courses."
                  : `Your ${currentTier} subscription is ${isActive ? "active" : status}.`}
              </p>
            </div>
          </div>

          {currentTier !== "free" && isActive && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="shrink-0 bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                  <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-800 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {SUBSCRIPTION_PRODUCTS.map((product) => {
          const productLevel = tierHierarchy[product.tier] ?? 0
          const isCurrentPlan = product.tier === currentTier
          const isUpgrade = productLevel > currentLevel
          const isDowngrade = productLevel < currentLevel && currentTier !== "free"
          const isPopular = product.tier === "pro"

          return (
            <Card key={product.id} className={product.tier === "pro" ? "border-primary shadow-lg md:scale-105" : ""}>
              <CardHeader>
                {product.tier === "pro" && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground mb-2 w-fit">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && product.tier !== "pro" && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold mb-2 w-fit">
                    Current Plan
                  </div>
                )}
                <CardTitle className="text-xl sm:text-2xl">{product.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{product.description}</CardDescription>
                <div className="mt-4 space-y-1">
                  <span className="text-3xl sm:text-4xl font-bold">
                    ${product.priceInCents === 0 ? "0" : (product.priceInCents / 100).toFixed(2)}
                  </span>
                  {product.priceInCents > 0 && (
                    <span className="text-xs sm:text-sm text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 sm:space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button className="w-full text-sm sm:text-base" variant="outline" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </Button>
                  ) : product.tier === "free" ? (
                    currentTier !== "free" ? (
                      <Button
                        className="w-full text-sm sm:text-base"
                        variant="outline"
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                      >
                        {portalLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Manage in Billing Portal"
                        )}
                      </Button>
                    ) : null
                  ) : isDowngrade ? (
                    <Button
                      className="w-full text-sm sm:text-base"
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Downgrade (via Portal)"
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full text-sm sm:text-base"
                      variant={product.tier === "pro" ? "default" : "outline"}
                      onClick={() => {
                        setSelectedTierForPayment(product.tier)
                        setPaymentMethodOpen(true)
                      }}
                      disabled={loadingTier !== null || khqrLoadingTier !== null}
                    >
                      {(loadingTier === product.tier || khqrLoadingTier === product.tier) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Upgrade to " + product.name
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trust Footer */}
      <div className="text-center space-y-2 pt-4 pb-8">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            <span>Stripe</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <QrCode className="h-4 w-4" />
            <span>Bakong KHQR</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Payments are securely processed. Cancel anytime. No hidden fees.
        </p>
      </div>

      {/* KHQR Payment Dialog */}
      <KHQRPaymentDialog
        open={khqrOpen}
        onOpenChange={setKhqrOpen}
        qrData={khqrData}
        md5={khqrMd5}
        paymentId={khqrPaymentId}
        amountKHR={khqrAmountKHR}
        amountUSD={khqrAmountUSD}
        tier={khqrTier}
      />

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={paymentMethodOpen}
        onOpenChange={setPaymentMethodOpen}
        tier={selectedTierForPayment || ""}
        onSelectStripe={() => {
          if (selectedTierForPayment) handleCheckout(selectedTierForPayment)
        }}
        onSelectKHQR={() => {
          if (selectedTierForPayment) handleKHQRCheckout(selectedTierForPayment)
        }}
      />
    </div>
  )
}
