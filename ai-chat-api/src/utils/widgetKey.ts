import * as crypto from 'crypto';

/**
 * Generate a cryptographically secure widget key
 * @returns A 64-character hexadecimal string
 */
export function generateWidgetKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate widget key format
 * @param key The widget key to validate
 * @returns True if the key is valid format
 */
export function isValidWidgetKey(key: string): boolean {
  // Allow both new format (64 hex characters) and legacy format (for development)
  const newFormat = /^[0-9a-f]{64}$/.test(key);
  const legacyFormat = /^[a-zA-Z0-9\-_]{3,50}$/.test(key); // Allow alphanumeric, hyphens, underscores, 3-50 chars

  return newFormat || legacyFormat;
}
