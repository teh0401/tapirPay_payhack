// Simple Base85 encoding/decoding

const BASE85_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';

export function encode(data: Uint8Array | ArrayBuffer | any): string {
  if (!data) return '';
  
  // Ensure we have a Uint8Array
  let uint8Array: Uint8Array;
  if (data instanceof Uint8Array) {
    uint8Array = data;
  } else if (data instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(data);
  } else if (data.buffer) {
    uint8Array = new Uint8Array(data.buffer);
  } else {
    // Fallback for other types
    uint8Array = new Uint8Array(0);
  }
  
  if (uint8Array.length === 0) return '';
  
  // Convert to string safely
  return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
}

export function decode(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0);
  
  // Simple base64 fallback for now (can be replaced with proper base85)
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}