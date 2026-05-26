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
import { LayoutDashboard, LogOut, Users, BookOpen, DollarSign, Menu, ChevronLeft, ChevronRight, Tag, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"

interface AdminSidebarProps {
  profile: UserProfile | null
}

const navLinks = [
  { href: "/admin",             label: "Dashboard",  icon: BarChart3     },
  { href: "/admin/users",       label: "Users",      icon: Users         },
  { href: "/admin/courses",     label: "Courses",    icon: BookOpen      },
  { href: "/admin/categories",  label: "Categories", icon: Tag           },
  { href: "/admin/payments",    label: "Payments",   icon: DollarSign    },
]

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "A"

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-card border-r border-border/50 relative">
      {/* Logo + collapse toggle */}
      <div className="px-3 py-4 flex items-center">
        <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 group focus:outline-none flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-125" />
            <Image
              src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
              alt="Aicser"
              width={34}
              height={34}
              className="rounded-xl relative z-10 group-hover:scale-105 transition-transform duration-200 shadow-sm"
              priority
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight gradient-text leading-none">Aicser</span>
              <span className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider leading-none mt-0.5">EdTech</span>
            </div>
          )}
        </Link>
        {/* Desktop-only collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!collapsed)}
          className="hidden lg:flex shrink-0 h-7 w-7 rounded-md items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      {/* Navigation */}
      {!collapsed && (
        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-4 mb-1">Menu</p>
      )}
      <nav className={`flex-1 p-3 space-y-1`}>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (pathname.startsWith(href) && href !== "/admin")
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              title={collapsed ? label : undefined}
              className={`relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
              )}
              <Icon className={`h-4.5 w-4.5 shrink-0 relative z-10 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="relative z-10">{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="mx-3 h-px bg-border/50" />

      {/* User area */}
      <div className={`p-3 ${collapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2"}`}>
        <div className={collapsed ? "" : "flex-1 min-w-0"}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center rounded-lg hover:bg-muted/60 transition-colors outline-none ${
                collapsed ? "p-2" : "w-full gap-3 p-2.5"
              }`}>
                <div className="h-8 w-8 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={profile.avatar_url} alt="" className="h-8 w-8 object-cover" />
                    : <span className="text-xs font-bold text-primary">{userInitials}</span>
                  }
                </div>
                {!collapsed && (
                  <div className="flex flex-col items-start truncate overflow-hidden min-w-0">
                    <span className="text-sm font-semibold truncate w-full">{profile?.full_name || "Admin"}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{profile?.email}</span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={collapsed ? "start" : "end"} side={collapsed ? "right" : "bottom"} className="w-56 rounded-xl shadow-lg" sideOffset={8}>
              <DropdownMenuLabel>Admin Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/explore" className="cursor-pointer gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Student View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:block shrink-0 h-screen sticky top-0 overflow-hidden"
      >
        <SidebarContent collapsed={isCollapsed} />
      </motion.div>

      {/* Mobile topbar + Sheet */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-card border-b border-border/50 h-16">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
            alt="Logo"
            width={30}
            height={30}
            className="rounded-lg shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm gradient-text leading-none">Aicser</span>
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">EdTech</span>
          </div>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
