import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileData } from "@/lib/supabase/admin"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BillingContent } from "@/components/billing/billing-content"

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const profile = await getProfileData(session.user.id)

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8">
        <BillingContent profile={profile} />
      </main>
    </div>
  )
}
