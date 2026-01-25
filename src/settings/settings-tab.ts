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

		// Server URL
		new Setting(containerEl)
			.setName('Server URL')
			.setDesc('The URL of your Second Brain Digest server')
			.addText(text => text
				.setPlaceholder('https://app.secondbraindigest.com')
				.setValue(this.plugin.settings.serverUrl)
				.onChange(async (value) => {
					this.plugin.settings.serverUrl = value || 'https://app.secondbraindigest.com';
					await this.plugin.saveSettings();
				}));

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

		const table = containerEl.createEl('table', { cls: 'secondbrain-status-table' });

		// Last sync row
		const lastSyncRow = table.createEl('tr');
		lastSyncRow.createEl('td', { text: 'Last sync:' });
		lastSyncRow.createEl('td', {
			text: lastSync ? new Date(lastSync).toLocaleString() : 'Never',
		});

		// Tracked notes row
		const trackedRow = table.createEl('tr');
		trackedRow.createEl('td', { text: 'Tracked notes:' });
		trackedRow.createEl('td', { text: String(trackedCount) });
	}
}
