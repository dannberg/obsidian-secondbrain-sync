/**
 * Settings UI component for the plugin.
 */

import {
	App,
	PluginSettingTab,
	Setting,
	TextComponent,
	Notice,
	ButtonComponent,
} from 'obsidian';
import SecondBrainSyncPlugin from '../main';
import { ExclusionRules } from '../types';
import {
	parseFolderExclusions,
	parseTagExclusions,
	formatFolderExclusions,
	formatTagExclusions,
} from '../sync/exclusions';

export class SecondBrainSettingTab extends PluginSettingTab {
	plugin: SecondBrainSyncPlugin;

	constructor(app: App, plugin: SecondBrainSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Header
		containerEl.createEl('h1', { text: 'Second Brain Digest Sync' });

		// Connection section
		containerEl.createEl('h2', { text: 'Connection' });

		// API Token
		let tokenInput: TextComponent;
		new Setting(containerEl)
			.setName('API Token')
			.setDesc('Your API token from Second Brain Digest settings page')
			.addText(text => {
				tokenInput = text;
				text
					.setPlaceholder('Enter your API token')
					.setValue(this.plugin.settings.apiToken)
					.inputEl.type = 'password';
				text.onChange(async (value) => {
					this.plugin.settings.apiToken = value;
					await this.plugin.saveSettings();
				});
			})
			.addButton(btn => btn
				.setButtonText('Show')
				.onClick(() => {
					if (tokenInput.inputEl.type === 'password') {
						tokenInput.inputEl.type = 'text';
						btn.setButtonText('Hide');
					} else {
						tokenInput.inputEl.type = 'password';
						btn.setButtonText('Show');
					}
				}));

		// Test Connection button
		new Setting(containerEl)
			.setName('Test Connection')
			.setDesc('Verify your API token and server connection')
			.addButton(btn => btn
				.setButtonText('Test Connection')
				.onClick(async () => {
					btn.setDisabled(true);
					btn.setButtonText('Testing...');
					try {
						const result = await this.plugin.apiClient.testConnection();
						if (result.success) {
							new Notice('Connection successful!');
						} else {
							new Notice(`Connection failed: ${result.error}`);
						}
					} catch (error) {
						const message = error instanceof Error ? error.message : 'Unknown error';
						new Notice(`Connection failed: ${message}`);
					} finally {
						btn.setButtonText('Test Connection');
						btn.setDisabled(false);
					}
				}));

		// Sync section
		containerEl.createEl('h2', { text: 'Sync' });

		// Sync status
		const statusEl = containerEl.createEl('div', { cls: 'secondbrain-sync-status' });
		this.renderSyncStatus(statusEl);

		// Sync Now button
		new Setting(containerEl)
			.setName('Sync Now')
			.setDesc('Manually trigger a full vault sync')
			.addButton(btn => btn
				.setButtonText('Sync Now')
				.setCta()
				.onClick(async () => {
					if (!this.plugin.settings.apiToken) {
						new Notice('Please configure your API token first');
						return;
					}
					await this.plugin.syncer.fullSync();
					this.renderSyncStatus(statusEl);
				}));

		// Auto-sync toggle
		new Setting(containerEl)
			.setName('Auto-sync')
			.setDesc('Automatically sync changes when files are modified')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSync)
				.onChange(async (value) => {
					this.plugin.settings.autoSync = value;
					await this.plugin.saveSettings();
					this.plugin.updateAutoSync();
				}));

		// Scheduled sync toggle
		new Setting(containerEl)
			.setName('Pre-digest sync')
			.setDesc('Automatically sync before your scheduled digest time to ensure fresh data')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.scheduledSync)
				.onChange(async (value) => {
					this.plugin.settings.scheduledSync = value;
					await this.plugin.saveSettings();
				}));

		// Scheduled sync hours before
		new Setting(containerEl)
			.setName('Hours before digest')
			.setDesc('How many hours before your scheduled digest to trigger the sync')
			.addSlider(slider => slider
				.setLimits(1, 12, 1)
				.setValue(this.plugin.settings.scheduledSyncHoursBefore)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.scheduledSyncHoursBefore = value;
					await this.plugin.saveSettings();
				}));

		// Exclusions section
		containerEl.createEl('h2', { text: 'Exclusions' });

		// Folder exclusions
		const exclusions = this.plugin.tracker.getExclusions();
		let folderExclusionsText = formatFolderExclusions(exclusions.folders);
		let tagExclusionsText = formatTagExclusions(exclusions.tags);

		new Setting(containerEl)
			.setName('Excluded Folders')
			.setDesc('Folders to exclude from sync (one per line). Notes in these folders will not be synced.')
			.addTextArea(text => text
				.setPlaceholder('private/\ntemplates/')
				.setValue(folderExclusionsText)
				.onChange((value) => {
					folderExclusionsText = value;
				}));

		new Setting(containerEl)
			.setName('Excluded Tags')
			.setDesc('Tags to exclude from sync (one per line). Notes with these tags will not be synced.')
			.addTextArea(text => text
				.setPlaceholder('#private\n#draft')
				.setValue(tagExclusionsText)
				.onChange((value) => {
					tagExclusionsText = value;
				}));

		// Save exclusions button
		new Setting(containerEl)
			.setName('Save Exclusions')
			.setDesc('Save exclusion rules to server (matching notes will be removed)')
			.addButton(btn => btn
				.setButtonText('Save Exclusions')
				.onClick(async () => {
					if (!this.plugin.settings.apiToken) {
						new Notice('Please configure your API token first');
						return;
					}

					btn.setDisabled(true);
					btn.setButtonText('Saving...');

					try {
						const folders = parseFolderExclusions(folderExclusionsText);
						const tags = parseTagExclusions(tagExclusionsText);

						const response = await this.plugin.apiClient.updateExclusions({
							folders,
							tags,
						});

						// Update local exclusions
						const newRules: ExclusionRules = { folders, tags };
						this.plugin.exclusionChecker.updateRules(newRules);
						await this.plugin.tracker.updateExclusions(newRules);

						let message = 'Exclusions saved';
						if (response.deleted_count > 0) {
							message += ` (${response.deleted_count} notes removed)`;
						}
						new Notice(message);
					} catch (error) {
						const message = error instanceof Error ? error.message : 'Unknown error';
						new Notice(`Failed to save exclusions: ${message}`);
					} finally {
						btn.setButtonText('Save Exclusions');
						btn.setDisabled(false);
					}
				}));

		// Advanced section
		containerEl.createEl('h2', { text: 'Advanced' });

		// Debug mode
		new Setting(containerEl)
			.setName('Debug Mode')
			.setDesc('Enable verbose logging to the console')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debugMode)
				.onChange(async (value) => {
					this.plugin.settings.debugMode = value;
					await this.plugin.saveSettings();
					this.plugin.syncer.setDebugMode(value);
				}));

		// Reset sync state
		new Setting(containerEl)
			.setName('Reset Sync State')
			.setDesc('Clear local sync tracking. Next sync will be a full sync.')
			.addButton(btn => btn
				.setButtonText('Reset')
				.setWarning()
				.onClick(async () => {
					await this.plugin.tracker.reset();
					new Notice('Sync state reset. Run Sync Now to perform a full sync.');
					this.renderSyncStatus(statusEl);
				}));
	}

	private renderSyncStatus(containerEl: HTMLElement): void {
		containerEl.empty();

		const lastSync = this.plugin.tracker.getLastSyncTime();
		const trackedCount = this.plugin.tracker.getTrackedCount();

		// Add status container with health indicator
		const statusContainer = containerEl.createEl('div', { cls: 'secondbrain-sync-health' });

		// Health indicator
		const healthStatus = this.getSyncHealthStatus(lastSync);
		const healthEl = statusContainer.createEl('div', {
			cls: `secondbrain-health-indicator ${healthStatus.class}`,
		});
		healthEl.createEl('span', { text: healthStatus.icon, cls: 'health-icon' });
		healthEl.createEl('span', { text: healthStatus.label, cls: 'health-label' });

		const table = containerEl.createEl('table', { cls: 'secondbrain-status-table' });

		// Last sync row
		const lastSyncRow = table.createEl('tr');
		lastSyncRow.createEl('td', { text: 'Last sync:' });
		const lastSyncCell = lastSyncRow.createEl('td');
		if (lastSync) {
			const date = new Date(lastSync);
			lastSyncCell.textContent = date.toLocaleString();
			const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
			if (hoursAgo < 24) {
				lastSyncCell.createEl('span', {
					text: ` (${this.formatTimeAgo(hoursAgo)})`,
					cls: 'sync-time-ago',
				});
			}
		} else {
			lastSyncCell.textContent = 'Never';
		}

		// Tracked notes row
		const trackedRow = table.createEl('tr');
		trackedRow.createEl('td', { text: 'Tracked notes:' });
		trackedRow.createEl('td', { text: String(trackedCount) });

		// Next scheduled digest (if available)
		const schedule = this.plugin.scheduledSyncManager?.getCachedSchedule();
		if (schedule && schedule.is_enabled && schedule.next_digest_utc) {
			const digestRow = table.createEl('tr');
			digestRow.createEl('td', { text: 'Next digest:' });
			const nextDigest = new Date(schedule.next_digest_utc);
			digestRow.createEl('td', { text: nextDigest.toLocaleString() });
		}
	}

	private getSyncHealthStatus(lastSync: string | null): { icon: string; label: string; class: string } {
		if (!lastSync) {
			return { icon: '\u26A0', label: 'Not synced yet', class: 'health-warning' };
		}

		const hoursAgo = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);

		if (hoursAgo < 24) {
			return { icon: '\u2714', label: 'Healthy', class: 'health-good' };
		} else if (hoursAgo < 48) {
			return { icon: '\u26A0', label: 'Stale - sync recommended', class: 'health-warning' };
		} else {
			return { icon: '\u2757', label: 'Very stale - sync needed', class: 'health-critical' };
		}
	}

	private formatTimeAgo(hours: number): string {
		if (hours < 1) {
			const minutes = Math.round(hours * 60);
			return `${minutes}m ago`;
		}
		if (hours < 24) {
			return `${Math.round(hours)}h ago`;
		}
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
}
