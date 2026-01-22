import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Aicser EdTech SaaS - Master AI & Machine Learning",
  description:
    "Learn artificial intelligence and machine learning at your own pace with expert-led courses. Join thousands of students mastering AI with Aicser AI Studio.",
  generator: "v0.app",
  keywords: ["AI learning", "machine learning", "artificial intelligence", "online courses", "AI education"],
  authors: [{ name: "Aicser EdTech SaaS" }],
  icons: {
    icon: [
      {
        url: "https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
