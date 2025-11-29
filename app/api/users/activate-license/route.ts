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
    const body = await request.json()
    const { license_key, user_id } = body

    if (!license_key || !user_id) {
      return NextResponse.json(
        { message: "License key and user ID are required" },
        { status: 400 }
      )
    }

    // Call the activate_license_key function
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/activate_license_key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        p_license_key: license_key,
        p_user_id: user_id,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to activate license:", response.status, errorText)
      return NextResponse.json(
        { message: "Failed to activate license key" },
        { status: 500 }
      )
    }

    const result = await response.json()
    const resultData = Array.isArray(result) ? result[0] : result

    if (!resultData.success) {
      return NextResponse.json(
        { message: resultData.message || "Failed to activate license key" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: resultData.message,
        license: resultData.license,
        user: resultData.user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Activate license error:", error)
    return NextResponse.json(
      { message: "An error occurred while activating the license" },
      { status: 500 }
    )
  }
}

