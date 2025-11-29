import { NextRequest, NextResponse } from "next/server"
import { generateToken, AUTH_COOKIE_NAME } from "@/lib/auth"

// Supabase configuration from environment variables
// TODO: Remove default values and use only environment variables in production
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kicjyrmadhkozwganhbi.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpY2p5cm1hZGhrb3p3Z2FuaGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Mjk5MDIsImV4cCI6MjA3OTEwNTkwMn0.uVhc7OyncTsFXoxJP3Wuaqto64oZH1g-N9sRAle2Xec"

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
    console.log("Using Supabase URL:", SUPABASE_URL)
    console.log("API Key set:", !!SUPABASE_ANON_KEY, "Length:", SUPABASE_ANON_KEY?.length)

    // Call Supabase RPC function to verify admin credentials
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_admin_credentials`, {
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

    console.log("Supabase response status:", supabaseResponse.status)

    const responseText = await supabaseResponse.text()
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

    if (!supabaseResponse.ok) {
      console.error("Supabase RPC error:", supabaseResponse.status, result)
      
      // Provide more specific error message for API key issues
      if (supabaseResponse.status === 401 && result?.message?.includes("Invalid API key")) {
        return NextResponse.json(
          { message: "Invalid API key configured. Please check your Supabase credentials in .env.local file." },
          { status: 500 }
        )
      }
      
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
    // Generate JWT token
    const token = await generateToken(authResult.id, authResult.username)

    // Create response with admin data
    const response = NextResponse.json(
      {
        message: "Login successful",
        admin: {
          id: authResult.id,
          username: authResult.username,
        },
      },
      { status: 200 }
    )

    // Set HTTP-only cookie with token
    const isProduction = process.env.NODE_ENV === "production"
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Only send over HTTPS in production
      sameSite: "lax" as const, // Use 'lax' for better compatibility, especially for redirects
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: "/",
    }

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "An error occurred during authentication" },
      { status: 500 }
    )
  }
}

