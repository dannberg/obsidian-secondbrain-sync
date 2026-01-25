/**
 * Settings validation helpers.
 */

import { PluginSettings, DEFAULT_SETTINGS } from '../types';

/**
 * Validate and sanitize settings loaded from storage.
 */
export function validateSettings(data: unknown): PluginSettings {
	if (!data || typeof data !== 'object') {
		return { ...DEFAULT_SETTINGS };
	}

	const obj = data as Record<string, unknown>;

	return {
		serverUrl: validateServerUrl(obj.serverUrl),
		apiToken: validateApiToken(obj.apiToken),
		autoSync: typeof obj.autoSync === 'boolean' ? obj.autoSync : DEFAULT_SETTINGS.autoSync,
		debugMode: typeof obj.debugMode === 'boolean' ? obj.debugMode : DEFAULT_SETTINGS.debugMode,
	};
}

/**
 * Validate server URL.
 */
function validateServerUrl(value: unknown): string {
	if (typeof value !== 'string' || !value.trim()) {
		return DEFAULT_SETTINGS.serverUrl;
	}

	// Ensure it starts with http:// or https://
	let url = value.trim();
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		url = 'https://' + url;
	}

	// Remove trailing slash
	url = url.replace(/\/$/, '');

	return url;
}

/**
 * Validate API token.
 */
function validateApiToken(value: unknown): string {
	if (typeof value !== 'string') {
		return '';
	}
	return value.trim();
}

/**
 * Check if settings are configured for sync.
 */
export function isConfigured(settings: PluginSettings): boolean {
	return !!(settings.serverUrl && settings.apiToken);
}

/**
 * Get a human-readable configuration status.
 */
export function getConfigurationStatus(settings: PluginSettings): string {
	if (!settings.apiToken) {
		return 'API token not configured';
	}
	if (!settings.serverUrl) {
		return 'Server URL not configured';
	}
	return 'Configured';
}
