/**
 * Status bar indicator for sync state.
 */

import { Plugin, setIcon } from 'obsidian';
import { SyncStatus } from '../types';

/**
 * Stale sync threshold in hours
 */
const STALE_THRESHOLD_HOURS = 24;

/**
 * Manages the status bar item showing sync state.
 */
export class StatusBarManager {
	private statusBarEl: HTMLElement;
	private lastSyncTime: string | null = null;

	constructor(plugin: Plugin) {
		this.statusBarEl = plugin.addStatusBarItem();
		this.statusBarEl.addClass('secondbrain-status-bar');
		this.setIdle();
	}

	/**
	 * Set the last sync time for health indicator.
	 */
	setLastSyncTime(time: string | null): void {
		this.lastSyncTime = time;
	}

	/**
	 * Update status bar based on sync status.
	 */
	update(status: SyncStatus): void {
		switch (status.state) {
			case 'idle':
				this.setIdle();
				break;
			case 'syncing':
				this.setSyncing(status.syncedCount, status.pendingCount);
				break;
			case 'error':
				this.setError(status.error);
				break;
		}
	}

	/**
	 * Set idle state.
	 */
	setIdle(): void {
		this.statusBarEl.empty();
		this.statusBarEl.removeClass('syncing', 'error', 'disconnected', 'stale');
		this.statusBarEl.removeAttribute('aria-label');

		// Check if sync is stale
		const staleInfo = this.getSyncHealth();

		if (staleInfo.isStale) {
			this.statusBarEl.addClass('stale');

			const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
			setIcon(icon, 'clock');

			this.statusBarEl.createSpan({
				text: 'SB Stale',
				cls: 'secondbrain-text',
			});

			this.statusBarEl.setAttribute('title', staleInfo.message);
		} else {
			this.statusBarEl.addClass('idle');

			const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
			setIcon(icon, 'check-circle');

			this.statusBarEl.createSpan({
				text: 'SB Synced',
				cls: 'secondbrain-text',
			});

			if (staleInfo.message) {
				this.statusBarEl.setAttribute('title', staleInfo.message);
			}
		}
	}

	/**
	 * Get sync health information.
	 */
	private getSyncHealth(): { isStale: boolean; message: string } {
		if (!this.lastSyncTime) {
			return { isStale: true, message: 'Never synced - run a sync to get started' };
		}

		const lastSync = new Date(this.lastSyncTime);
		const now = new Date();
		const hoursAgo = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

		if (hoursAgo >= STALE_THRESHOLD_HOURS) {
			return {
				isStale: true,
				message: `Last sync ${this.formatTimeAgo(hoursAgo)} ago - consider syncing before next digest`,
			};
		}

		return {
			isStale: false,
			message: `Last sync: ${this.formatTimeAgo(hoursAgo)} ago`,
		};
	}

	/**
	 * Format hours ago as human-readable string.
	 */
	private formatTimeAgo(hours: number): string {
		if (hours < 1) {
			const minutes = Math.round(hours * 60);
			return `${minutes}m`;
		}
		if (hours < 24) {
			return `${Math.round(hours)}h`;
		}
		const days = Math.floor(hours / 24);
		return `${days}d`;
	}

	/**
	 * Set syncing state.
	 */
	setSyncing(synced?: number, total?: number): void {
		this.statusBarEl.empty();
		this.statusBarEl.removeClass('idle', 'error', 'disconnected');
		this.statusBarEl.addClass('syncing');
		this.statusBarEl.removeAttribute('aria-label');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon spinning' });
		setIcon(icon, 'refresh-cw');

		let text = 'Syncing';
		if (synced !== undefined && total !== undefined && total > 0) {
			const percent = Math.round((synced / total) * 100);
			text = `Syncing ${synced}/${total} (${percent}%)`;
		} else {
			text = 'Syncing...';
		}

		this.statusBarEl.createSpan({
			text,
			cls: 'secondbrain-text',
		});
	}

	/**
	 * Set error state.
	 */
	setError(message?: string): void {
		this.statusBarEl.empty();
		this.statusBarEl.removeClass('idle', 'syncing', 'disconnected');
		this.statusBarEl.addClass('error');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
		setIcon(icon, 'alert-triangle');

		this.statusBarEl.createSpan({
			text: 'SB Sync Error',
			cls: 'secondbrain-text',
		});

		if (message) {
			this.statusBarEl.setAttribute('aria-label', `Error: ${message}`);
			this.statusBarEl.setAttribute('title', `Error: ${message}`);
		}
	}

	/**
	 * Set disconnected state (no API token configured).
	 */
	setDisconnected(): void {
		this.statusBarEl.empty();
		this.statusBarEl.removeClass('idle', 'syncing', 'error');
		this.statusBarEl.addClass('disconnected');
		this.statusBarEl.removeAttribute('aria-label');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
		setIcon(icon, 'unlink');

		this.statusBarEl.createSpan({
			text: 'SB Not configured',
			cls: 'secondbrain-text',
		});

		this.statusBarEl.setAttribute('title', 'Click to configure Second Brain Digest sync');
	}
}
