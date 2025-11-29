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

async function fetchLicenseById(id: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/licenses?id=eq.${encodeURIComponent(id)}&limit=1`, {
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
    const license = await fetchLicenseById(id)

    if (!license) {
      return NextResponse.json({ message: "License not found" }, { status: 404 })
    }

    return NextResponse.json({ license }, { status: 200 })
  } catch (error) {
    console.error("Get license by id error:", error)
    return NextResponse.json({ message: "Failed to fetch license" }, { status: 500 })
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
    const { status, day } = body as { status?: string; day?: number }

    if (status === undefined && day === undefined) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {}
    if (status !== undefined) {
      const allowed = ["Active", "Inactive", "Expired"]
      if (!allowed.includes(status)) {
        return NextResponse.json({ message: "Invalid status value" }, { status: 400 })
      }
      updatePayload.status = status
    }

    if (day !== undefined) {
      const parsedDay = Number(day)
      if (!Number.isFinite(parsedDay) || parsedDay < 1) {
        return NextResponse.json({ message: "Day must be a positive number" }, { status: 400 })
      }
      updatePayload.day = parsedDay
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/licenses?id=eq.${encodeURIComponent(id)}`, {
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
      console.error("Update license error:", response.status, errorText)
      return NextResponse.json({ message: "Failed to update license" }, { status: 500 })
    }

    const updated = await response.json()
    const updatedLicense = Array.isArray(updated) ? updated[0] : updated

    return NextResponse.json({ message: "License updated", license: updatedLicense }, { status: 200 })
  } catch (error) {
    console.error("Patch license error:", error)
    return NextResponse.json({ message: "Failed to update license" }, { status: 500 })
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
    // First check if license exists
    const license = await fetchLicenseById(id)
    if (!license) {
      return NextResponse.json({ message: "License not found" }, { status: 404 })
    }

    // Delete the license
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licenses?id=eq.${encodeURIComponent(id)}`, {
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
      console.error("Delete license error:", response.status, errorText)
      return NextResponse.json({ message: "Failed to delete license" }, { status: 500 })
    }

    return NextResponse.json({ message: "License deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete license error:", error)
    return NextResponse.json({ message: "Failed to delete license" }, { status: 500 })
  }
}
