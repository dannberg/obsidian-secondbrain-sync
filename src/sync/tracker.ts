/**
 * Local state persistence for tracking synced notes.
 */

import { SyncState, DEFAULT_SYNC_STATE, SyncDiff, ExclusionRules } from '../types';

/**
 * Manages local sync state persistence.
 */
export class SyncTracker {
	private state: SyncState;
	private saveCallback: (state: SyncState) => Promise<void>;

	constructor(
		initialState: SyncState | null,
		saveCallback: (state: SyncState) => Promise<void>
	) {
		this.state = initialState || { ...DEFAULT_SYNC_STATE };
		this.saveCallback = saveCallback;
	}

	/**
	 * Get the current sync state.
	 */
	getState(): SyncState {
		return this.state;
	}

	/**
	 * Get the hash for a specific note path.
	 */
	getHash(path: string): string | null {
		return this.state.noteHashes[path] || null;
	}

	/**
	 * Check if a note has been synced.
	 */
	isSynced(path: string): boolean {
		return path in this.state.noteHashes;
	}

	/**
	 * Check if a note's content has changed.
	 */
	hasChanged(path: string, newHash: string): boolean {
		const existingHash = this.state.noteHashes[path];
		return existingHash !== newHash;
	}

	/**
	 * Calculate diff between current vault state and tracked state.
	 */
	calculateDiff(currentHashes: Record<string, string>): SyncDiff {
		const changed: string[] = [];
		const deleted: string[] = [];

		// Find changed and new notes
		for (const [path, hash] of Object.entries(currentHashes)) {
			if (this.hasChanged(path, hash)) {
				changed.push(path);
			}
		}

		// Find deleted notes
		for (const path of Object.keys(this.state.noteHashes)) {
			if (!(path in currentHashes)) {
				deleted.push(path);
			}
		}

		return { changed, deleted };
	}

	/**
	 * Update hash for a single note.
	 */
	async updateHash(path: string, hash: string): Promise<void> {
		this.state.noteHashes[path] = hash;
		await this.save();
	}

	/**
	 * Update hashes for multiple notes.
	 */
	async updateHashes(hashes: Record<string, string>): Promise<void> {
		this.state.noteHashes = {
			...this.state.noteHashes,
			...hashes,
		};
		await this.save();
	}

	/**
	 * Remove a note from tracked state.
	 */
	async removeHash(path: string): Promise<void> {
		delete this.state.noteHashes[path];
		await this.save();
	}

	/**
	 * Remove multiple notes from tracked state.
	 */
	async removeHashes(paths: string[]): Promise<void> {
		for (const path of paths) {
			delete this.state.noteHashes[path];
		}
		await this.save();
	}

	/**
	 * Rename a note path in tracked state.
	 */
	async renamePath(oldPath: string, newPath: string): Promise<void> {
		if (oldPath in this.state.noteHashes) {
			this.state.noteHashes[newPath] = this.state.noteHashes[oldPath];
			delete this.state.noteHashes[oldPath];
			await this.save();
		}
	}

	/**
	 * Update last sync time.
	 */
	async updateLastSyncTime(): Promise<void> {
		this.state.lastSyncTime = new Date().toISOString();
		await this.save();
	}

	/**
	 * Get last sync time.
	 */
	getLastSyncTime(): string | null {
		return this.state.lastSyncTime;
	}

	/**
	 * Update cached server exclusions.
	 */
	async updateExclusions(exclusions: ExclusionRules): Promise<void> {
		this.state.serverExclusions = exclusions;
		await this.save();
	}

	/**
	 * Get cached server exclusions.
	 */
	getExclusions(): ExclusionRules {
		return this.state.serverExclusions;
	}

	/**
	 * Clear all tracked state.
	 */
	async reset(): Promise<void> {
		this.state = { ...DEFAULT_SYNC_STATE };
		await this.save();
	}

	/**
	 * Get count of tracked notes.
	 */
	getTrackedCount(): number {
		return Object.keys(this.state.noteHashes).length;
	}

	/**
	 * Persist state to storage.
	 */
	private async save(): Promise<void> {
		await this.saveCallback(this.state);
	}
}
