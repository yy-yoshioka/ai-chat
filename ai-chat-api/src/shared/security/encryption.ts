import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Get encryption key from environment or generate a default one for development
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!key) {
    throw new Error('ENCRYPTION_KEY or JWT_SECRET must be set');
  }
  return key;
};

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - The plain text to encrypt
 * @returns The encrypted data with salt, iv, and tag
 */
export function encrypt(text: string): string {
  try {
    const masterKey = getEncryptionKey();

    // Generate a random salt
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive a key from the master key and salt
    const key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    // Get the authentication tag
    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);

    // Return base64 encoded string
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedText - The base64 encoded encrypted data
 * @returns The decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  try {
    const masterKey = getEncryptionKey();

    // Decode from base64
    const combined = Buffer.from(encryptedText, 'base64');

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive the key using the same salt
    const key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypts an object by converting it to JSON first
 * @param obj - The object to encrypt
 * @returns The encrypted data as base64 string
 */
export function encryptObject(obj: unknown): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts data and parses it as JSON
 * @param encryptedText - The encrypted JSON data
 * @returns The decrypted and parsed object
 */
export function decryptObject<T = unknown>(encryptedText: string): T {
  const decrypted = decrypt(encryptedText);
  return JSON.parse(decrypted) as T;
}

/**
 * Generates a secure random API key
 * @param length - The length of the API key (default 32)
 * @returns A secure random string
 */
export function generateApiKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Hashes a password or secret using bcrypt-compatible algorithm
 * @param text - The text to hash
 * @returns The hashed text
 */
export function hashSecret(text: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(text, salt, ITERATIONS, 64, 'sha256');
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verifies a hashed secret
 * @param text - The plain text to verify
 * @param hashedText - The hashed text to compare against
 * @returns True if the text matches the hash
 */
export function verifyHashedSecret(text: string, hashedText: string): boolean {
  const [salt, hash] = hashedText.split(':');
  const verifyHash = crypto.pbkdf2Sync(
    text,
    Buffer.from(salt, 'hex'),
    ITERATIONS,
    64,
    'sha256'
  );
  return hash === verifyHash.toString('hex');
}
