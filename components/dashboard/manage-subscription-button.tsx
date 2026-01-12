"use client"

import { Button } from "@/components/ui/button"
import { createPortalSession } from "@/app/actions/stripe"
import { CreditCard, Loader2 } from "lucide-react"
import { useState } from "react"

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const url = await createPortalSession()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleManageSubscription} disabled={isLoading} variant="outline">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Subscription
        </>
      )}
    </Button>
  )
}
