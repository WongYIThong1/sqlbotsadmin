import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { hashPassword, generateApiKey } from "@/lib/user"

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

    // Build query
    let query = `${SUPABASE_URL}/rest/v1/users?select=id,username,plan,status,machine_name_1,machine_name_2,machine_name_3,discord_id,apikey,expires_at,created_at,updated_at&order=created_at.desc`

    // Add filters
    if (status && status !== "All") {
      query += `&status=eq.${encodeURIComponent(status)}`
    }

    if (search) {
      query += `&username=ilike.%25${encodeURIComponent(search)}%25`
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
      console.error("Failed to fetch users:", response.status, errorText)
      return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
    }

    const users = await response.json()

    // Get total count
    let countQuery = `${SUPABASE_URL}/rest/v1/users?select=id&head=true`
    if (status && status !== "All") {
      countQuery += `&status=eq.${encodeURIComponent(status)}`
    }
    if (search) {
      countQuery += `&username=ilike.%25${encodeURIComponent(search)}%25`
    }

    const countResponse = await fetch(countQuery, {
      method: "HEAD",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    const totalCount = countResponse.headers.get("content-range")?.split("/")[1] || users.length.toString()

    return NextResponse.json(
      {
        users,
        count: users.length,
        total: parseInt(totalCount),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return missingConfigResponse()

  const auth = await verifyAuth(request)
  if (!auth.valid) {
    return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { username, password, plan, discord_id } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ message: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    const planNum = plan ? parseInt(plan) : 30
    if (isNaN(planNum) || planNum < 1) {
      return NextResponse.json({ message: "Plan must be a positive number" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate API key
    let apiKey = generateApiKey()
    let keyExists = true
    let attempts = 0
    const maxAttempts = 10

    // Ensure API key is unique
    while (keyExists && attempts < maxAttempts) {
      const checkResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/users?apikey=eq.${encodeURIComponent(apiKey)}&select=id`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      )

      if (checkResponse.ok) {
        const existing = await checkResponse.json()
        keyExists = Array.isArray(existing) && existing.length > 0
        if (keyExists) {
          apiKey = generateApiKey()
          attempts++
        }
      } else {
        keyExists = false
      }
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ message: "Failed to generate unique API key" }, { status: 500 })
    }

    // Create user
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        username,
        password_hash: passwordHash,
        plan: planNum,
        apikey: apiKey,
        machine_name_1: null,
        machine_name_2: null,
        machine_name_3: null,
        status: "Active",
        discord_id: discord_id || null,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to create user:", response.status, errorText)

      if (response.status === 409) {
        return NextResponse.json({ message: "Username already exists" }, { status: 409 })
      }

      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    const newUser = await response.json()
    const user = Array.isArray(newUser) ? newUser[0] : newUser

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
  }
}

