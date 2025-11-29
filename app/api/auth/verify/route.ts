import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)

    if (!authResult.valid || !authResult.payload) {
      return NextResponse.json(
        { authenticated: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          id: authResult.payload.adminId,
          username: authResult.payload.username,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { authenticated: false, message: "Verification failed" },
      { status: 500 }
    )
  }
}

