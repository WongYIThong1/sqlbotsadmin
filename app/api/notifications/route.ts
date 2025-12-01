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
    const { message, userId } = await request.json() as { message?: string; userId?: string | null }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Notification message is required." }, { status: 400 })
    }

    const trimmedMessage = message.trim()
    if (trimmedMessage.length > 500) {
      return NextResponse.json({ message: "Notification message is too long (max 500 characters)." }, { status: 400 })
    }

    let targets: string[] = []

    if (userId) {
      targets = [userId]
    } else {
      const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id`, {
        method: "GET",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      })

      if (!usersResponse.ok) {
        const errorText = await usersResponse.text()
        console.error("Failed to fetch users for notification:", usersResponse.status, errorText)
        return NextResponse.json({ message: "Failed to fetch users." }, { status: 500 })
      }

      const users = await usersResponse.json()
      targets = Array.isArray(users) ? users.map((user: { id: string }) => user.id) : []

      if (targets.length === 0) {
        return NextResponse.json({ message: "No users available to receive notifications." }, { status: 400 })
      }
    }

    const payload: NotificationPayload[] = targets.map((targetId) => ({
      user_id: targetId,
      title: "Notification",
      message: trimmedMessage,
      type: "info",
      read: false,
    }))

    const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload.length === 1 ? payload[0] : payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to create notifications:", response.status, errorText)
      return NextResponse.json({ message: "Failed to create notifications." }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Notification sent successfully",
        count: payload.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Notification creation error:", error)
    return NextResponse.json({ message: "Failed to send notification." }, { status: 500 })
  }
}

