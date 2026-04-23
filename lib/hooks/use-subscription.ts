"use client"

import { useState, useEffect, useCallback } from "react"
import { apiGet } from "@/lib/api"
import type { User } from "@/lib/types"

const TIER_LEVELS: Record<string, number> = {
  free: 0,
  pro: 1,
  premium: 2,
}

interface SubscriptionState {
  tier: string
  status: string
  stripeCustomerId: string | null
  isLoading: boolean
  error: string | null
  canAccess: (requiredTier: string) => boolean
  refresh: () => Promise<void>
}

export function useSubscription(): SubscriptionState {
  const [tier, setTier] = useState("free")
  const [status, setStatus] = useState("inactive")
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const user = await apiGet<User>("/users/me")
      setTier(user.subscription_tier || "free")
      setStatus(user.subscription_status || "inactive")
      setStripeCustomerId(user.stripe_customer_id || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const canAccess = useCallback(
    (requiredTier: string) => {
      const userLevel = TIER_LEVELS[tier] ?? 0
      const requiredLevel = TIER_LEVELS[requiredTier?.toLowerCase()] ?? 0
      return userLevel >= requiredLevel
    },
    [tier]
  )

  return {
    tier,
    status,
    stripeCustomerId,
    isLoading,
    error,
    canAccess,
    refresh: fetchSubscription,
  }
}
