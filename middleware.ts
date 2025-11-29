import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "@/lib/auth"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/user",
  "/license",
  "/version",
  "/logs",
  "/security-logs",
  "/team-manage",
]

// Routes that should not be accessible when authenticated (redirect to dashboard)
const publicRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the current path is a public route (like login)
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Allow API auth routes and static files
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon")
  ) {
    return NextResponse.next()
  }

  // Check authentication
  const authResult = await verifyAuth(request)

  // Handle protected routes
  if (isProtectedRoute) {
    if (!authResult.valid) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Allow access to protected routes if authenticated
    return NextResponse.next()
  }

  // Handle public routes (like login page)
  if (isPublicRoute) {
    if (authResult.valid) {
      // Redirect to dashboard if already authenticated
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Allow access to login page if not authenticated
    return NextResponse.next()
  }

  // Default: allow access to other routes
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

