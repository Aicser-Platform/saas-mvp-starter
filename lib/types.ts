// ─── Shared types that match FastAPI response schemas ───────────────────────

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "user" | "admin"
  // Populated by backend _enrich_user() joins — not stored directly on the users table
  subscription_tier: "free" | "pro" | "premium"
  subscription_status: "active" | "inactive" | "canceled" | "past_due"
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  content: string | null
  difficulty: "beginner" | "intermediate" | "advanced"
  required_tier: string
  thumbnail_url: string | null
  video_url: string | null
  resources: Array<{ title: string; url: string; type: string }> | null
  created_at: string
  updated_at: string
}

export interface Progress {
  id: string
  user_id: string
  course_id: string
  completed: boolean
  progress_percentage: number
  last_accessed: string
  created_at: string
  updated_at: string
  courses?: Course
}

export interface Payment {
  id: string
  user_id: string
  subscription_id: string | null
  provider: string
  provider_payment_id: string
  amount: number
  currency: string
  status: string
  payment_method: string | null
  paid_at: string | null
  created_at: string
  user?: Pick<User, "id" | "email" | "full_name">
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content: string | null
  video_url: string | null
  pdf_url: string | null
  order_index: number | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  plan_name: string | null  // e.g. "free" | "pro" | "premium"
  status: string            // active, canceled, past_due, trialing
  provider_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface BillingAccount {
  id: string
  user_id: string
  provider: string          // "stripe"
  customer_id: string       // e.g. cus_xxx
  created_at: string
}

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  max_requests: number | null
  max_tokens: number | null
  max_storage_bytes: number | null
  created_at: string
}
