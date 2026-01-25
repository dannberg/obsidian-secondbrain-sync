/**
 * Content hashing for change detection.
 */

/**
 * Generate SHA256 hash of content.
 * Uses Web Crypto API which is available in Obsidian.
 */
export async function hashContent(content: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(content);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous hash for simpler use cases.
 * Falls back to a simple hash if Web Crypto is not available.
 */
export function hashContentSync(content: string): string {
	// Simple hash implementation for synchronous use
	// This is used only when async is not practical
	let hash = 0;
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	// Convert to hex and pad to 64 chars (matching SHA256 output length)
	const hex = Math.abs(hash).toString(16);
	return hex.padStart(64, '0');
}
