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

export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_and_expire_licenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to check expired licenses:", response.status, errorText)
      return NextResponse.json(
        { message: "Failed to check expired licenses" },
        { status: 500 }
      )
    }

    const result = await response.json()
    const resultData = Array.isArray(result) ? result[0] : result

    return NextResponse.json(
      {
        message: resultData.message || "Expired licenses checked successfully",
        expired_licenses: resultData.expired_licenses || 0,
        suspended_users: resultData.suspended_users || 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Check expired licenses error:", error)
    return NextResponse.json(
      { message: "An error occurred while checking expired licenses" },
      { status: 500 }
    )
  }
}

