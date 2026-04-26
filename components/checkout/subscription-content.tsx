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
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${tierGradients[currentTier]} border p-6`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${tierBadgeColors[currentTier]}`}>
              {tierIcons[currentTier]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize">{currentTier} Plan</h2>
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                    {isActive ? "Active" : status || "Inactive"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
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
              className="shrink-0"
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
            <Card
              key={product.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                isCurrentPlan
                  ? `ring-2 ring-primary shadow-lg ${tierBorders[product.tier]}`
                  : isPopular
                    ? "border-blue-200 dark:border-blue-800 shadow-md"
                    : ""
              }`}
            >
              {/* Popular Badge */}
              {isPopular && !isCurrentPlan && (
                <div className="absolute top-0 right-0">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-bl-lg">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-0 right-0">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-bl-lg">
                    <Check className="h-3 w-3" />
                    Current Plan
                  </div>
                </div>
              )}

              <CardHeader className="pt-8 pb-4">
                <div className={`inline-flex p-2.5 rounded-xl mb-3 w-fit ${tierBadgeColors[product.tier]}`}>
                  {tierIcons[product.tier]}
                </div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription className="text-sm">{product.description}</CardDescription>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    ${product.priceInCents === 0 ? "0" : (product.priceInCents / 100).toFixed(2)}
                  </span>
                  {product.priceInCents > 0 && (
                    <span className="text-muted-foreground text-sm font-medium">/month</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pb-8">
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 rounded-full p-0.5 ${
                        product.tier === "premium"
                          ? "text-purple-500"
                          : product.tier === "pro"
                            ? "text-blue-500"
                            : "text-slate-400"
                      }`}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Current Plan
                  </Button>
                ) : product.tier === "free" ? (
                  // Can't downgrade to free via checkout — use Stripe portal
                  currentTier !== "free" ? (
                    <Button
                      className="w-full"
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
                ) : (
                  <div className="space-y-2.5">
                    {/* Stripe Button */}
                    <Button
                      className={`w-full ${
                        isUpgrade
                          ? product.tier === "premium"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                          : ""
                      }`}
                      variant={isUpgrade ? "default" : "outline"}
                      onClick={() => handleCheckout(product.tier)}
                      disabled={loadingTier !== null || khqrLoadingTier !== null}
                    >
                      {loadingTier === product.tier ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : isUpgrade ? (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay with Card
                        </>
                      ) : isDowngrade ? (
                        "Downgrade (via Billing Portal)"
                      ) : (
                        `Get ${product.name}`
                      )}
                    </Button>

                    {/* KHQR Button — only for upgrades */}
                    {isUpgrade && (
                      <Button
                        className="w-full border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        variant="outline"
                        onClick={() => handleKHQRCheckout(product.tier)}
                        disabled={loadingTier !== null || khqrLoadingTier !== null}
                      >
                        {khqrLoadingTier === product.tier ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating QR...
                          </>
                        ) : (
                          <>
                            <QrCode className="mr-2 h-4 w-4" />
                            Pay with KHQR
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
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
    </div>
  )
}
