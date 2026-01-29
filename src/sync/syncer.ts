/**
 * Sync orchestration with batching and debouncing.
 */

import { App, TFile, Notice, debounce } from 'obsidian';
import { ApiClient } from '../api/client';
import { NotePayload } from '../api/types';
import { NoteMetadata, SyncStatus, ExclusionRules } from '../types';
import { VaultScanner } from './scanner';
import { SyncTracker } from './tracker';
import { ExclusionChecker } from './exclusions';
import { SyncProgressModal, PROGRESS_MODAL_THRESHOLD } from '../ui/sync-progress-modal';

/**
 * Batch size for sync requests (server allows 100, we use 50 for safety)
 */
const BATCH_SIZE = 50;

/**
 * Debounce delay for real-time sync (milliseconds)
 */
const DEBOUNCE_DELAY = 2000;

/**
 * Callback types for sync events
 */
export interface SyncCallbacks {
	onStatusChange: (status: SyncStatus) => void;
	onDebug?: (message: string) => void;
}

/**
 * Orchestrates vault syncing with the server.
 */
export class VaultSyncer {
	private app: App;
	private apiClient: ApiClient;
	private scanner: VaultScanner;
	private tracker: SyncTracker;
	private exclusionChecker: ExclusionChecker;
	private callbacks: SyncCallbacks;
	private debugMode: boolean;

	private isSyncing: boolean = false;
	private pendingChanges: Set<string> = new Set();
	private pendingDeletes: Set<string> = new Set();
	private debouncedSync: () => void;

	constructor(
		app: App,
		apiClient: ApiClient,
		scanner: VaultScanner,
		tracker: SyncTracker,
		exclusionChecker: ExclusionChecker,
		callbacks: SyncCallbacks,
		debugMode: boolean = false
	) {
		this.app = app;
		this.apiClient = apiClient;
		this.scanner = scanner;
		this.tracker = tracker;
		this.exclusionChecker = exclusionChecker;
		this.callbacks = callbacks;
		this.debugMode = debugMode;

		// Create debounced sync function
		this.debouncedSync = debounce(
			() => this.processPendingChanges(),
			DEBOUNCE_DELAY,
			true
		);
	}

	/**
	 * Set debug mode.
	 */
	setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
	}

	/**
	 * Update exclusion rules.
	 */
	updateExclusions(rules: ExclusionRules): void {
		this.exclusionChecker.updateRules(rules);
	}

	/**
	 * Check if a sync is currently in progress.
	 */
	isSyncInProgress(): boolean {
		return this.isSyncing;
	}

	/**
	 * Queue a file change for sync.
	 */
	queueChange(file: TFile): void {
		// Skip non-markdown files
		if (!file.path.endsWith('.md')) return;

		// Skip excluded files
		const cache = this.app.metadataCache.getFileCache(file);
		const tags = this.extractTagsFromCache(cache);
		if (this.exclusionChecker.shouldExclude(file, tags)) {
			this.debug(`Skipping excluded file: ${file.path}`);
			return;
		}

		this.pendingChanges.add(file.path);
		this.pendingDeletes.delete(file.path); // In case it was queued for deletion
		this.debouncedSync();
	}

	/**
	 * Queue a file deletion for sync.
	 */
	queueDelete(path: string): void {
		// Skip non-markdown files
		if (!path.endsWith('.md')) return;

		this.pendingDeletes.add(path);
		this.pendingChanges.delete(path);
		this.debouncedSync();
	}

	/**
	 * Queue a file rename for sync.
	 */
	queueRename(oldPath: string, newPath: string): void {
		// Skip non-markdown files
		if (!oldPath.endsWith('.md') || !newPath.endsWith('.md')) return;

		// Handle as delete old + create new
		this.pendingDeletes.add(oldPath);
		this.pendingChanges.delete(oldPath);

		// Get the new file and queue if not excluded
		const newFile = this.app.vault.getAbstractFileByPath(newPath);
		if (newFile instanceof TFile) {
			this.queueChange(newFile);
		}

		this.debouncedSync();
	}

	/**
	 * Process pending changes (called after debounce).
	 */
	private async processPendingChanges(): Promise<void> {
		if (this.isSyncing) {
			this.debug('Sync already in progress, skipping');
			return;
		}

		const changes = Array.from(this.pendingChanges);
		const deletes = Array.from(this.pendingDeletes);
		this.pendingChanges.clear();
		this.pendingDeletes.clear();

		if (changes.length === 0 && deletes.length === 0) {
			return;
		}

		await this.syncChanges(changes, deletes);
	}

	/**
	 * Perform a full sync of the entire vault.
	 */
	async fullSync(): Promise<void> {
		if (this.isSyncing) {
			new Notice('Sync already in progress');
			return;
		}

		this.debug('Starting full sync');
		this.isSyncing = true;

		// Show initial notice
		new Notice('Starting vault sync...');
		this.updateStatus({ state: 'syncing', pendingCount: 0, syncedCount: 0 });

		let progressModal: SyncProgressModal | null = null;

		try {
			// Get all markdown files
			const allFiles = this.scanner.getMarkdownFiles();
			this.debug(`Found ${allFiles.length} markdown files`);

			// Filter excluded files
			const filesToSync = this.exclusionChecker.filterFiles(
				allFiles,
				(file) => this.getTagsForFile(file)
			);
			this.debug(`${filesToSync.length} files after exclusions`);

			// Show progress modal for large syncs
			if (filesToSync.length > PROGRESS_MODAL_THRESHOLD) {
				progressModal = new SyncProgressModal(this.app);
				progressModal.open();
				progressModal.setTotal(filesToSync.length);
				progressModal.setStatus('Scanning files...');
			}

			// Scan all files
			const notes = await this.scanner.scanFiles(filesToSync);

			// Filter notes by exclusions (double check after scanning for tag exclusions)
			const filteredNotes = this.exclusionChecker.filterNotes(notes);
			this.debug(`${filteredNotes.length} notes after tag exclusions`);

			if (progressModal) {
				progressModal.setTotal(filteredNotes.length);
				progressModal.setStatus('Uploading notes...');
			}

			// Sync in batches
			await this.syncNotesBatched(filteredNotes, true, progressModal);

			// Find notes that were deleted from vault
			const currentPaths = new Set(filteredNotes.map(n => n.path));
			const deletedPaths = Object.keys(this.tracker.getState().noteHashes)
				.filter(path => !currentPaths.has(path));

			if (deletedPaths.length > 0) {
				if (progressModal) {
					progressModal.setStatus(`Removing ${deletedPaths.length} deleted notes...`);
				}
				await this.deleteNotes(deletedPaths);
			}

			// Update last sync time
			await this.tracker.updateLastSyncTime();

			this.updateStatus({ state: 'idle' });

			// Close modal and show success
			if (progressModal) {
				progressModal.close();
			}
			new Notice(`Sync complete: ${filteredNotes.length} notes synced`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			this.updateStatus({ state: 'error', error: message });

			// Close modal and show error
			if (progressModal) {
				progressModal.close();
			}
			new Notice(`Sync failed: ${message}`, 5000);
			console.error('[SecondBrain] Full sync failed:', error);
		} finally {
			this.isSyncing = false;
		}
	}

	/**
	 * Sync specific file changes.
	 */
	private async syncChanges(changedPaths: string[], deletedPaths: string[]): Promise<void> {
		if (changedPaths.length === 0 && deletedPaths.length === 0) {
			return;
		}

		const totalChanges = changedPaths.length + deletedPaths.length;
		this.debug(`Syncing changes: ${changedPaths.length} changed, ${deletedPaths.length} deleted`);
		this.isSyncing = true;
		this.updateStatus({
			state: 'syncing',
			pendingCount: totalChanges,
			syncedCount: 0,
		});

		try {
			// Process changed files
			if (changedPaths.length > 0) {
				const notes: NoteMetadata[] = [];

				for (const path of changedPaths) {
					const file = this.app.vault.getAbstractFileByPath(path);
					if (file instanceof TFile) {
						try {
							const note = await this.scanner.scanFile(file);
							// Double check exclusions after scanning (tags may have changed)
							if (!this.exclusionChecker.shouldExcludeNote(note)) {
								notes.push(note);
							} else {
								this.debug(`Skipping excluded note: ${path}`);
							}
						} catch (error) {
							console.error(`[SecondBrain] Failed to scan ${path}:`, error);
						}
					}
				}

				if (notes.length > 0) {
					await this.syncNotesBatched(notes, false);
				}
			}

			// Process deleted files
			if (deletedPaths.length > 0) {
				await this.deleteNotes(deletedPaths);
			}

			// Update last sync time
			await this.tracker.updateLastSyncTime();

			this.updateStatus({ state: 'idle' });

			// Show completion notice for incremental syncs
			if (totalChanges > 1) {
				new Notice(`Synced ${totalChanges} changes`);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			this.updateStatus({ state: 'error', error: message });
			new Notice(`Sync failed: ${message}`, 5000);
			console.error('[SecondBrain] Sync changes failed:', error);
		} finally {
			this.isSyncing = false;
		}
	}

	/**
	 * Sync notes in batches.
	 */
	private async syncNotesBatched(
		notes: NoteMetadata[],
		isFullSync: boolean,
		progressModal?: SyncProgressModal | null
	): Promise<void> {
		const totalNotes = notes.length;
		let syncedCount = 0;
		const totalBatches = Math.ceil(notes.length / BATCH_SIZE);

		for (let i = 0; i < notes.length; i += BATCH_SIZE) {
			const batch = notes.slice(i, i + BATCH_SIZE);
			const isLastBatch = i + BATCH_SIZE >= notes.length;
			const batchNum = Math.floor(i / BATCH_SIZE) + 1;

			this.debug(`Syncing batch ${batchNum}/${totalBatches}, ${batch.length} notes`);

			const payloads: NotePayload[] = batch.map(note => ({
				path: note.path,
				content: note.content,
				content_hash: note.contentHash,
				title: note.title,
				tags: note.tags,
				headings: note.headings,
				links: note.links,
				frontmatter: note.frontmatter,
				word_count: note.wordCount,
				created_time: note.createdTime,
				modified_time: note.modifiedTime,
			}));

			const response = await this.apiClient.syncNotes({
				batch_id: this.generateBatchId(),
				notes: payloads,
				is_final_batch: isLastBatch,
				vault_name: this.app.vault.getName(),
			});

			// Update tracker with synced hashes
			const hashUpdates: Record<string, string> = {};
			for (const note of batch) {
				// Only mark as synced if no error for this note
				const hasError = response.errors.some(e => e.path === note.path);
				if (!hasError) {
					hashUpdates[note.path] = note.contentHash;
				}
			}
			await this.tracker.updateHashes(hashUpdates);

			syncedCount += batch.length;
			this.updateStatus({
				state: 'syncing',
				pendingCount: totalNotes,
				syncedCount,
			});

			// Update progress modal if present
			if (progressModal) {
				progressModal.setCurrent(syncedCount);
				progressModal.setStatus(`Uploading batch ${batchNum}/${totalBatches}...`);
			}

			// Log any errors
			for (const error of response.errors) {
				console.error(`[SecondBrain] Error syncing ${error.path}: ${error.error}`);
			}
		}
	}

	/**
	 * Delete notes from server.
	 */
	private async deleteNotes(paths: string[]): Promise<void> {
		if (paths.length === 0) return;

		this.debug(`Deleting ${paths.length} notes from server`);

		try {
			await this.apiClient.deleteNotes({ paths });
			await this.tracker.removeHashes(paths);
		} catch (error) {
			console.error('[SecondBrain] Failed to delete notes:', error);
			throw error;
		}
	}

	/**
	 * Fetch and update exclusion rules from server.
	 */
	async refreshExclusions(): Promise<ExclusionRules> {
		const response = await this.apiClient.getExclusions();
		const rules: ExclusionRules = {
			folders: response.folders,
			tags: response.tags,
		};
		this.exclusionChecker.updateRules(rules);
		await this.tracker.updateExclusions(rules);
		return rules;
	}

	/**
	 * Get tags for a file from metadata cache.
	 */
	private getTagsForFile(file: TFile): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		return this.extractTagsFromCache(cache);
	}

	/**
	 * Extract tags from cached metadata.
	 */
	private extractTagsFromCache(cache: ReturnType<typeof this.app.metadataCache.getFileCache>): string[] {
		const tags: string[] = [];

		if (cache?.frontmatter?.tags) {
			const fmTags = cache.frontmatter.tags;
			if (Array.isArray(fmTags)) {
				tags.push(...fmTags.map(t => this.normalizeTag(String(t))));
			} else if (typeof fmTags === 'string') {
				tags.push(...fmTags.split(',').map(t => this.normalizeTag(t.trim())));
			}
		}

		if (cache?.tags) {
			tags.push(...cache.tags.map(t => this.normalizeTag(t.tag)));
		}

		return tags.filter(t => t.length > 0);
	}

	/**
	 * Normalize tag to have # prefix.
	 */
	private normalizeTag(tag: string): string {
		tag = tag.trim();
		if (!tag) return '';
		return tag.startsWith('#') ? tag : '#' + tag;
	}

	/**
	 * Generate a unique batch ID.
	 */
	private generateBatchId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	/**
	 * Update sync status and notify callbacks.
	 */
	private updateStatus(status: SyncStatus): void {
		this.callbacks.onStatusChange(status);
	}

	/**
	 * Log debug message if debug mode is enabled.
	 */
	private debug(message: string): void {
		if (this.debugMode) {
			console.log(`[SecondBrain] ${message}`);
			this.callbacks.onDebug?.(message);
		}
	}
}
