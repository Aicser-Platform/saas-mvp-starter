export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "user" | "admin"
  subscription_tier: "free" | "pro" | "premium"
  subscription_status: "active" | "inactive" | "canceled" | "past_due"
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_start_date: string | null
  subscription_end_date: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  content: string | null
  difficulty: "beginner" | "intermediate" | "advanced"
  required_tier: "free" | "pro" | "premium"
  thumbnail_url: string | null
  video_url: string
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
}

export interface Payment {
  id: string
  user_id: string
  stripe_payment_intent_id: string | null
  amount: number
  currency: string
  status: string
  subscription_tier: string
  created_at: string
}
