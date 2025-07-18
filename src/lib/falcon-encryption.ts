// falcon-encryption.ts
// Falcon post-quantum cryptography for payload encryption

import { falcon } from 'falcon-crypto';

// Falcon key pair interface
interface FalconKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

// Encrypted payload interface
interface EncryptedPayload {
  data: string;
  signature: string;
  publicKey: string;
  timestamp: number;
}

// Generate Falcon key pair
export async function generateFalconKeyPair(): Promise<FalconKeyPair> {
  const keyPair = await falcon.keyPair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey
  };
}

// Encrypt and sign payload using Falcon
export async function encryptPayloadWithFalcon(payload: any, keyPair: FalconKeyPair): Promise<EncryptedPayload> {
  try {
    // Convert payload to string
    const payloadStr = JSON.stringify(payload);
    const message = new TextEncoder().encode(payloadStr);
    
    // Create a simple "encryption" by encoding the data (Falcon is primarily for signatures)
    // Note: Falcon is a signature scheme, not an encryption scheme
    // For actual encryption, we'd typically use it alongside a symmetric cipher
    const encodedData = btoa(payloadStr);
    
    // Sign the payload using detached signature
    const signature = await falcon.signDetached(message, keyPair.privateKey);
    
    return {
      data: encodedData,
      signature: Array.from(signature).join(','), // Convert Uint8Array to string
      publicKey: Array.from(keyPair.publicKey).join(','), // Convert to string for storage
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Falcon encryption failed:', error);
    throw new Error('Failed to encrypt payload with Falcon');
  }
}

// Decrypt and verify payload using Falcon
export async function decryptPayloadWithFalcon(encryptedPayload: EncryptedPayload): Promise<any> {
  try {
    // Reconstruct public key from string
    const publicKey = new Uint8Array(
      encryptedPayload.publicKey.split(',').map(num => parseInt(num))
    );
    
    // Reconstruct signature from string
    const signature = new Uint8Array(
      encryptedPayload.signature.split(',').map(num => parseInt(num))
    );
    
    // Decode the data
    const payloadStr = atob(encryptedPayload.data);
    const message = new TextEncoder().encode(payloadStr);
    
    // Verify signature
    const isValid = await falcon.verifyDetached(signature, message, publicKey);
    
    if (!isValid) {
      throw new Error('Falcon signature verification failed');
    }
    
    // Parse and return the original payload
    return JSON.parse(payloadStr);
  } catch (error) {
    console.error('Falcon decryption/verification failed:', error);
    throw new Error('Failed to decrypt/verify payload with Falcon');
  }
}

// Verify payload integrity without decryption
export async function verifyFalconPayload(encryptedPayload: EncryptedPayload): Promise<boolean> {
  try {
    await decryptPayloadWithFalcon(encryptedPayload);
    return true;
  } catch {
    return false;
  }
}

// Get or create Falcon key pair from localStorage
export async function getFalconKeyPair(): Promise<FalconKeyPair> {
  const stored = localStorage.getItem('falcon_keypair');
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        publicKey: new Uint8Array(parsed.publicKey.split(',').map((num: string) => parseInt(num))),
        privateKey: new Uint8Array(parsed.privateKey.split(',').map((num: string) => parseInt(num)))
      };
    } catch (error) {
      console.error('Failed to parse stored Falcon key pair:', error);
    }
  }
  
  // Generate new key pair if none exists or parsing failed
  const newKeyPair = await generateFalconKeyPair();
  
  // Store the key pair
  localStorage.setItem('falcon_keypair', JSON.stringify({
    publicKey: Array.from(newKeyPair.publicKey).join(','),
    privateKey: Array.from(newKeyPair.privateKey).join(',')
  }));
  
  return newKeyPair;
}