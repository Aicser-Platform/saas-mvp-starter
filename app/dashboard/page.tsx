import { redirect } from "next/navigation"

// /dashboard now redirects to /explore
export default function DashboardPage() {
  redirect("/explore")
}
