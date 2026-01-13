"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"

export async function createCheckoutSession(tier: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    throw new Error("Profile not found")
  }

  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.tier === tier)

  if (!product || product.tier === "free") {
    throw new Error("Invalid subscription tier")
  }

  // Create or get Stripe customer
  let customerId = profile.stripe_customer_id

  if (customerId) {
    try {
      // Verify the customer exists in Stripe
      await stripe.customers.retrieve(customerId)
    } catch (error) {
      console.log("[v0] Existing customer ID is invalid, creating new customer")
      customerId = null
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: {
        userId: user.id,
      },
    })
    customerId = customer.id

    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
  }

  // Create checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription?canceled=true`,
    metadata: {
      userId: user.id,
      tier: tier,
    },
  })

  return session.url
}

export async function createPortalSession() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.stripe_customer_id) {
    throw new Error("No Stripe customer found")
  }

  try {
    await stripe.customers.retrieve(profile.stripe_customer_id)
  } catch (error) {
    throw new Error("Invalid Stripe customer. Please contact support or try upgrading again.")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription`,
  })

  return session.url
}
