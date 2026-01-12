import { createClient as createServerClient } from "./server"

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (error) {
      console.error("[v0] Error checking admin status:", error)
      return false
    }

    return data?.role === "admin"
  } catch (error) {
    console.error("[v0] Exception checking admin status:", error)
    return false
  }
}

// Helper to get profile data safely
export async function getProfileData(userId: string) {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("[v0] Error fetching profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Exception fetching profile:", error)
    return null
  }
}
