import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: "no session" })

  const token = session.access_token
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const user = res.ok ? await res.json() : { error: res.status }

  return NextResponse.json({
    session_email: session.user.email,
    session_user_id: session.user.id,
    token_prefix: token.slice(0, 20),
    users_me_status: res.status,
    users_me_role: user.role,
    user,
  })
}
