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
 * @returns True if the key is valid format (64 hex characters)
 */
export function isValidWidgetKey(key: string): boolean {
  return /^[0-9a-f]{64}$/.test(key);
}
