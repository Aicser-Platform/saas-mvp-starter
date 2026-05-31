"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { User, Invoice, Subscription } from "@/lib/types"
import { apiGet } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Crown,
  Zap,
  Shield,
  Receipt,
  ArrowUpRight,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { createPortalSession, getInvoices, cancelSubscription, resumeSubscription } from "@/app/actions/stripe"
import { useSubscription } from "@/lib/hooks/use-subscription"

interface BillingContentProps {
  profile: User | null
}

const tierIcons: Record<string, React.ReactNode> = {
  free: <Shield className="h-6 w-6" />,
  pro: <Zap className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
}

function formatTotal(inv: Invoice) {
  if (inv.currency?.toLowerCase() === "khr") {
    return `${inv.amount_paid.toLocaleString("km-KH")} ៛`
  }
  return `$${(inv.amount_paid / 100).toFixed(2)}`
}

function statusVariant(status: string | null): "success" | "destructive" | "outline" {
  if (status === "paid") return "success"
  if (status === "open" || status === "uncollectible" || status === "void") return "destructive"
  return "outline"
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function BillingContent({ profile }: BillingContentProps) {
  const { tier, status, isLoading, refresh } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [activeSub, setActiveSub] = useState<Subscription | null>(null)

  const currentTier = !isLoading ? tier : profile?.subscription_tier || "free"
  const isActive = !isLoading
    ? status === "active" || status === "trialing"
    : profile?.subscription_status === "active"

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch(() => setInvoices([]))
      .finally(() => setInvoicesLoading(false))

    apiGet<Subscription>("/subscriptions/me/active")
      .then(setActiveSub)
      .catch(() => setActiveSub(null))
  }, [])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    setError(null)
    try {
      const url = await createPortalSession()
      if (url) window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal")
      setPortalLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelLoading(true)
    setError(null)
    try {
      await cancelSubscription()
      await refresh()
      const sub = await apiGet<Subscription>("/subscriptions/me/active").catch(() => null)
      setActiveSub(sub)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription")
    } finally {
      setCancelLoading(false)
    }
  }

  const handleResume = async () => {
    setCancelLoading(true)
    setError(null)
    try {
      await resumeSubscription()
      await refresh()
      const sub = await apiGet<Subscription>("/subscriptions/me/active").catch(() => null)
      setActiveSub(sub)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume subscription")
    } finally {
      setCancelLoading(false)
    }
  }

  const cancelAtPeriodEnd = activeSub?.cancel_at_period_end ?? false
  const periodEndDate = formatDate(activeSub?.current_period_end)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and view your invoices.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard/subscription">
            View plans
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Cancellation notice banner */}
      {cancelAtPeriodEnd && periodEndDate && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Your plan is scheduled to cancel on <strong>{periodEndDate}</strong>. You&apos;ll
            keep full access until then, after which it reverts to the Free plan.
          </span>
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-muted-foreground">
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                {tierIcons[currentTier]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold capitalize">{currentTier} Plan</h2>
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : (
                    <Badge variant={isActive ? "success" : "outline"} className="capitalize">
                      {isActive ? "Active" : status || "Inactive"}
                    </Badge>
                  )}
                  {cancelAtPeriodEnd && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                      Cancels {periodEndDate}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentTier === "free"
                    ? "You're on the free plan. Upgrade to unlock more courses."
                    : cancelAtPeriodEnd
                    ? `Access continues until ${periodEndDate}, then reverts to Free.`
                    : `Your ${currentTier} subscription renews automatically each month.`}
                </p>
              </div>
            </div>

            {currentTier !== "free" && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {cancelAtPeriodEnd ? (
                  /* Resume button */
                  <Button
                    variant="outline"
                    onClick={handleResume}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Resume Plan
                  </Button>
                ) : (
                  /* Cancel button — requires confirmation */
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="soft-destructive" disabled={cancelLoading}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Plan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel your plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your <span className="font-semibold capitalize">{currentTier}</span> plan
                          will remain active until{" "}
                          <span className="font-semibold">{periodEndDate ?? "the end of your billing period"}</span>.
                          After that, your account will revert to the Free plan automatically.
                          You can resume at any time before then.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Yes, cancel plan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Manage Billing
                  <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-muted-foreground">
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading invoices…
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No invoices yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.created
                        ? new Date(inv.created).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>{formatTotal(inv)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(inv.status)} className="capitalize">
                        {inv.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.hosted_invoice_url ? (
                        <Button asChild variant="ghost" size="sm">
                          <a
                            href={inv.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
