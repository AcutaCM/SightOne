/**
 * Data Encryption
 * Provides encryption and decryption utilities for sensitive data
 */

import crypto from 'crypto';
import { logger } from '../logger/logger';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

/**
 * Encryption error
 */
export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;

  if (keyEnv) {
    // Use provided key
    const key = Buffer.from(keyEnv, 'hex');
    if (key.length !== KEY_LENGTH) {
      throw new EncryptionError(
        `Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`
      );
    }
    return key;
  }

  // Generate a key (for development only)
  if (process.env.NODE_ENV === 'development') {
    logger.warn('No ENCRYPTION_KEY found, generating temporary key for development');
    return crypto.randomBytes(KEY_LENGTH);
  }

  throw new EncryptionError(
    'ENCRYPTION_KEY environment variable is required in production'
  );
}

/**
 * Derive key from password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Generate random salt
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Encrypt data
 */
export function encrypt(plaintext: string, key?: Buffer): string {
  try {
    const encryptionKey = key || getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), authTag]);

    return combined.toString('base64');
  } catch (error) {
    logger.error('Encryption failed', { error });
    throw new EncryptionError('Failed to encrypt data');
  }
}

/**
 * Decrypt data
 */
export function decrypt(ciphertext: string, key?: Buffer): string {
  try {
    const encryptionKey = key || getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', { error });
    throw new EncryptionError('Failed to decrypt data');
  }
}

/**
 * Encrypt object (converts to JSON first)
 */
export function encryptObject<T>(obj: T, key?: Buffer): string {
  const json = JSON.stringify(obj);
  return encrypt(json, key);
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export function decryptObject<T>(ciphertext: string, key?: Buffer): T {
  const json = decrypt(ciphertext, key);
  return JSON.parse(json);
}

/**
 * Hash data using SHA-256
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash data with salt
 */
export function hashWithSalt(data: string, salt: Buffer): string {
  return crypto.createHash('sha256').update(data + salt.toString('hex')).digest('hex');
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateToken(32);
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expected: string): boolean {
  if (!token || !expected) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/**
 * Encrypt backup file
 */
export async function encryptBackupFile(
  data: any,
  password?: string
): Promise<{ encrypted: string; salt: string }> {
  try {
    const json = JSON.stringify(data);

    if (password) {
      // Use password-based encryption
      const salt = generateSalt();
      const key = deriveKey(password, salt);
      const encrypted = encrypt(json, key);

      return {
        encrypted,
        salt: salt.toString('hex'),
      };
    } else {
      // Use default encryption key
      const encrypted = encrypt(json);

      return {
        encrypted,
        salt: '',
      };
    }
  } catch (error) {
    logger.error('Backup encryption failed', { error });
    throw new EncryptionError('Failed to encrypt backup file');
  }
}

/**
 * Decrypt backup file
 */
export async function decryptBackupFile(
  encrypted: string,
  password?: string,
  saltHex?: string
): Promise<any> {
  try {
    let decrypted: string;

    if (password && saltHex) {
      // Use password-based decryption
      const salt = Buffer.from(saltHex, 'hex');
      const key = deriveKey(password, salt);
      decrypted = decrypt(encrypted, key);
    } else {
      // Use default encryption key
      decrypted = decrypt(encrypted);
    }

    return JSON.parse(decrypted);
  } catch (error) {
    logger.error('Backup decryption failed', { error });
    throw new EncryptionError('Failed to decrypt backup file');
  }
}

/**
 * Key management utilities
 */
export class KeyManager {
  private keys: Map<string, Buffer> = new Map();

  /**
   * Generate new encryption key
   */
  generateKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH);
  }

  /**
   * Store key with identifier
   */
  storeKey(id: string, key: Buffer): void {
    if (key.length !== KEY_LENGTH) {
      throw new EncryptionError(`Key must be ${KEY_LENGTH} bytes`);
    }

    this.keys.set(id, key);
    logger.info('Key stored', { keyId: id });
  }

  /**
   * Retrieve key by identifier
   */
  getKey(id: string): Buffer | undefined {
    return this.keys.get(id);
  }

  /**
   * Delete key
   */
  deleteKey(id: string): boolean {
    const deleted = this.keys.delete(id);
    if (deleted) {
      logger.info('Key deleted', { keyId: id });
    }
    return deleted;
  }

  /**
   * Rotate key (generate new key and return old one)
   */
  rotateKey(id: string): { oldKey: Buffer | undefined; newKey: Buffer } {
    const oldKey = this.keys.get(id);
    const newKey = this.generateKey();

    this.keys.set(id, newKey);
    logger.info('Key rotated', { keyId: id });

    return { oldKey, newKey };
  }

  /**
   * Export key as hex string
   */
  exportKey(id: string): string | undefined {
    const key = this.keys.get(id);
    return key?.toString('hex');
  }

  /**
   * Import key from hex string
   */
  importKey(id: string, keyHex: string): void {
    const key = Buffer.from(keyHex, 'hex');
    this.storeKey(id, key);
  }

  /**
   * Clear all keys
   */
  clear(): void {
    this.keys.clear();
    logger.info('All keys cleared');
  }
}

export const keyManager = new KeyManager();

/**
 * File permission utilities (for Node.js environment)
 */
export async function setSecureFilePermissions(filePath: string): Promise<void> {
  if (typeof window !== 'undefined') {
    // Browser environment, skip
    return;
  }

  try {
    const fs = await import('fs/promises');

    // Set file permissions to 600 (read/write for owner only)
    await fs.chmod(filePath, 0o600);

    logger.info('Secure file permissions set', { filePath });
  } catch (error) {
    logger.error('Failed to set file permissions', { filePath, error });
    throw new EncryptionError('Failed to set secure file permissions');
  }
}

/**
 * Verify file permissions
 */
export async function verifySecureFilePermissions(filePath: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    // Browser environment, skip
    return true;
  }

  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);

    // Check if permissions are 600 (read/write for owner only)
    const mode = stats.mode & 0o777;
    const isSecure = mode === 0o600;

    if (!isSecure) {
      logger.warn('Insecure file permissions detected', {
        filePath,
        currentMode: mode.toString(8),
        expectedMode: '600',
      });
    }

    return isSecure;
  } catch (error) {
    logger.error('Failed to verify file permissions', { filePath, error });
    return false;
  }
}

/**
 * Generate encryption key and save to environment file
 */
export function generateEncryptionKeyForEnv(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  const keyHex = key.toString('hex');

  console.log('\n=== Generated Encryption Key ===');
  console.log('Add this to your .env.local file:');
  console.log(`ENCRYPTION_KEY=${keyHex}`);
  console.log('================================\n');

  return keyHex;
}
