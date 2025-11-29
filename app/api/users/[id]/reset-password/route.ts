import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { hashPassword } from "@/lib/user"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function missingConfigResponse() {
  return NextResponse.json(
    { message: "Server configuration error. Please contact the administrator." },
    { status: 500 },
  )
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user exists
    const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}&select=id`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ message: "Failed to verify user" }, { status: 500 })
    }

    const userData = await userResponse.json()
    if (!Array.isArray(userData) || userData.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update password
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        password_hash: passwordHash,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Reset password error:", response.status, errorText)
      return NextResponse.json({ message: "Failed to reset password" }, { status: 500 })
    }

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Failed to reset password" }, { status: 500 })
  }
}

