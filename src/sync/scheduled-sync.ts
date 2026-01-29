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
 * Progressive check intervals based on time until digest.
 * Increases frequency as digest approaches for better sync reliability.
 */
const CHECK_INTERVALS = [
	{ hoursBeforeDigest: 12, checkEvery: 60 * 60 * 1000 },  // 12h-6h: check every 1 hour
	{ hoursBeforeDigest: 6, checkEvery: 30 * 60 * 1000 },   // 6h-2h: check every 30 min
	{ hoursBeforeDigest: 2, checkEvery: 15 * 60 * 1000 },   // 2h-1h: check every 15 min
	{ hoursBeforeDigest: 1, checkEvery: 10 * 60 * 1000 },   // 1h-0: check every 10 min
];

/**
 * Default check interval when digest time is far away (1 hour)
 */
const DEFAULT_CHECK_INTERVAL = 60 * 60 * 1000;

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

		// Set up periodic checks with default interval
		// Will be rescheduled with appropriate interval after first check
		this.scheduleNextCheck(DEFAULT_CHECK_INTERVAL);
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
				// Reschedule with default interval
				this.scheduleNextCheck(DEFAULT_CHECK_INTERVAL);
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

			// Reschedule with appropriate interval based on time until digest
			const nextInterval = this.getCheckInterval(hoursUntilDigest);
			this.scheduleNextCheck(nextInterval);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			this.debug(`Scheduled sync check failed: ${message}`);
			// On error, retry with default interval
			this.scheduleNextCheck(DEFAULT_CHECK_INTERVAL);
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
			Date.now() - this.scheduleLastFetched.getTime() < DEFAULT_CHECK_INTERVAL
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
	 * Get the appropriate check interval based on hours until digest.
	 */
	private getCheckInterval(hoursUntilDigest: number): number {
		// Find the appropriate interval based on time until digest
		for (const tier of CHECK_INTERVALS) {
			if (hoursUntilDigest <= tier.hoursBeforeDigest) {
				return tier.checkEvery;
			}
		}
		return DEFAULT_CHECK_INTERVAL;
	}

	/**
	 * Schedule the next check with the given interval.
	 */
	private scheduleNextCheck(interval: number): void {
		// Clear existing interval
		if (this.checkInterval !== null) {
			window.clearInterval(this.checkInterval);
		}

		// Schedule next check
		this.checkInterval = window.setInterval(
			() => this.checkAndSync(),
			interval
		);

		const minutes = Math.round(interval / 60000);
		this.debug(`Next check in ${minutes} minutes`);
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
