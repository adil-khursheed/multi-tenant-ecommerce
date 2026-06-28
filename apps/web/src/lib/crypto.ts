import crypto from "crypto";

import { env } from "@/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV — recommended for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

function getKey(): Buffer {
  const hex = env.ENCRYPTION_KEY;
  if (!hex)
    throw new Error("ENCRYPTION_KEY is not set in environment variables");
  if (hex.length !== 64)
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex-encoded).
 * A fresh random IV is generated on every call, so identical inputs produce different ciphertexts.
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts a value produced by encryptField.
 * Returns the original plaintext. Throws if the auth tag is invalid (tampered data).
 */
export function decryptField(stored: string): string {
  if (!stored) return stored;
  // Return as-is if not in encrypted format (handles legacy/plain values gracefully)
  if (!stored.includes(":")) return stored;

  const parts = stored.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted field format");

  const ivHex = parts[0]!;
  const authTagHex = parts[1]!;
  const encryptedHex = parts[2]!;
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  if (iv.length !== IV_LENGTH) throw new Error("Invalid IV length");
  if (authTag.length !== TAG_LENGTH) throw new Error("Invalid auth tag length");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

/**
 * Returns true if the value is already encrypted (has the iv:tag:ciphertext format).
 * Used in beforeChange hooks to prevent double-encryption.
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 3 && parts.every((p) => /^[0-9a-f]+$/i.test(p));
}
