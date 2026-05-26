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
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, CreditCard, Search, X, Bell, Crown, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DashboardHeaderProps {
  profile: UserProfile | null
}

const tierConfig: Record<string, { variant: "free" | "pro" | "premium"; icon: React.ReactNode; label: string }> = {
  free:    { variant: "free",    icon: null,                          label: "Free"    },
  pro:     { variant: "pro",     icon: <Zap className="h-3 w-3" />,   label: "Pro"     },
  premium: { variant: "premium", icon: <Crown className="h-3 w-3" />, label: "Premium" },
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync search value when URL changes (e.g. navigating between pages)
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "")
  }, [searchParams])

  // Debounced live search — updates URL 300ms after the user stops typing
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const q = value.trim()
      if (pathname === "/explore") {
        router.replace(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore", { scroll: false })
      }
    }, 300)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = searchValue.trim()
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore")
    setMobileSearchOpen(false)
  }

  const clearSearch = () => {
    setSearchValue("")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.replace("/explore", { scroll: false })
    searchRef.current?.focus()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/explore",                label: "Explore"      },
    { href: "/dashboard/courses",      label: "My Learning"  },
    { href: "/dashboard/subscription", label: "Subscription" },
  ]

  const tier = profile?.subscription_tier || "free"
  const tierInfo = tierConfig[tier] ?? tierConfig.free

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex h-[64px] items-center gap-3">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/explore" className="flex items-center gap-2.5 group focus:outline-none rounded-xl" aria-label="Aicser Home">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150" />
                <Image
                  src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
                  alt="Aicser Logo"
                  width={34}
                  height={34}
                  className="rounded-xl relative z-10 group-hover:scale-105 transition-transform duration-300 shadow-sm"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-base font-bold tracking-tight gradient-text leading-none">Aicser</span>
                <span className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider leading-none mt-0.5">EdTech</span>
              </div>
            </Link>
          </div>

          {/* Center Nav + Search */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1">
            <nav className="flex items-center gap-0.5">
              {navLinks.slice(0, 1).map(({ href, label }) => {
                const isActive = pathname === href || pathname.startsWith(href)
                return (
                  <Link key={href} href={href}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  >
                    {isActive && (
                      <motion.span layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                )
              })}
            </nav>

            <form onSubmit={handleSearchSubmit} className="relative mx-3 flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
              <Input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search courses…"
                className="pl-9 pr-8 h-9 rounded-full bg-muted/40 border-primary/20 focus:border-primary/50 focus:bg-background"
              />
              <AnimatePresence>
                {searchValue && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>

            <nav className="flex items-center gap-0.5">
              {navLinks.slice(1).map(({ href, label }) => {
                const isActive = pathname === href || pathname.startsWith(href)
                return (
                  <Link key={href} href={href}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  >
                    {isActive && (
                      <motion.span layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            <button onClick={() => { setMobileSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80) }}
              className="md:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors" aria-label="Search">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>

            <Badge variant={tierInfo.variant} className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 font-semibold">
              {tierInfo.icon}
              {tierInfo.label}
            </Badge>

            <button className="hidden sm:flex p-2 rounded-lg hover:bg-muted/60 transition-colors relative" aria-label="Notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
            </button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/30 focus:ring-primary/40 transition-all duration-200 overflow-hidden bg-muted/60 outline-none">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.full_name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{userInitials}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/60">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20 overflow-hidden">
                      {profile?.avatar_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={profile.avatar_url} alt="" className="h-9 w-9 object-cover" />
                        : <span className="text-xs font-bold text-primary">{userInitials}</span>
                      }
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-semibold truncate">{profile?.full_name || "Student"}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/subscription" className="cursor-pointer gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm">Subscription</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2.5 text-destructive focus:text-destructive focus:bg-destructive/5">
                  <div className="h-7 w-7 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-sm">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-b border-border/50 bg-background/95 backdrop-blur-sm"
          >
            <div className="px-4 py-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search courses…"
                  className="pl-9 pr-20 h-10 rounded-xl"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchValue && (
                    <button type="button" onClick={clearSearch} className="p-1 rounded-md hover:bg-muted">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <button type="button" onClick={() => setMobileSearchOpen(false)}
                    className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md hover:bg-muted">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
