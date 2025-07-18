// AES-GCM encryption/decryption utilities

export async function AES_GCM_encrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  return new Uint8Array(encrypted);
}

export async function AES_GCM_decrypt(cipher: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    cipher
  );

  return new Uint8Array(decrypted);
}