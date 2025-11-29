/**
 * License Key Generator
 * Generates unique license keys in the format: SQLBots-XXXXXX-XXXX
 */

/**
 * Generate a random string of specified length
 */
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed I, O, 0, 1 for readability
  const randomBytes = new Uint8Array(length)
  crypto.getRandomValues(randomBytes)
  
  return Array.from(randomBytes)
    .map(byte => chars[byte % chars.length])
    .join("")
}

/**
 * Generate a unique license key
 * Format: SQLBots-{RANDOM-6CHARS}-{RANDOM-4CHARS}
 * Example: SQLBots-A3B7C9-D2E8
 */
export function generateLicenseKey(): string {
  const firstPart = generateRandomString(6)
  const secondPart = generateRandomString(4)
  
  return `SQLBots-${firstPart}-${secondPart}`
}

/**
 * Validate license key format
 */
export function validateLicenseKeyFormat(licenseKey: string): boolean {
  const pattern = /^SQLBots-[A-Z2-9]{6}-[A-Z2-9]{4}$/
  return pattern.test(licenseKey)
}

/**
 * Generate multiple unique license keys
 * Ensures all keys are unique
 */
export function generateMultipleLicenseKeys(count: number): string[] {
  const keys = new Set<string>()
  const maxAttempts = count * 100 // Prevent infinite loops
  
  for (let i = 0; i < maxAttempts && keys.size < count; i++) {
    const key = generateLicenseKey()
    keys.add(key)
  }
  
  if (keys.size < count) {
    throw new Error(`Failed to generate ${count} unique license keys after ${maxAttempts} attempts`)
  }
  
  return Array.from(keys)
}


