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

async function fetchMachineById(id: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/machines?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase fetch failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data[0] : null
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const { id } = await params
    // First check if machine exists
    const machine = await fetchMachineById(id)
    if (!machine) {
      return NextResponse.json({ message: "Machine not found" }, { status: 404 })
    }

    // Delete the machine
    const response = await fetch(`${SUPABASE_URL}/rest/v1/machines?id=eq.${encodeURIComponent(id)}`, {
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
      console.error("Delete machine error:", response.status, errorText)
      return NextResponse.json({ message: "Failed to delete machine" }, { status: 500 })
    }

    return NextResponse.json({ message: "Machine deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete machine error:", error)
    return NextResponse.json({ message: "Failed to delete machine" }, { status: 500 })
  }
}
