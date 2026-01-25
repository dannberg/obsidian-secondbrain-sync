/**
 * Progress modal for large sync operations.
 */

import { App, Modal } from 'obsidian';

/**
 * Modal showing sync progress for large operations.
 */
export class SyncProgressModal extends Modal {
	private progressEl: HTMLElement | null = null;
	private statusEl: HTMLElement | null = null;
	private progressBarEl: HTMLElement | null = null;

	private total: number = 0;
	private current: number = 0;

	constructor(app: App) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('secondbrain-progress-modal');

		// Title
		contentEl.createEl('h2', { text: 'Syncing Vault' });

		// Progress container
		const progressContainer = contentEl.createDiv({ cls: 'progress-container' });

		// Progress bar background
		const progressBarBg = progressContainer.createDiv({ cls: 'progress-bar-bg' });
		this.progressBarEl = progressBarBg.createDiv({ cls: 'progress-bar-fill' });

		// Progress text
		this.progressEl = contentEl.createEl('p', {
			cls: 'progress-text',
			text: 'Preparing...',
		});

		// Status text
		this.statusEl = contentEl.createEl('p', {
			cls: 'status-text',
			text: '',
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Set the total number of items.
	 */
	setTotal(total: number): void {
		this.total = total;
		this.updateProgress();
	}

	/**
	 * Set the current progress.
	 */
	setCurrent(current: number): void {
		this.current = current;
		this.updateProgress();
	}

	/**
	 * Set status message.
	 */
	setStatus(message: string): void {
		if (this.statusEl) {
			this.statusEl.setText(message);
		}
	}

	/**
	 * Update progress display.
	 */
	private updateProgress(): void {
		if (this.progressEl) {
			if (this.total > 0) {
				const percent = Math.round((this.current / this.total) * 100);
				this.progressEl.setText(`${this.current} / ${this.total} notes (${percent}%)`);
			} else {
				this.progressEl.setText('Preparing...');
			}
		}

		if (this.progressBarEl && this.total > 0) {
			const percent = (this.current / this.total) * 100;
			this.progressBarEl.style.width = `${percent}%`;
		}
	}
}

/**
 * Threshold for showing progress modal (only for syncs with more than this many notes).
 */
export const PROGRESS_MODAL_THRESHOLD = 50;
