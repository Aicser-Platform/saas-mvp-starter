import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

// Create Supabase admin client for webhook handling
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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
    console.error("[v0] Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("[v0] Received webhook event:", event.type)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const tier = session.metadata?.tier

        if (!userId || !tier) {
          console.error("[v0] Missing userId or tier in checkout session metadata")
          break
        }

        // Get subscription details
        const subscriptionId = session.subscription as string

        // Update user profile with subscription details
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            stripe_subscription_id: subscriptionId,
            subscription_start_date: new Date().toISOString(),
          })
          .eq("id", userId)

        // Record payment
        await supabaseAdmin.from("payments").insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "succeeded",
          subscription_tier: tier,
        })

        console.log("[v0] Checkout session completed for user:", userId)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          console.error("[v0] No profile found for customer:", customerId)
          break
        }

        // Update subscription status
        let status = "active"
        if (subscription.status === "past_due") status = "past_due"
        else if (subscription.status === "canceled" || subscription.status === "incomplete_expired") status = "canceled"

        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: status,
            subscription_end_date: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
          })
          .eq("id", profile.id)

        console.log("[v0] Subscription updated for user:", profile.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          console.error("[v0] No profile found for customer:", customerId)
          break
        }

        // Downgrade to free tier
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "canceled",
            subscription_end_date: new Date().toISOString(),
          })
          .eq("id", profile.id)

        console.log("[v0] Subscription canceled for user:", profile.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          console.error("[v0] No profile found for customer:", customerId)
          break
        }

        // Record payment
        await supabaseAdmin.from("payments").insert({
          user_id: profile.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "succeeded",
          subscription_tier: profile.subscription_tier,
        })

        console.log("[v0] Payment succeeded for user:", profile.id)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          console.error("[v0] No profile found for customer:", customerId)
          break
        }

        // Update status to past_due
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", profile.id)

        console.log("[v0] Payment failed for user:", profile.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
