import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileData } from "@/lib/supabase/admin"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier } = await searchParams
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const profile = await getProfileData(session.user.id)

  if (!tier || tier === "free") {
    redirect("/dashboard/subscription")
  }

  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.tier === tier)

  if (!product) {
    redirect("/dashboard/subscription")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <CheckoutForm product={product} />
        </div>
      </main>
    </div>
  )
}
