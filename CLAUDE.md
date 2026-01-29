# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Obsidian plugin for Second Brain Digest - a companion plugin that syncs vault data to the Second Brain Digest service for personalized daily digest emails with AI-powered insights.

## Architecture

**Plugin Structure:**
- `src/main.ts` - Plugin entry point, event handlers
- `src/api/client.ts` - HTTP client with retry/rate limiting (10 req/sec, exponential backoff)
- `src/sync/syncer.ts` - Sync orchestration (50 notes/batch, 2s debounce)
- `src/sync/scanner.ts` - Vault file scanner using Obsidian's metadataCache
- `src/sync/tracker.ts` - Local state persistence (hashes for change detection)
- `src/sync/exclusions.ts` - Folder/tag exclusion filtering
- `src/settings/settings-tab.ts` - Settings UI component

**Server Connection:**
The plugin connects to `secondbraindigest.com` by default (not configurable by users). For local development testing, you would need to temporarily modify `SERVER_URL` in `src/api/client.ts`.

## Development Workflow

This project uses a **feature branch workflow with pull requests**. Changes are developed and tested locally, then merged to `main` via PR.

### IMPORTANT: Use Pull Requests for Code Changes

- **NEVER push code changes directly to `main`** — all code must go through a pull request
- **ALWAYS create a feature branch** for code changes
- **ALWAYS test locally** before creating a PR
- **ALWAYS create a PR** and merge it to deploy changes

**Exception:** Updates to `CLAUDE.md` and `README.md` can be pushed directly to main.

### Workflow Steps

1. **Create a feature branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/my-feature-name
   ```

2. **Develop and test locally:**
   ```bash
   npm install
   npm run dev    # Development with hot reload
   # Test in Obsidian by reloading the plugin
   ```

3. **Commit and push changes:**
   ```bash
   git add <specific-files>
   git commit -m "Description of changes"
   git push -u origin feature/my-feature-name
   ```

4. **Create and merge PR:**
   ```bash
   gh pr create --title "Short description" --body "Details of changes"
   gh pr merge --merge --delete-branch
   ```

5. **Update local main:**
   ```bash
   git checkout main
   git pull origin main
   ```

## Release Process

**IMPORTANT:** Obsidian plugin releases must be distributed as a **zip file** containing the three release files, NOT as individual files or source code.

### Steps to Create a Release

1. **Ensure all changes are merged to main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Update version in three files:**
   - `manifest.json` - Update `version` field
   - `package.json` - Update `version` field
   - `versions.json` - Add new version entry mapping to minAppVersion

3. **Build the plugin:**
   ```bash
   npm run build
   ```
   This generates production-ready `main.js` file.

4. **Commit version bump:**
   ```bash
   git add manifest.json package.json versions.json
   git commit -m "Bump version to X.Y.Z"
   git push origin main
   ```

5. **Create and push tag:**
   ```bash
   git tag vX.Y.Z
   git push origin --tags
   ```

6. **Create release zip file:**
   ```bash
   zip -j secondbrain-sync-X.Y.Z.zip main.js manifest.json styles.css
   ```

7. **Create GitHub release:**
   ```bash
   gh release create vX.Y.Z \
     --title "vX.Y.Z - Release Title" \
     --notes "Release notes here" \
     secondbrain-sync-X.Y.Z.zip
   ```

### Release File Requirements

- **Always include:** `main.js`, `manifest.json`, `styles.css`
- **Package as:** Single zip file named `secondbrain-sync-X.Y.Z.zip`
- **Do NOT attach:** Individual files or source code archives

### Version Numbering

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR:** Breaking changes or major feature overhauls
- **MINOR:** New features, improvements (1.1.0 → 1.2.0)
- **PATCH:** Bug fixes, minor tweaks (1.2.0 → 1.2.1)

## Common Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Production build
npm run build

# The build outputs:
# - main.js (bundled plugin code)
# - manifest.json (copied from source)
# - styles.css (plugin styles)
```

## Testing

Test changes by:
1. Running `npm run dev` for development mode with hot reload
2. Opening Obsidian with the plugin installed
3. Making changes and reloading the plugin (Ctrl+R or Cmd+R)
4. Verifying functionality in Obsidian

## Documentation

User-facing documentation is in `docs/` directory and hosted at [docs.secondbraindigest.com](https://docs.secondbraindigest.com) via Cloudflare Pages.

To build docs locally:
```bash
pip install -r requirements-docs.txt
mkdocs serve
# Visit http://localhost:8000
```

## Related Repository

The main Django application is at `~/Code/secondbraindigest` - see that repository's CLAUDE.md for backend documentation.
