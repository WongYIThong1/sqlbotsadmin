"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminUser {
  id: string
  username: string
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.admin) {
          setIsAuthenticated(true)
          setAdmin(data.admin)
        } else {
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setChecking(false)
    }
  }

  // Initial auth check
  useEffect(() => {
    checkAuth()
  }, [])

  // Periodic session check (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      checkAuth()
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!checking && !isAuthenticated) {
      router.push("/login")
    }
  }, [checking, isAuthenticated, router])

  // Show loading state while checking
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting (or show children if authenticated)
  if (!isAuthenticated) {
    return null
  }

  // Render children if authenticated
  return <>{children}</>
}

// Export admin context for child components to access admin info
export { type AdminUser }

