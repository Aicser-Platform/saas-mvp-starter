"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getSessionAndProfile(): Promise<{ token: string; profile: User }> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("User not authenticated")

  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Profile not found")
  const profile: User = await res.json()

  return { token: session.access_token, profile }
}

export async function createCheckoutSession(tier: string) {
  const { token, profile } = await getSessionAndProfile()

  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.tier === tier)
  if (!product || product.tier === "free") {
    throw new Error("Invalid subscription tier")
  }

  // Create or get Stripe customer
  let customerId = profile.stripe_customer_id

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId)
    } catch {
      customerId = null
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { userId: profile.id },
    })
    customerId = customer.id

    // Update stripe_customer_id in local DB via FastAPI
    await fetch(`${API_BASE}/users/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stripe_customer_id: customerId }),
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: product.name, description: product.description },
          unit_amount: product.priceInCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription?canceled=true`,
    metadata: { userId: profile.id, tier },
  })

  return session.url
}

export async function createPortalSession() {
  const { profile } = await getSessionAndProfile()

  if (!profile.stripe_customer_id) {
    throw new Error("No Stripe customer found")
  }

  try {
    await stripe.customers.retrieve(profile.stripe_customer_id)
  } catch {
    throw new Error("Invalid Stripe customer. Please contact support or try upgrading again.")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription`,
  })

  return session.url
}
