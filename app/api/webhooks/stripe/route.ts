import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ""

/** Call FastAPI with the internal secret (no user token needed) */
async function internalPatch(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    console.error(`[webhook] internalPatch ${path} failed ${res.status}:`, text)
  }
  return res
}

async function internalPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    console.error(`[webhook] internalPost ${path} failed ${res.status}:`, text)
  }
  return res
}

/** Find a plan by name (tier) */
async function getPlanByName(tier: string): Promise<{ id: string } | null> {
  const res = await fetch(`${API_BASE}/plans/`, {
    headers: { "X-Internal-Secret": INTERNAL_SECRET },
  })
  if (!res.ok) return null
  const plans: Array<{ id: string; name: string }> = await res.json()
  return plans.find((p) => p.name.toLowerCase() === tier.toLowerCase()) ?? null
}

/** Find a user by Stripe customer ID */
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
        const customerId = session.customer as string

        // Upsert billing account so we can look up user by Stripe customer ID
        if (customerId) {
          await internalPost(`/billing-accounts/upsert?user_id=${userId}&provider=stripe&customer_id=${customerId}`, {})
        }

        // Find the plan record for this tier
        const plan = await getPlanByName(tier)

        if (plan) {
          // Create subscription record in local DB
          await internalPost("/subscriptions/", {
            user_id: userId,
            plan_id: plan.id,
            status: "active",
            provider_subscription_id: subscriptionId,
            current_period_start: new Date().toISOString(),
          })
        }

        // NOTE: the payment row is recorded on `invoice.payment_succeeded` (the
        // canonical charge event, which also covers renewals). Recording it here
        // too would create a duplicate for the first charge.

        console.log("[webhook] Checkout completed for user:", userId, "tier:", tier)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const providerSubId = subscription.id

        let status = "active"
        if (subscription.status === "past_due") status = "past_due"
        else if (subscription.status === "canceled" || subscription.status === "incomplete_expired")
          status = "canceled"

        // Update subscription by provider ID
        await internalPatch(`/subscriptions/by-provider-id/${providerSubId}`, {
          status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        })

        console.log("[webhook] Subscription updated:", providerSubId, "status:", status)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const providerSubId = subscription.id
        const customerId = subscription.customer as string

        const patchRes = await internalPatch(`/subscriptions/by-provider-id/${providerSubId}`, {
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })

        // Fallback: if no row matched the provider ID, cancel by user lookup
        if (patchRes.status === 404 && customerId) {
          const user = await getUserByCustomerId(customerId)
          if (user) {
            await internalPost(`/subscriptions/cancel-active`, {
              user_id: user.id,
            })
            console.log("[webhook] Subscription canceled via user fallback for:", user.id)
          }
        }

        console.log("[webhook] Subscription deleted:", providerSubId)
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
          payment_method: "card",
          paid_at: new Date().toISOString(),
        })

        console.log("[webhook] Payment succeeded for user:", user.id)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find subscription by customer
        const user = await getUserByCustomerId(customerId)
        if (!user) break

        // Record the failed payment so it shows in admin Payment History
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const failedPaymentIntentId = (invoice as any).payment_intent as string | null
        await internalPost("/payments/", {
          user_id: user.id,
          provider: "stripe",
          provider_payment_id: failedPaymentIntentId || invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: "failed",
          payment_method: "card",
        })

        // We could also find the sub by provider ID from invoice.subscription
        const subId = invoice.subscription as string
        if (subId) {
          await internalPatch(`/subscriptions/by-provider-id/${subId}`, {
            status: "past_due",
          })
        }

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
