export interface SubscriptionProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  tier: "free" | "pro" | "premium"
  features: string[]
  stripePriceId?: string
}

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: "free-tier",
    name: "Free Plan",
    description: "Perfect for getting started with AI learning",
    priceInCents: 0,
    tier: "free",
    features: ["Access to beginner courses", "Basic AI concepts", "Community support", "Limited course access"],
  },
  {
    id: "pro-tier",
    name: "Pro Plan",
    description: "For serious learners who want more",
    priceInCents: 1999, // $19.99/month
    tier: "pro",
    features: [
      "All Free features",
      "Access to intermediate courses",
      "Advanced AI techniques",
      "Priority email support",
      "Downloadable resources",
      "Progress tracking",
    ],
  },
  {
    id: "premium-tier",
    name: "Premium Plan",
    description: "Ultimate learning experience with everything unlocked",
    priceInCents: 4999, // $49.99/month
    tier: "premium",
    features: [
      "All Pro features",
      "Access to all premium courses",
      "Expert-level content",
      "1-on-1 mentorship sessions",
      "Certificate of completion",
      "Lifetime access to materials",
      "Exclusive AI projects",
    ],
  },
]
