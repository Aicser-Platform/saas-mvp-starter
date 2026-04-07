import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ""

/** Call FastAPI with the internal secret (no user token needed) */
async function internalPatch(path: string, body: Record<string, unknown>) {
  return fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify(body),
  })
}

async function internalPost(path: string, body: Record<string, unknown>) {
  return fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify(body),
  })
}

/** Find a user in local DB by stripe_customer_id */
async function getUserByCustomerId(customerId: string): Promise<{ id: string; subscription_tier: string } | null> {
  const res = await fetch(`${API_BASE}/users/?limit=1000`, {
    headers: { "X-Internal-Secret": INTERNAL_SECRET },
  })
  if (!res.ok) return null
  const users: Array<{ id: string; stripe_customer_id: string; subscription_tier: string }> = await res.json()
  return users.find((u) => u.stripe_customer_id === customerId) ?? null
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("[webhook] Received:", event.type)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const tier = session.metadata?.tier

        if (!userId || !tier) break

        const subscriptionId = session.subscription as string

        // Update user subscription in local DB
        await internalPatch(`/users/${userId}`, {
          subscription_tier: tier,
          subscription_status: "active",
          stripe_subscription_id: subscriptionId,
          subscription_start_date: new Date().toISOString(),
        })

        // Record payment
        await internalPost("/payments/", {
          user_id: userId,
          provider: "stripe",
          provider_payment_id: (session.payment_intent as string) || session.id,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "succeeded",
          paid_at: new Date().toISOString(),
        })

        console.log("[webhook] Checkout completed for user:", userId)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await getUserByCustomerId(customerId)
        if (!user) {
          console.error("[webhook] No user found for customer:", customerId)
          break
        }

        let status = "active"
        if (subscription.status === "past_due") status = "past_due"
        else if (subscription.status === "canceled" || subscription.status === "incomplete_expired")
          status = "canceled"

        await internalPatch(`/users/${user.id}`, {
          subscription_status: status,
          subscription_end_date: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null,
        })

        console.log("[webhook] Subscription updated for user:", user.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await getUserByCustomerId(customerId)
        if (!user) break

        await internalPatch(`/users/${user.id}`, {
          subscription_tier: "free",
          subscription_status: "canceled",
          subscription_end_date: new Date().toISOString(),
        })

        console.log("[webhook] Subscription canceled for user:", user.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await getUserByCustomerId(customerId)
        if (!user) break

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paymentIntentId = (invoice as any).payment_intent as string | null
        await internalPost("/payments/", {
          user_id: user.id,
          provider: "stripe",
          provider_payment_id: paymentIntentId || invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "succeeded",
          paid_at: new Date().toISOString(),
        })

        console.log("[webhook] Payment succeeded for user:", user.id)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await getUserByCustomerId(customerId)
        if (!user) break

        await internalPatch(`/users/${user.id}`, { subscription_status: "past_due" })
        console.log("[webhook] Payment failed for user:", user.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[webhook] Handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
