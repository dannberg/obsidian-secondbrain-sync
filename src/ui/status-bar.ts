/**
 * Status bar indicator for sync state.
 */

import { Plugin, setIcon } from 'obsidian';
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
		this.statusBarEl.removeClass('syncing', 'error', 'disconnected');
		this.statusBarEl.addClass('idle');
		this.statusBarEl.removeAttribute('aria-label');

		const icon = this.statusBarEl.createSpan({ cls: 'secondbrain-icon' });
		setIcon(icon, 'check-circle');

		this.statusBarEl.createSpan({
			text: 'SB Synced',
			cls: 'secondbrain-text',
		});
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
