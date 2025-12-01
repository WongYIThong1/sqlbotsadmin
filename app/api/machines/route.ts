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

export async function GET(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    // Build query with user information via join
    let query = `${SUPABASE_URL}/rest/v1/machines?select=id,user_id,apikey,ram,core,ip,status,last_heartbeat,created_at,updated_at,name,users(username)&order=created_at.desc`

    // Add filters
    if (status && status !== "All") {
      query += `&status=eq.${encodeURIComponent(status)}`
    }

    if (search) {
      // Search by name or IP - PostgREST or syntax with % wildcard
      const searchEncoded = encodeURIComponent(`%${search}%`)
      query += `&or=(name.ilike.${searchEncoded},ip.ilike.${searchEncoded})`
    }

    if (limit) {
      query += `&limit=${parseInt(limit)}`
    } else {
      query += `&limit=100`
    }

    if (offset) {
      query += `&offset=${parseInt(offset)}`
    }

    const response = await fetch(query, {
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
      console.error("Failed to fetch machines:", response.status, errorText)
      return NextResponse.json({ message: "Failed to fetch machines" }, { status: 500 })
    }

    const machines = await response.json()

    // Get total count
    let countQuery = `${SUPABASE_URL}/rest/v1/machines?select=id&head=true`
    if (status && status !== "All") {
      countQuery += `&status=eq.${encodeURIComponent(status)}`
    }
    if (search) {
      const searchEncoded = encodeURIComponent(`%${search}%`)
      countQuery += `&or=(name.ilike.${searchEncoded},ip.ilike.${searchEncoded})`
    }

    const countResponse = await fetch(countQuery, {
      method: "HEAD",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    const totalCount = countResponse.headers.get("content-range")?.split("/")[1] || machines.length.toString()

    return NextResponse.json(
      {
        machines,
        count: machines.length,
        total: parseInt(totalCount),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get machines error:", error)
    return NextResponse.json({ message: "Failed to fetch machines" }, { status: 500 })
  }
}
