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

1. **Sign up** at [Second Brain Digest](https://secondbraindigest.com)
2. **Complete the onboarding flow** - you'll receive your API token during setup
3. **In Obsidian**, open Settings > Second Brain Digest Sync
4. **Paste your API token** from the onboarding page
5. **Sync starts automatically** - your vault will begin syncing in the background

The onboarding flow will guide you through vault setup, exclusion rules, and billing. Your vault syncs automatically once the token is configured - no manual "Sync Now" needed!

## Configuration

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

For local development, you'll need to temporarily modify the `SERVER_URL` constant in `src/api/client.ts` to point to your local server:

```typescript
const SERVER_URL = 'http://localhost:8000';
```

Then:

1. Start the Second Brain Digest Django server:
   ```bash
   cd ~/Code/secondbraindigest
   source venv/bin/activate
   python manage.py runserver 0.0.0.0:8000
   ```

2. Generate an API token from the local web interface

3. Rebuild the plugin with your changes:
   ```bash
   npm run dev
   ```

**Important:** Remember to revert the SERVER_URL change before committing!

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
