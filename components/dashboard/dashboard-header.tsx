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
import Image from "next/image"

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
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between relative">
        {/* Logo */}
        <Link 
            href="/dashboard" 
            className="flex items-center gap-2.5 sm:gap-3 group relative focus:outline-none rounded-lg"
            aria-label="Aicser Home"
          >
            <div className="relative">
              <Image
                src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
                alt="Aicser Logo"
                width={32}
                height={32}
                className="rounded-lg group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                priority
              />
              <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
            </div>
            <span className="text-xl sm:text-2xl font-serif font-bold gradient-text group-hover:opacity-90 transition-opacity">Aicser EdTech SaaS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
