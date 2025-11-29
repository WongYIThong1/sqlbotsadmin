import { NextRequest, NextResponse } from "next/server"

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      )
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { message: "Server configuration error. Please contact the administrator." },
        { status: 500 }
      )
    }

    console.log("Attempting login for username:", username)

    // Call Supabase RPC function to verify admin credentials
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_admin_credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        p_username: username,
        p_password: password,
      }),
    })

    console.log("Supabase response status:", response.status)

    const responseText = await response.text()
    let result

    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse response:", responseText)
      return NextResponse.json(
        { message: "Invalid response from authentication service" },
        { status: 500 }
      )
    }

    if (!response.ok) {
      console.error("Supabase RPC error:", response.status, result)
      return NextResponse.json(
        { message: result?.message || result?.error || "Authentication failed" },
        { status: 401 }
      )
    }

    // Check if authentication was successful
    // Result should be an array with one object containing is_valid
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.error("Authentication failed - invalid result format:", result)
      return NextResponse.json(
        { message: "Authentication service returned an invalid response. Please try again." },
        { status: 500 }
      )
    }

    const authResult = result[0]

    // Check authentication result
    if (!authResult?.is_valid) {
      // Determine the specific error based on the result
      // If both id and username are null, the username doesn't exist
      // If they have values but is_valid is false, the password is wrong
      if (!authResult || (authResult.id === null && authResult.username === null)) {
        console.error("Authentication failed - username not found:", username)
        return NextResponse.json(
          { message: `The username "${username}" does not exist. Please check your username and try again.` },
          { status: 401 }
        )
      } else if (authResult.id && authResult.username && !authResult.is_valid) {
        console.error("Authentication failed - invalid password for username:", username)
        return NextResponse.json(
          { message: "The password is incorrect. Please check your password and try again." },
          { status: 401 }
        )
      } else {
        console.error("Authentication failed - unknown error:", authResult)
        return NextResponse.json(
          { message: "Invalid username or password. Please check your credentials and try again." },
          { status: 401 }
        )
      }
    }

    // Authentication successful
    // Return success response
    return NextResponse.json(
      {
        message: "Login successful",
        admin: {
          id: authResult.id,
          username: authResult.username,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "An error occurred during authentication" },
      { status: 500 }
    )
  }
}

