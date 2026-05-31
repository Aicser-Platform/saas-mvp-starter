"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { apiGet } from "@/lib/api"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, CreditCard, BookOpen } from "lucide-react"

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPTS = 10 // ~20s

function SuccessInner() {
  const [confirmed, setConfirmed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [tier, setTier] = useState<string>("")
  const stopped = useRef(false)

  useEffect(() => {
    let attempts = 0

    const poll = async () => {
      if (stopped.current) return
      attempts += 1
      try {
        const user = await apiGet<User>("/users/me")
        const active = user.subscription_status === "active"
        if (active && user.subscription_tier !== "free") {
          setTier(user.subscription_tier)
          setConfirmed(true)
          stopped.current = true
          return
        }
      } catch {
        // ignore; retry
      }

      if (attempts >= MAX_ATTEMPTS) {
        setTimedOut(true)
        stopped.current = true
        return
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()
    return () => {
      stopped.current = true
    }
  }, [])

  const pending = !confirmed && !timedOut

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto">
            {pending ? (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>

          {pending ? (
            <>
              <CardTitle className="text-2xl">Confirming your payment…</CardTitle>
              <CardDescription>
                We&apos;re activating your subscription. This usually takes just a few seconds.
              </CardDescription>
            </>
          ) : confirmed ? (
            <>
              <CardTitle className="text-2xl">Payment successful!</CardTitle>
              <CardDescription>
                Your <span className="font-semibold capitalize">{tier}</span> plan is now active.
                Enjoy your unlocked courses.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Payment received</CardTitle>
              <CardDescription>
                Your payment went through. Activation is taking a little longer than usual —
                it will appear on your billing page shortly.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          <Button asChild className="w-full" disabled={pending}>
            <Link href="/dashboard/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Go to Billing
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  )
}
