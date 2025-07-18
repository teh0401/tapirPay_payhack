// qr-crypto-utils.ts
// Core crypto functions (ECDSA + AES-GCM + compression)

import { ec as EC } from 'elliptic';
import * as base85 from './base85';
import { AES_GCM_encrypt, AES_GCM_decrypt } from './aes-gcm';
import pako from 'pako';

const ec = new EC('p384'); // NIST384p

// --- Key generation ---
export function generateKeys() {
  const aesKey = crypto.getRandomValues(new Uint8Array(32));
  const ecKey = ec.genKeyPair();
  return {
    aesKey,
    sk: ecKey,
    vk: ecKey.getPublic()
  };
}

// --- AES-GCM Encrypt / Decrypt ---
export async function encryptPayload(payload: object, key: Uint8Array): Promise<{ cipher: string, iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = await AES_GCM_encrypt(data, key, iv);
  return {
    cipher: base85.encode(cipher),
    iv: base85.encode(iv)
  };
}

export async function decryptPayload(cipher_b85: string, iv_b85: string, key: Uint8Array): Promise<any> {
  const cipher = base85.decode(cipher_b85);
  const iv = base85.decode(iv_b85);
  const decrypted = await AES_GCM_decrypt(cipher, key, iv);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

// --- Signature ---
export function signPayload(cipher: string, iv: string, sk: any): string {
  try {
    console.log("Starting signature generation...");
    console.log("Cipher length:", cipher.length, "IV length:", iv.length);
    
    const data = new TextEncoder().encode(cipher + iv);
    console.log("Data to sign length:", data.length);
    
    const signature = sk.sign(Array.from(data));
    console.log("Signature object:", signature);
    
    const derBytes = signature.toDER();
    console.log("DER bytes:", derBytes, "length:", derBytes.length);
    
    const uint8Array = new Uint8Array(derBytes);
    const encoded = base85.encode(uint8Array);
    console.log("Final encoded signature:", encoded);
    
    return encoded;
  } catch (err) {
    console.error("Signature generation failed:", err);
    return ""; // Return empty string on failure for now to debug
  }
}

export function verifySignature(cipher: string, iv: string, sig_b85: string, vk_str: string): boolean {
  try {
    const data = new TextEncoder().encode(cipher + iv);
    const signature = base85.decode(sig_b85);
    const vk_bin = base85.decode(vk_str);
    const vk = ec.keyFromPublic(Array.from(vk_bin), 'array');
    const result = vk.verify(data, Array.from(signature));
    console.log('Signature verification - signature valid:', result);
    return result;
  } catch (err) {
    console.error('Signature verification failed:', err);
    return false;
  }
}

// --- Compression ---
export function compressPayload(payload: object): string {
  const json = JSON.stringify(payload);
  const deflated = pako.deflate(json);
  return btoa(String.fromCharCode(...deflated));
}

export function decompressPayload(b64: string): any {
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const inflated = pako.inflate(bin);
  return JSON.parse(new TextDecoder().decode(inflated));
}

// --- VerifyingKey export/import ---
export function encodeVerifyingKey(vk: any): string {
  const raw = vk.encode('array');
  return base85.encode(new Uint8Array(raw));
}

export function decodeVerifyingKey(encoded: string): any {
  const raw = base85.decode(encoded);
  return ec.keyFromPublic(raw, 'array').getPublic();
}

// --- Payload extractor ---
export function extractAckPayload(payload: any): {
  cipher: string,
  iv: string,
  key: string,
  sig: string,
  vk: string
} {
  const { data: cipher, iv, key, sig, vk } = payload;
  if (!cipher || !iv) throw new Error('Invalid ACK payload');
  return { cipher, iv, key, sig, vk };
}

// Aliases for Scanner.tsx compatibility
export const extractPayload = extractAckPayload;

export function classifyQrPayload(payload: any): any {
  // Simple classification - just return the payload as-is for now
  return payload;
}
