"use client"

import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Brain, LogOut, Settings, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface DashboardHeaderProps {
  profile: Profile | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="font-bold text-base sm:text-lg hidden sm:inline">Aicser</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/courses" className="text-sm font-medium hover:text-primary transition-colors">
            My Courses
          </Link>
          <Link href="/dashboard/subscription" className="text-sm font-medium hover:text-primary transition-colors">
            Subscription
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs sm:text-sm font-medium">
            <span className="capitalize">{profile?.subscription_tier || "Free"} Plan</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs sm:text-sm font-medium">{profile?.full_name || "Student"}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer text-xs sm:text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscription" className="cursor-pointer text-xs sm:text-sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscription
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 text-xs sm:text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
