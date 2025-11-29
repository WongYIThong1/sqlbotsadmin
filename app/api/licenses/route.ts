import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

// Supabase configuration (server-only)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.valid) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")
    const orderBy = searchParams.get("orderBy") || "created_at"
    const order = searchParams.get("order") || "desc"

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { message: "Server configuration error. Please contact the administrator." },
        { status: 500 }
      )
    }

    // Use RPC function to get licenses
    const limitNum = limit ? parseInt(limit) : 100
    const offsetNum = offset ? parseInt(offset) : 0

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_licenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        p_status: status || null,
        p_limit: limitNum,
        p_offset: offsetNum,
        p_order_by: orderBy,
        p_order_direction: order,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to fetch licenses:", response.status, errorText)
      return NextResponse.json(
        { message: "Failed to fetch licenses. Please try again." },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    // Handle both array and single object responses
    const licensesArray = Array.isArray(result) ? result : [result]
    
    const licenses = licensesArray.map((item: any) => ({
      id: item.id,
      license_key: item.license_key,
      status: item.status,
      day: item.day,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    // Get total_count from first item if available, otherwise use array length
    const totalCount = licensesArray.length > 0 && licensesArray[0].total_count !== undefined
      ? Number(licensesArray[0].total_count)
      : licenses.length

    return NextResponse.json(
      {
        licenses,
        count: licenses.length,
        total: totalCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get licenses error:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching licenses" },
      { status: 500 }
    )
  }
}
