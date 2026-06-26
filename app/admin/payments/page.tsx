import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentManagementClient } from "@/components/admin/payment-management-client"
import { getProfileData } from "@/lib/supabase/admin"
import type { Payment, User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ""
  const profile = await getProfileData(user.id)

  // Fetch payments from FastAPI
  const res = await fetch(`${API_BASE}/payments/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const payments: Payment[] = res.ok ? await res.json() : []

  // Fetch users to join names/emails client-side
  const usersRes = await fetch(`${API_BASE}/users/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const users: User[] = usersRes.ok ? await usersRes.json() : []
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground mt-2">View all payment transactions</p>
        </div>

        <PaymentManagementClient payments={payments} userMap={userMap} />
      </main>
    </div>
  )
}
