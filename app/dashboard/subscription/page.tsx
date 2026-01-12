import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown } from "lucide-react"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"
import Link from "next/link"

export default async function SubscriptionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose the plan that works best for you. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Crown className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Current Plan: {profile?.subscription_tier?.toUpperCase()}</h2>
              <p className="text-sm text-muted-foreground">
                Status: {profile?.subscription_status === "active" ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PRODUCTS.map((product) => {
            const isCurrentPlan = product.tier === profile?.subscription_tier
            const isUpgrade =
              (profile?.subscription_tier === "free" && product.tier !== "free") ||
              (profile?.subscription_tier === "pro" && product.tier === "premium")

            return (
              <Card key={product.id} className={isCurrentPlan ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  {isCurrentPlan && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground mb-2 w-fit">
                      Current Plan
                    </div>
                  )}
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${product.priceInCents === 0 ? "0" : (product.priceInCents / 100).toFixed(2)}
                    </span>
                    {product.priceInCents > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Link href={`/dashboard/checkout?tier=${product.tier}`}>
                      <Button className="w-full" variant={isUpgrade ? "default" : "outline"}>
                        {isUpgrade ? "Upgrade" : "Downgrade"} to {product.name}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
