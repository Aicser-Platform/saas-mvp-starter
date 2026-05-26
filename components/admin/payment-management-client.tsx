"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Search, ChevronLeft, ChevronRight, Receipt } from "lucide-react"
import type { Payment, User } from "@/lib/types"

interface PaymentManagementClientProps {
  payments: Payment[]
  userMap: Record<string, User>
}

function UserAvatar({ name, avatarUrl }: { name?: string; avatarUrl?: string }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"
  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center overflow-hidden shrink-0">
      {avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        : <span className="text-xs font-bold text-primary">{initials}</span>
      }
    </div>
  )
}

function formatAmount(payment: Payment) {
  if (payment.currency?.toLowerCase() === "khr") {
    return { amount: `${payment.amount.toLocaleString("km-KH")} ៛`, currency: "KHR" }
  }
  return { amount: `$${(payment.amount / 100).toFixed(2)}`, currency: payment.currency?.toUpperCase() ?? "USD" }
}

export function PaymentManagementClient({ payments, userMap }: PaymentManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredPayments = (payments || []).filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const user = userMap[p.user_id]
    return (user?.full_name?.toLowerCase().includes(q) ?? false) || (user?.email?.toLowerCase().includes(q) ?? false) || (p.provider?.toLowerCase().includes(q) ?? false) || (p.status?.toLowerCase().includes(q) ?? false)
  })

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage))
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">All Payments</h2>
            <p className="text-xs text-muted-foreground">{payments?.length || 0} transactions</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
          <Input type="text" placeholder="Search payments..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="pl-9 h-9 w-60 rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/40">
              <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Provider</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No payments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPayments.map((payment) => {
                const user = userMap[payment.user_id]
                const { amount, currency } = formatAmount(payment)
                const succeeded = payment.status === "succeeded"
                return (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user?.full_name ?? undefined} />
                        <div>
                          <p className="font-semibold text-foreground">{user?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className={`font-bold text-sm ${succeeded ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                          {succeeded ? "+" : ""}{amount}
                        </p>
                        <p className="text-xs text-muted-foreground">{currency}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="capitalize text-xs">{payment.provider}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${succeeded ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <Badge variant={succeeded ? "success" : "destructive"} className="capitalize text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/40 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium px-2">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
