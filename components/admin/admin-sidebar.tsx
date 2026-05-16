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
import { LayoutDashboard, LogOut, Users, BookOpen, DollarSign, Menu, Settings, ChevronLeft, ChevronRight, Tag } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface AdminSidebarProps {
  profile: UserProfile | null
}

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
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

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-background border-r relative transition-all duration-300">
      {/* Desktop Toggle Button */}
      <div className="hidden lg:flex absolute -right-3 top-6 z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full shadow-sm bg-background"
          onClick={() => setIsCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Logo Area */}
      <div className={`p-6 flex items-center ${collapsed ? 'justify-center p-4' : ''}`}>
        <Link
          href="/admin"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => setOpen(false)}
        >
          <div className="relative shrink-0">
            <Image
              src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
              alt="Aicser Logo"
              width={collapsed ? 32 : 36}
              height={collapsed ? 32 : 36}
              className="rounded-lg group-hover:scale-105 transition-all duration-300 shadow-sm"
              priority
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-serif font-bold text-lg leading-tight gradient-text group-hover:opacity-90">
                Aicser
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-red-500">Admin</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-4 space-y-2 mt-4 ${collapsed ? 'px-2' : ''}`}>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (pathname.startsWith(href) && href !== "/admin")
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center rounded-lg transition-colors text-sm font-medium ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom User Area */}
      <div className={`p-4 border-t mt-auto ${collapsed ? 'p-2 flex justify-center' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`justify-start hover:bg-muted ${
                collapsed ? 'h-10 w-10 p-0 rounded-full' : 'w-full gap-3 h-auto py-2.5 px-3'
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              {!collapsed && (
                <div className="flex flex-col items-start truncate overflow-hidden">
                  <span className="text-sm font-medium truncate w-full">{profile?.full_name || "Admin"}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{profile?.email}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? "start" : "end"} side={collapsed ? "right" : "bottom"} className="w-56" sideOffset={8}>
            <DropdownMenuLabel>Admin Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/explore" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Student View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent collapsed={isCollapsed} />
      </div>

      {/* Mobile Topbar & Sheet */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-background border-b h-16">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-serif font-bold text-lg">Aicser Admin</span>
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
