import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"
import { getProfileData } from "@/lib/supabase/admin"
import type { Payment, User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  if (profile?.role !== "admin") redirect("/dashboard")

  // Fetch payments from FastAPI
  const res = await fetch(`${API_BASE}/payments/`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  })
  const payments: Payment[] = res.ok ? await res.json() : []

  // Fetch users to join names/emails client-side
  const usersRes = await fetch(`${API_BASE}/users/admin/all`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  })
  const users: User[] = usersRes.ok ? await usersRes.json() : []
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground mt-2">View all payment transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              All Payments ({payments.length})
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
                  {payments.map((payment) => {
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
                          ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
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
                  })}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No payments recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
