import { SignJWT, jwtVerify } from "jose"
import { NextRequest } from "next/server"
import { cookies } from "next/headers"

// JWT Secret - must be provided via env
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

/**
 * Get secret key for JWT operations
 */
function getSecretKey() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Please configure it in your environment.")
  }
  const encoder = new TextEncoder()
  return encoder.encode(JWT_SECRET)
}

// Cookie name for storing the auth token
export const AUTH_COOKIE_NAME = "admin-auth-token"

export interface TokenPayload {
  adminId: string
  username: string
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token for an admin user
 */
export async function generateToken(adminId: string, username: string): Promise<string> {
  const secretKey = getSecretKey()
  
  // Parse expires in (e.g., "24h" -> 24 * 60 * 60 seconds)
  let expiresInSeconds = 60 * 60 * 24 // default 24 hours
  if (JWT_EXPIRES_IN.endsWith("h")) {
    const hours = parseInt(JWT_EXPIRES_IN.slice(0, -1))
    expiresInSeconds = hours * 60 * 60
  } else if (JWT_EXPIRES_IN.endsWith("d")) {
    const days = parseInt(JWT_EXPIRES_IN.slice(0, -1))
    expiresInSeconds = days * 60 * 60 * 24
  } else if (JWT_EXPIRES_IN.endsWith("m")) {
    const minutes = parseInt(JWT_EXPIRES_IN.slice(0, -1))
    expiresInSeconds = minutes * 60
  } else if (JWT_EXPIRES_IN.endsWith("s")) {
    expiresInSeconds = parseInt(JWT_EXPIRES_IN.slice(0, -1))
  }

  const token = await new SignJWT({
    adminId,
    username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secretKey)

  return token
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey()
    const { payload } = await jwtVerify(token, secretKey)
    return payload as TokenPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

/**
 * Get token from request cookies
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  return token || null
}

/**
 * Get token from server-side cookies (for server components)
 */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  return token || null
}

/**
 * Verify authentication from request
 */
export async function verifyAuth(request: NextRequest): Promise<{ valid: boolean; payload?: TokenPayload }> {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return { valid: false }
  }

  const payload = await verifyToken(token)
  
  if (!payload) {
    return { valid: false }
  }

  return { valid: true, payload }
}

