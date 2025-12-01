import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function missingConfigResponse() {
  return NextResponse.json(
    { message: "Server configuration error. Please contact the administrator." },
    { status: 500 },
  )
}

interface UserExpiryRow {
  id: string
  expires_at: string | null
}

interface NotificationPayload {
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
}

export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const body = await request.json() as { days?: number; userId?: string | null }
    const { days, userId } = body

    if (days === undefined || days === null || typeof days !== "number" || !Number.isInteger(days)) {
      return NextResponse.json({ message: "'days' must be an integer." }, { status: 400 })
    }

    if (days < 1 || days > 365) {
      return NextResponse.json({ message: "'days' must be between 1 and 365." }, { status: 400 })
    }

    let users: UserExpiryRow[] = []

    if (userId) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,expires_at&limit=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          cache: "no-store",
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to fetch user for extend-expiry:", response.status, errorText)
        return NextResponse.json({ message: "Failed to fetch user." }, { status: 500 })
      }

      const data = await response.json()
      users = Array.isArray(data) ? data : []

      if (users.length === 0) {
        return NextResponse.json({ message: "User not found." }, { status: 404 })
      }
    } else {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?select=id,expires_at`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          cache: "no-store",
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to fetch users for extend-expiry:", response.status, errorText)
        return NextResponse.json({ message: "Failed to fetch users." }, { status: 500 })
      }

      const data = await response.json()
      users = Array.isArray(data) ? data : []

      if (users.length === 0) {
        return NextResponse.json({ message: "No users available to extend." }, { status: 400 })
      }
    }

    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000

    let updatedCount = 0
    const notifications: NotificationPayload[] = []

    for (const user of users) {
      const current = user.expires_at ? new Date(user.expires_at) : null
      const base = current && current > now ? current : now
      const newExpires = new Date(base.getTime() + days * msPerDay)

      const patchResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ expires_at: newExpires.toISOString() }),
        },
      )

      if (!patchResponse.ok) {
        const errorText = await patchResponse.text()
        console.error("Failed to update user expiry:", patchResponse.status, errorText)
        return NextResponse.json({ message: "Failed to extend expiry for users." }, { status: 500 })
      }

      updatedCount += 1

      notifications.push({
        user_id: user.id,
        title: "Expiry Extended",
        message: `Your expiry has been extended by ${days} day(s). New expiry: ${newExpires.toISOString()}`,
        type: "info",
        read: false,
      })
    }

    let notificationsCreated = 0

    if (notifications.length > 0) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(notifications),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Failed to create extend notifications:", response.status, errorText)
        } else {
          notificationsCreated = notifications.length
        }
      } catch (error) {
        console.error("Extend notifications error:", error)
      }
    }

    const baseMessage = "Expiry extended successfully"
    const message =
      notificationsCreated === notifications.length
        ? baseMessage
        : `${baseMessage}, but failed to create some notifications.`

    return NextResponse.json(
      {
        message,
        updated: updatedCount,
        days,
        notificationsCreated,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Extend expiry error:", error)
    return NextResponse.json({ message: "Failed to extend expiry." }, { status: 500 })
  }
}

