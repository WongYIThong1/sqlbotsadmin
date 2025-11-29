import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { generateMultipleLicenseKeys } from "@/lib/license"

// Supabase configuration (server-only)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.valid) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { quantity, day } = body

    // Validate input
    if (!quantity || !day) {
      return NextResponse.json(
        { message: "Quantity and day are required" },
        { status: 400 }
      )
    }

    const quantityNum = parseInt(quantity.toString())
    const dayNum = parseInt(day.toString())

    if (isNaN(quantityNum) || quantityNum < 1 || quantityNum > 100) {
      return NextResponse.json(
        { message: "Quantity must be between 1 and 100" },
        { status: 400 }
      )
    }

    if (isNaN(dayNum) || dayNum < 1) {
      return NextResponse.json(
        { message: "Day must be a positive integer" },
        { status: 400 }
      )
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { message: "Server configuration error. Please contact the administrator." },
        { status: 500 }
      )
    }

    // Generate license keys
    let licenseKeys: string[]
    try {
      licenseKeys = generateMultipleLicenseKeys(quantityNum)
    } catch (error) {
      console.error("Failed to generate license keys:", error)
      return NextResponse.json(
        { message: "Failed to generate license keys. Please try again." },
        { status: 500 }
      )
    }

    // Prepare data for bulk insert
    const licensesToInsert = licenseKeys.map(key => ({
      license_key: key,
      status: "Inactive",
      day: dayNum,
    }))

    // Insert licenses into database using RPC function
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/insert_licenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        licenses_data: licensesToInsert,
      }),
    })

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text()
      console.error("Failed to insert licenses:", insertResponse.status, errorText)
      
      // Check for duplicate key error
      if (insertResponse.status === 409) {
        return NextResponse.json(
          { message: "One or more license keys already exist. Please try again." },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { message: "Failed to save licenses to database. Please try again." },
        { status: 500 }
      )
    }

    const createdLicenses = await insertResponse.json()

    return NextResponse.json(
      {
        message: `Successfully generated ${quantityNum} license(s)`,
        licenses: createdLicenses,
        count: createdLicenses.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Generate licenses error:", error)
    return NextResponse.json(
      { message: "An error occurred while generating licenses" },
      { status: 500 }
    )
  }
}
