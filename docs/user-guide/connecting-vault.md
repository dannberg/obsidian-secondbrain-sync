# Connecting Your Vault

The Second Brain Digest Obsidian plugin securely syncs your vault data so you can receive personalized digests. This guide covers installation, configuration, and troubleshooting.

## Installing the Plugin

### From Community Plugins

1. Open Obsidian
2. Go to **Settings > Community plugins**
3. If prompted, disable **Restricted mode**
4. Click **Browse**
5. Search for "Second Brain Digest"
6. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from GitHub
2. Extract the files to your vault's `.obsidian/plugins/second-brain-digest/` folder
3. Restart Obsidian
4. Enable the plugin in **Settings > Community plugins**

## Configuring the Plugin

### Getting Your API Token

1. Log in to your Second Brain Digest account
2. Go to **Settings > API Tokens**
3. Click **Generate New Token**
4. Copy the token (you won't be able to see it again)

### Plugin Settings

1. In Obsidian, go to **Settings > Second Brain Digest**
2. Paste your API token in the **API Token** field
3. Click **Verify Connection** to test

## Managing What Gets Synced

### Excluding Folders

Some folders may contain sensitive information you don't want synced:

1. In the plugin settings, find **Excluded Folders**
2. Add folder paths to exclude (e.g., `Private/`, `Work/Confidential/`)
3. Notes in these folders won't be synced or analyzed

### Excluding Tags

You can also exclude notes with specific tags:

1. Find **Excluded Tags** in plugin settings
2. Add tags to exclude (e.g., `#private`, `#sensitive`)
3. Any note containing these tags will be skipped

### Managing Exclusions Online

You can also manage exclusions from your Second Brain Digest dashboard:

1. Go to **Settings > Vault Sync**
2. View and edit your exclusion rules
3. Changes sync to the plugin automatically

## Syncing Your Vault

### Initial Sync

When you first connect, the plugin will:

1. Scan your vault for all eligible notes
2. Upload note metadata and content
3. This may take a few minutes for large vaults

### Ongoing Sync

After initial sync:

- Changes are detected automatically
- New and modified notes sync in the background
- Deleted notes are removed from the service

### Manual Sync

To force a sync:

1. Open the command palette (Cmd/Ctrl + P)
2. Search for "Second Brain Digest: Sync Now"
3. Run the command

## Troubleshooting

### Connection Failed

- Verify your API token is correct
- Check your internet connection
- Ensure you haven't exceeded your account's note limit

### Sync Not Working

- Check that the plugin is enabled
- Look for errors in the Obsidian console (Cmd/Ctrl + Shift + I)
- Try disabling and re-enabling the plugin

### Large Vault Issues

For vaults with thousands of notes:

- Initial sync may take several minutes
- Consider excluding folders you don't need analyzed
- The plugin syncs in batches to avoid performance issues

## Privacy & Security

- All data is transmitted over HTTPS
- Your API token is stored locally in Obsidian
- You can delete all synced data from your account settings
- Excluded folders and tags are never transmitted
