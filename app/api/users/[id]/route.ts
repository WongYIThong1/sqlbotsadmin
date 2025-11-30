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

async function fetchUserById(id: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}&select=id,username,plan,status,machine_name_1,machine_name_2,machine_name_3,discord_id,apikey,expires_at,created_at,updated_at&limit=1`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase fetch failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data[0] : null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const { id } = await params
    const user = await fetchUserById(id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    console.error("Get user by id error:", error)
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { plan, status, machine_name_1, machine_name_2, machine_name_3, discord_id } = body

    if (plan === undefined && status === undefined && machine_name_1 === undefined && machine_name_2 === undefined && machine_name_3 === undefined && discord_id === undefined) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {}

    if (plan !== undefined) {
      const parsedPlan = Number(plan)
      if (!Number.isFinite(parsedPlan) || parsedPlan < 1) {
        return NextResponse.json({ message: "Plan must be a positive number" }, { status: 400 })
      }
      updatePayload.plan = parsedPlan
    }

    if (status !== undefined) {
      const allowed = ["Active", "Suspended"]
      if (!allowed.includes(status)) {
        return NextResponse.json({ message: "Invalid status value" }, { status: 400 })
      }
      updatePayload.status = status
    }

    // Update machine names
    if (machine_name_1 !== undefined) {
      updatePayload.machine_name_1 = machine_name_1 || null
    }

    if (machine_name_2 !== undefined) {
      updatePayload.machine_name_2 = machine_name_2 || null
    }

    if (machine_name_3 !== undefined) {
      updatePayload.machine_name_3 = machine_name_3 || null
    }

    if (discord_id !== undefined) {
      updatePayload.discord_id = discord_id || null
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updatePayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Update user error:", response.status, errorText)
      return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
    }

    const updated = await response.json()
    const updatedUser = Array.isArray(updated) ? updated[0] : updated

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = updatedUser

    return NextResponse.json({ message: "User updated", user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    console.error("Patch user error:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const { id } = await params
    const user = await fetchUserById(id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check how many licenses are associated with this user (will be deleted via CASCADE)
    const licensesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/licenses?user_id=eq.${encodeURIComponent(id)}&select=id`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    let licenseCount = 0
    if (licensesResponse.ok) {
      const licenses = await licensesResponse.json()
      licenseCount = Array.isArray(licenses) ? licenses.length : 0
    }

    // Delete the user (associated licenses will be automatically deleted via CASCADE)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Delete user error:", response.status, errorText)
      return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "User deleted successfully",
        deleted_licenses: licenseCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
  }
}

