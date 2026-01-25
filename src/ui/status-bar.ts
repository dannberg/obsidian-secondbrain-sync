/**
 * Status bar indicator for sync state.
 */

import { Plugin } from 'obsidian';
import { SyncStatus } from '../types';

/**
 * Manages the status bar item showing sync state.
 */
export class StatusBarManager {
	private statusBarEl: HTMLElement;

	constructor(plugin: Plugin) {
		this.statusBarEl = plugin.addStatusBarItem();
		this.statusBarEl.addClass('secondbrain-status-bar');
		this.setIdle();
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
		this.statusBarEl.removeClass('syncing', 'error');
		this.statusBarEl.addClass('idle');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
		icon.innerHTML = '&#x2713;'; // Checkmark

		this.statusBarEl.createSpan({
			text: ' SB Sync',
			cls: 'secondbrain-text',
		});
	}

	/**
	 * Set syncing state.
	 */
	setSyncing(synced?: number, total?: number): void {
		this.statusBarEl.empty();
		this.statusBarEl.removeClass('idle', 'error');
		this.statusBarEl.addClass('syncing');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon spinning' });
		icon.innerHTML = '&#x21BB;'; // Rotating arrows

		let text = ' Syncing';
		if (synced !== undefined && total !== undefined && total > 0) {
			text += ` (${synced}/${total})`;
		} else {
			text += '...';
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
		this.statusBarEl.removeClass('idle', 'syncing');
		this.statusBarEl.addClass('error');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
		icon.innerHTML = '&#x26A0;'; // Warning

		this.statusBarEl.createSpan({
			text: ' SB Sync Error',
			cls: 'secondbrain-text',
		});

		if (message) {
			this.statusBarEl.setAttribute('aria-label', message);
		}
	}

	/**
	 * Set disconnected state (no API token configured).
	 */
	setDisconnected(): void {
		this.statusBarEl.empty();
		this.statusBarEl.removeClass('idle', 'syncing', 'error');
		this.statusBarEl.addClass('disconnected');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
		icon.innerHTML = '&#x25CB;'; // Empty circle

		this.statusBarEl.createSpan({
			text: ' SB Sync (Not configured)',
			cls: 'secondbrain-text',
		});
	}
}
