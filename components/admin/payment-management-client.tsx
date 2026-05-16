"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Payment, User } from "@/lib/types"

interface PaymentManagementClientProps {
  payments: Payment[]
  userMap: Record<string, User>
}

export function PaymentManagementClient({ payments, userMap }: PaymentManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredPayments = (payments || []).filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const user = userMap[p.user_id]
    return (
      (user?.full_name?.toLowerCase().includes(q) ?? false) ||
      (user?.email?.toLowerCase().includes(q) ?? false) ||
      (p.provider?.toLowerCase().includes(q) ?? false) ||
      (p.status?.toLowerCase().includes(q) ?? false)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage))
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">All Payments ({payments?.length || 0})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Provider</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No payments found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => {
                  const user = userMap[payment.user_id]
                  return (
                    <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{user?.full_name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {payment.currency?.toLowerCase() === "khr"
                          ? `${payment.amount.toLocaleString("km-KH")} ៛`
                          : `$${(payment.amount / 100).toFixed(2)} ${payment.currency?.toUpperCase() ?? "USD"}`}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {payment.provider}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={payment.status === "succeeded" ? "default" : "destructive"}
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
