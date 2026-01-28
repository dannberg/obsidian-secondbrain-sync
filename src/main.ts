/**
 * Second Brain Digest Sync Plugin
 *
 * Syncs your Obsidian vault to Second Brain Digest for personalized daily
 * digest emails with AI-powered insights.
 */

import {
	Plugin,
	TFile,
} from 'obsidian';

import {
	PluginSettings,
	DEFAULT_SETTINGS,
	SyncState,
	SyncStatus,
} from './types';
import { ApiClient } from './api/client';
import { VaultScanner } from './sync/scanner';
import { SyncTracker } from './sync/tracker';
import { ExclusionChecker } from './sync/exclusions';
import { VaultSyncer } from './sync/syncer';
import { ScheduledSyncManager } from './sync/scheduled-sync';
import { SecondBrainSettingTab } from './settings/settings-tab';
import { validateSettings, isConfigured } from './settings/settings-data';
import { StatusBarManager } from './ui/status-bar';

/**
 * Data structure stored by plugin.saveData()
 */
interface PluginData {
	settings: PluginSettings;
	syncState: SyncState;
}

/**
 * Startup delay to wait for metadataCache to initialize (milliseconds)
 */
const STARTUP_DELAY = 3000;

export default class SecondBrainSyncPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;
	apiClient!: ApiClient;
	scanner!: VaultScanner;
	tracker!: SyncTracker;
	exclusionChecker!: ExclusionChecker;
	syncer!: VaultSyncer;
	scheduledSyncManager!: ScheduledSyncManager;
	statusBar!: StatusBarManager;

	private eventRefs: Array<ReturnType<typeof this.registerEvent>> = [];
	private loadedSyncState: SyncState | null = null;

	async onload(): Promise<void> {
		console.log('[SecondBrain] Loading plugin');

		// Load settings and sync state
		await this.loadPluginData();

		// Initialize components (uses loadedSyncState)
		this.initializeComponents();

		// Add settings tab
		this.addSettingTab(new SecondBrainSettingTab(this.app, this));

		// Add status bar
		this.statusBar = new StatusBarManager(this);
		this.updateStatusBar({ state: 'idle' });

		// Add commands
		this.addCommand({
			id: 'sync-now',
			name: 'Sync Now',
			callback: () => this.syncer.fullSync(),
		});

		this.addCommand({
			id: 'full-sync',
			name: 'Full Sync (re-sync all notes)',
			callback: async () => {
				await this.tracker.reset();
				await this.syncer.fullSync();
			},
		});

		// Setup auto-sync if enabled
		this.updateAutoSync();

		// Perform startup sync check after delay
		if (isConfigured(this.settings)) {
			setTimeout(() => this.performStartupCheck(), STARTUP_DELAY);
		}

		// Start scheduled sync manager after startup delay
		if (isConfigured(this.settings) && this.settings.scheduledSync) {
			setTimeout(() => this.scheduledSyncManager.start(), STARTUP_DELAY + 1000);
		}

		console.log('[SecondBrain] Plugin loaded');
	}

	onunload(): void {
		console.log('[SecondBrain] Unloading plugin');

		// Stop scheduled sync manager
		this.scheduledSyncManager?.stop();

		// Event refs are automatically cleaned up by Obsidian
		this.eventRefs = [];
	}

	/**
	 * Initialize all plugin components.
	 */
	private initializeComponents(): void {
		// API client
		this.apiClient = new ApiClient({
			apiToken: this.settings.apiToken,
			debugMode: this.settings.debugMode,
		});

		// Vault scanner
		this.scanner = new VaultScanner(this.app);

		// Sync tracker (use loaded state from storage)
		this.tracker = new SyncTracker(
			this.loadedSyncState,
			async (state) => {
				await this.saveSyncState(state);
			}
		);

		// Exclusion checker
		this.exclusionChecker = new ExclusionChecker(
			this.tracker.getExclusions()
		);

		// Vault syncer
		this.syncer = new VaultSyncer(
			this.app,
			this.apiClient,
			this.scanner,
			this.tracker,
			this.exclusionChecker,
			{
				onStatusChange: (status) => this.updateStatusBar(status),
				onDebug: (message) => {
					if (this.settings.debugMode) {
						console.log(`[SecondBrain] ${message}`);
					}
				},
			},
			this.settings.debugMode
		);

		// Scheduled sync manager
		this.scheduledSyncManager = new ScheduledSyncManager(
			this.apiClient,
			async () => this.syncer.fullSync(),
			this.settings,
			(message) => {
				if (this.settings.debugMode) {
					console.log(`[SecondBrain] ${message}`);
				}
			}
		);
	}

	/**
	 * Load plugin data from storage.
	 */
	private async loadPluginData(): Promise<void> {
		const data = await this.loadData();

		if (data) {
			// Load settings
			this.settings = validateSettings(data.settings);

			// Store sync state for initialization
			if (data.syncState) {
				this.loadedSyncState = data.syncState;
			}
		}
	}

	/**
	 * Save plugin settings.
	 */
	async saveSettings(): Promise<void> {
		await this.savePluginData();

		// Update API client config
		this.apiClient.updateConfig({
			apiToken: this.settings.apiToken,
			debugMode: this.settings.debugMode,
		});

		// Update syncer debug mode
		this.syncer.setDebugMode(this.settings.debugMode);

		// Update scheduled sync manager
		this.scheduledSyncManager.updateSettings(this.settings);
		if (this.settings.scheduledSync && isConfigured(this.settings)) {
			this.scheduledSyncManager.start();
		} else {
			this.scheduledSyncManager.stop();
		}

		// Update status bar
		if (!isConfigured(this.settings)) {
			this.statusBar.setDisconnected();
		}
	}

	/**
	 * Save sync state.
	 */
	private async saveSyncState(state: SyncState): Promise<void> {
		await this.savePluginData(state);
	}

	/**
	 * Save all plugin data.
	 */
	private async savePluginData(syncState?: SyncState): Promise<void> {
		const data: PluginData = {
			settings: this.settings,
			syncState: syncState || this.tracker.getState(),
		};
		await this.saveData(data);
	}

	/**
	 * Update auto-sync event handlers.
	 */
	updateAutoSync(): void {
		// Remove existing event handlers
		this.eventRefs.forEach(ref => {
			// Event refs are automatically cleaned up, but we track them
		});
		this.eventRefs = [];

		if (!this.settings.autoSync || !isConfigured(this.settings)) {
			return;
		}

		// Register file events for auto-sync
		this.eventRefs.push(
			this.registerEvent(
				this.app.vault.on('modify', (file) => {
					if (file instanceof TFile) {
						this.syncer.queueChange(file);
					}
				})
			)
		);

		this.eventRefs.push(
			this.registerEvent(
				this.app.vault.on('create', (file) => {
					if (file instanceof TFile) {
						this.syncer.queueChange(file);
					}
				})
			)
		);

		this.eventRefs.push(
			this.registerEvent(
				this.app.vault.on('delete', (file) => {
					this.syncer.queueDelete(file.path);
				})
			)
		);

		this.eventRefs.push(
			this.registerEvent(
				this.app.vault.on('rename', (file, oldPath) => {
					this.syncer.queueRename(oldPath, file.path);
				})
			)
		);

		if (this.settings.debugMode) {
			console.log('[SecondBrain] Auto-sync enabled');
		}
	}

	/**
	 * Update status bar based on sync status.
	 */
	private updateStatusBar(status: SyncStatus): void {
		if (!isConfigured(this.settings)) {
			this.statusBar.setDisconnected();
			return;
		}

		// Update last sync time for health indicator
		this.statusBar.setLastSyncTime(this.tracker.getLastSyncTime());
		this.statusBar.update(status);
	}

	/**
	 * Perform startup check (sync if there are pending changes).
	 */
	private async performStartupCheck(): Promise<void> {
		if (this.settings.debugMode) {
			console.log('[SecondBrain] Performing startup check');
		}

		try {
			// Refresh exclusions from server
			await this.syncer.refreshExclusions();

			// Check if we've never synced
			const lastSync = this.tracker.getLastSyncTime();
			if (!lastSync) {
				if (this.settings.debugMode) {
					console.log('[SecondBrain] No previous sync found, skipping startup sync');
				}
				return;
			}

			// Calculate diff to see if there are pending changes
			const files = this.scanner.getMarkdownFiles();
			const currentHashes: Record<string, string> = {};

			for (const file of files) {
				// Skip excluded files (by path only, for speed)
				if (this.exclusionChecker.matchesPath(file.path)) {
					continue;
				}
				const hash = await this.scanner.getFileHash(file);
				currentHashes[file.path] = hash;
			}

			const diff = this.tracker.calculateDiff(currentHashes);

			if (diff.changed.length > 0 || diff.deleted.length > 0) {
				if (this.settings.debugMode) {
					console.log(`[SecondBrain] Startup: ${diff.changed.length} changed, ${diff.deleted.length} deleted`);
				}

				// Queue changes for sync
				for (const path of diff.changed) {
					const file = this.app.vault.getAbstractFileByPath(path);
					if (file instanceof TFile) {
						this.syncer.queueChange(file);
					}
				}

				for (const path of diff.deleted) {
					this.syncer.queueDelete(path);
				}
			}
		} catch (error) {
			console.error('[SecondBrain] Startup check failed:', error);
		}
	}
}
