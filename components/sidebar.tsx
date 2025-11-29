"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Users,
  KeyRound,
  GitBranch,
  FileText,
  ShieldAlert,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User", href: "/user", icon: Users },
  { name: "License", href: "/license", icon: KeyRound },
  { name: "Version", href: "/version", icon: GitBranch },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Security Logs", href: "/security-logs", icon: ShieldAlert },
  { name: "Team Manage", href: "/team-manage", icon: UsersRound },
]

interface AdminUser {
  id: string
  username: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch admin info on mount
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.admin) {
            setAdmin(data.admin)
          }
        }
      } catch (error) {
        console.error("Failed to fetch admin info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdmin()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        router.push("/login")
        router.refresh()
      } else {
        toast.error("Logout failed. Please try again.")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("An error occurred during logout")
    }
  }

  // Get initial from username
  const getInitial = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && <span className="text-lg font-semibold text-sidebar-foreground">Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search..."
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                collapsed && "justify-center",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground text-sm font-medium">
            {admin ? getInitial(admin.username) : "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {admin?.username || (loading ? "Loading..." : "Admin User")}
              </p>
              <p className="text-xs text-muted-foreground truncate">Administrator</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
        {collapsed && (
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center text-muted-foreground hover:text-foreground"
            size="sm"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  )
}
