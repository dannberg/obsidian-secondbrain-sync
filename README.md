# Second Brain Digest Sync

An Obsidian plugin that syncs your vault to [Second Brain Digest](https://secondbraindigest.com) for personalized daily digest emails with AI-powered insights.

**[View Full Documentation](https://docs.secondbraindigest.com)**

## Features

- **Automatic Sync**: Changes are synced automatically when you modify, create, delete, or rename notes
- **Batch Processing**: Notes are synced in efficient batches to minimize API calls
- **Exclusion Rules**: Exclude specific folders or notes with certain tags from syncing
- **Offline Resilient**: Tracks local changes and syncs when connection is available
- **Status Bar**: Shows sync status at a glance

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Second Brain Digest Sync"
4. Click Install, then Enable

### Manual Installation

1. Download the latest release from GitHub
2. Extract to your vault's `.obsidian/plugins/secondbrain-sync/` folder
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## Setup

1. Create an account at [Second Brain Digest](https://app.secondbraindigest.com)
2. Go to your account settings and generate an API token
3. In Obsidian, open Settings > Second Brain Digest Sync
4. Enter your API token
5. Click "Test Connection" to verify
6. Click "Sync Now" to perform your first sync

## Configuration

### Server URL
By default, the plugin connects to `https://app.secondbraindigest.com`. Change this only if you're self-hosting.

### Auto-Sync
When enabled, changes are automatically synced after a 2-second debounce. Disable this if you prefer manual syncing only.

### Exclusions

**Excluded Folders**: Notes in these folders won't be synced.
- Enter one folder path per line
- Paths are relative to vault root
- Example: `private/` or `templates/`

**Excluded Tags**: Notes with these tags won't be synced.
- Enter one tag per line
- Include the `#` prefix
- Example: `#private` or `#draft`

## Commands

- **Sync Now**: Manually trigger an incremental sync
- **Full Sync**: Reset tracking and re-sync all notes

## Development

```bash
# Clone the repository
git clone https://github.com/dannberg/obsidian-secondbrain-sync.git
cd obsidian-secondbrain-sync

# Install dependencies
npm install

# Build for development (with hot reload)
npm run dev

# Build for production
npm run build
```

### Testing with Local Server

1. Start the Second Brain Digest Django server:
   ```bash
   cd ~/Code/secondbraindigest
   source venv/bin/activate
   python manage.py runserver 0.0.0.0:8000
   ```

2. In plugin settings, set Server URL to `http://localhost:8000`

3. Generate an API token from the web interface

## Architecture

```
src/
├── main.ts              # Plugin entry point
├── types.ts             # Shared type definitions
├── api/
│   ├── client.ts        # HTTP client with retry/rate limiting
│   └── types.ts         # API request/response types
├── sync/
│   ├── scanner.ts       # Vault file scanner
│   ├── hasher.ts        # SHA256 content hashing
│   ├── tracker.ts       # Local state persistence
│   ├── exclusions.ts    # Exclusion rule checker
│   └── syncer.ts        # Sync orchestration
├── settings/
│   ├── settings-tab.ts  # Settings UI component
│   └── settings-data.ts # Validation helpers
└── ui/
    ├── status-bar.ts    # Status bar indicator
    └── sync-progress-modal.ts
```

## API Endpoints

The plugin communicates with these server endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vault/status` | GET | Sync status, note counts |
| `/api/vault/sync` | POST | Batch upload notes |
| `/api/vault/exclusions` | GET/PUT | Manage exclusion rules |
| `/api/vault/delete` | POST | Delete notes by path |

## Documentation

Full documentation is available at [docs.secondbraindigest.com](https://docs.secondbraindigest.com).

To build the documentation locally:

```bash
pip install -r requirements-docs.txt
mkdocs serve
# Visit http://localhost:8000
```

## License

MIT License - see [LICENSE](LICENSE) for details.
