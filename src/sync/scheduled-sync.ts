/**
 * Scheduled sync manager for pre-digest syncs.
 *
 * Fetches the user's digest schedule and triggers a sync
 * before the scheduled digest time to ensure fresh data.
 */

import { Notice } from 'obsidian';
import { ApiClient } from '../api/client';
import { ScheduleResponse } from '../api/types';
import { PluginSettings } from '../types';

/**
 * Check interval for scheduled sync (1 hour in milliseconds)
 */
const CHECK_INTERVAL = 60 * 60 * 1000;

/**
 * Minimum time between scheduled syncs (to avoid repeated triggers)
 */
const MIN_SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

/**
 * Callback type for triggering a sync
 */
export type SyncTrigger = () => Promise<void>;

/**
 * Debug callback type
 */
export type DebugCallback = (message: string) => void;

/**
 * Manages scheduled pre-digest syncs.
 */
export class ScheduledSyncManager {
	private apiClient: ApiClient;
	private syncTrigger: SyncTrigger;
	private debugCallback?: DebugCallback;
	private checkInterval: number | null = null;
	private lastScheduledSync: Date | null = null;
	private cachedSchedule: ScheduleResponse | null = null;
	private scheduleLastFetched: Date | null = null;
	private settings: PluginSettings;

	constructor(
		apiClient: ApiClient,
		syncTrigger: SyncTrigger,
		settings: PluginSettings,
		debugCallback?: DebugCallback
	) {
		this.apiClient = apiClient;
		this.syncTrigger = syncTrigger;
		this.settings = settings;
		this.debugCallback = debugCallback;
	}

	/**
	 * Update settings reference.
	 */
	updateSettings(settings: PluginSettings): void {
		this.settings = settings;
	}

	/**
	 * Start the scheduled sync checker.
	 */
	start(): void {
		if (this.checkInterval !== null) {
			this.debug('Scheduled sync already running');
			return;
		}

		if (!this.settings.scheduledSync) {
			this.debug('Scheduled sync is disabled');
			return;
		}

		this.debug('Starting scheduled sync manager');

		// Do an immediate check
		this.checkAndSync();

		// Set up periodic checks
		this.checkInterval = window.setInterval(
			() => this.checkAndSync(),
			CHECK_INTERVAL
		);
	}

	/**
	 * Stop the scheduled sync checker.
	 */
	stop(): void {
		if (this.checkInterval !== null) {
			window.clearInterval(this.checkInterval);
			this.checkInterval = null;
			this.debug('Stopped scheduled sync manager');
		}
	}

	/**
	 * Check if a sync is needed and trigger if so.
	 */
	async checkAndSync(): Promise<void> {
		if (!this.settings.scheduledSync) {
			return;
		}

		try {
			const schedule = await this.getSchedule();

			if (!schedule || !schedule.is_enabled || !schedule.next_digest_utc) {
				this.debug('No scheduled digest or schedule disabled');
				return;
			}

			const nextDigest = new Date(schedule.next_digest_utc);
			const now = new Date();
			const hoursUntilDigest = (nextDigest.getTime() - now.getTime()) / (1000 * 60 * 60);

			this.debug(`Next digest in ${hoursUntilDigest.toFixed(1)} hours`);

			// Check if we're within the sync window
			if (hoursUntilDigest > 0 && hoursUntilDigest <= this.settings.scheduledSyncHoursBefore) {
				// Check if we've already synced recently
				if (this.shouldTriggerSync()) {
					this.debug('Triggering scheduled pre-digest sync');
					new Notice('Syncing vault before scheduled digest...');

					await this.syncTrigger();
					this.lastScheduledSync = new Date();

					this.debug('Scheduled sync completed');
				} else {
					this.debug('Skipping sync - already synced recently');
				}
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			this.debug(`Scheduled sync check failed: ${message}`);
		}
	}

	/**
	 * Get the digest schedule, using cache if available.
	 */
	private async getSchedule(): Promise<ScheduleResponse | null> {
		// Use cache if fetched within last hour
		if (
			this.cachedSchedule &&
			this.scheduleLastFetched &&
			Date.now() - this.scheduleLastFetched.getTime() < CHECK_INTERVAL
		) {
			return this.cachedSchedule;
		}

		try {
			this.cachedSchedule = await this.apiClient.getDigestSchedule();
			this.scheduleLastFetched = new Date();
			return this.cachedSchedule;
		} catch (error) {
			this.debug('Failed to fetch digest schedule');
			return null;
		}
	}

	/**
	 * Check if we should trigger a sync based on last sync time.
	 */
	private shouldTriggerSync(): boolean {
		if (!this.lastScheduledSync) {
			return true;
		}

		const timeSinceLastSync = Date.now() - this.lastScheduledSync.getTime();
		return timeSinceLastSync >= MIN_SYNC_INTERVAL;
	}

	/**
	 * Get the cached schedule (for UI display).
	 */
	getCachedSchedule(): ScheduleResponse | null {
		return this.cachedSchedule;
	}

	/**
	 * Force refresh the schedule.
	 */
	async refreshSchedule(): Promise<ScheduleResponse | null> {
		this.scheduleLastFetched = null;
		return this.getSchedule();
	}

	/**
	 * Log debug message if debug mode is enabled.
	 */
	private debug(message: string): void {
		this.debugCallback?.(`[ScheduledSync] ${message}`);
	}
}
