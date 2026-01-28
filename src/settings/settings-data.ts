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
		apiToken: validateApiToken(obj.apiToken),
		autoSync: typeof obj.autoSync === 'boolean' ? obj.autoSync : DEFAULT_SETTINGS.autoSync,
		scheduledSync: typeof obj.scheduledSync === 'boolean' ? obj.scheduledSync : DEFAULT_SETTINGS.scheduledSync,
		scheduledSyncHoursBefore: validateScheduledSyncHours(obj.scheduledSyncHoursBefore),
		debugMode: typeof obj.debugMode === 'boolean' ? obj.debugMode : DEFAULT_SETTINGS.debugMode,
	};
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
 * Validate scheduled sync hours before.
 */
function validateScheduledSyncHours(value: unknown): number {
	if (typeof value !== 'number' || isNaN(value)) {
		return DEFAULT_SETTINGS.scheduledSyncHoursBefore;
	}
	// Clamp between 1 and 12 hours
	return Math.max(1, Math.min(12, Math.floor(value)));
}

/**
 * Check if settings are configured for sync.
 */
export function isConfigured(settings: PluginSettings): boolean {
	return !!settings.apiToken;
}

/**
 * Get a human-readable configuration status.
 */
export function getConfigurationStatus(settings: PluginSettings): string {
	if (!settings.apiToken) {
		return 'API token not configured';
	}
	return 'Configured';
}
