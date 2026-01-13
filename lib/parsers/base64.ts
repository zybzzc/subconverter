/**
 * Base64 detection and decoding utilities
 */

/**
 * Check if a string is likely Base64 encoded
 */
export function isBase64(str: string): boolean {
  // Trim whitespace
  const trimmed = str.trim();

  // Empty string is not base64
  if (!trimmed) return false;

  // Base64 pattern: alphanumeric + / + = padding
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

  // Check if it looks like a URL or plain text (not base64)
  if (trimmed.includes('://') || trimmed.includes('\n')) {
    // Could be newline-separated URIs
    const lines = trimmed.split('\n').filter(l => l.trim());
    if (lines.some(l => l.includes('://'))) {
      return false;
    }
  }

  // Must be at least somewhat long to be valid base64
  if (trimmed.length < 20) return false;

  // Check pattern match
  if (!base64Regex.test(trimmed)) return false;

  // Try to decode and check if result is valid
  try {
    const decoded = decodeBase64(trimmed);
    // Should contain some protocol URIs or valid text
    return decoded.length > 0 && !decoded.includes('\uFFFD');
  } catch {
    return false;
  }
}

/**
 * Decode a Base64 string to UTF-8 text
 */
export function decodeBase64(str: string): string {
  // Handle both standard and URL-safe Base64
  let normalized = str.trim()
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding if needed
  const pad = normalized.length % 4;
  if (pad) {
    normalized += '='.repeat(4 - pad);
  }

  // Decode
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Convert to UTF-8 string
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

/**
 * Auto-detect and decode content (base64 or plain text)
 */
export function autoDecodeContent(content: string): string {
  const trimmed = content.trim();

  if (isBase64(trimmed)) {
    try {
      return decodeBase64(trimmed);
    } catch (e) {
      // If decode fails, return original
      console.warn('Base64 decode failed:', e);
      return trimmed;
    }
  }

  return trimmed;
}
