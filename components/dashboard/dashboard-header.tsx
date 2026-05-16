"use client"

import type { User as UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { LogOut, Settings, User, CreditCard, Search, X } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { useState, useRef } from "react"

interface DashboardHeaderProps {
  profile: UserProfile | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "")
  const searchRef = useRef<HTMLInputElement>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const val = searchValue.trim()
    if (val) {
      router.push(`/explore?q=${encodeURIComponent(val)}`)
    } else {
      router.push("/explore")
    }
    setSearchOpen(false)
  }

  const clearSearch = () => {
    setSearchValue("")
    searchRef.current?.focus()
    router.replace("/explore")
  }

  const openMobileSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const leftNavLinks = [
    { href: "/explore", label: "Explore" },
  ]

  const rightNavLinks = [
    { href: "/dashboard/courses", label: "My Learning" },
    { href: "/dashboard/subscription", label: "Subscription" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-4">
        {/* Logo */}
        <Link
          href="/explore"
          className="flex items-center gap-2.5 sm:gap-3 group relative focus:outline-none rounded-lg shrink-0"
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
            <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10" />
          </div>
          <span className="hidden sm:block text-xl font-serif font-bold gradient-text group-hover:opacity-90 transition-opacity">
            Aicser EdTech SaaS
          </span>
        </Link>

        {/* Desktop Nav — LEFT of search bar */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {leftNavLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Search — CENTER/RIGHT of nav links */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-sm mx-4 relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search courses…"
            className="pl-9 pr-8 h-9 text-sm rounded-full bg-muted/60 border-transparent focus-visible:border-primary/40 focus-visible:bg-background"
          />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </form>

        {/* Desktop Nav — RIGHT of search bar */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {rightNavLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={openMobileSearch}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Subscription badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold capitalize">
            <span>{profile?.subscription_tier || "Free"}</span>
          </div>

          {/* User dropdown — original style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all"
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
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
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 text-xs sm:text-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar (expanded) */}
      {searchOpen && (
        <div className="md:hidden border-t px-4 py-3 bg-background">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search courses…"
              className="pl-9 pr-20 h-10 text-sm rounded-xl"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              {searchValue && (
                <button type="button" onClick={clearSearch} className="p-1">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs text-muted-foreground px-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  )
}
