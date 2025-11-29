import bcrypt from "bcryptjs"

/**
 * Generate a unique API key for users
 * Format: 32 character alphanumeric string
 */
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  
  return Array.from(randomBytes)
    .map(byte => chars[byte % chars.length])
    .join("")
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

