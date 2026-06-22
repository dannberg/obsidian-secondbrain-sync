# Frequently Asked Questions

## Getting Started

### How do I sign up?

Visit secondbraindigest.com and enter your email address. You'll receive a magic link to complete signup - no password required.

### Do I need to pay to use Second Brain Digest?

Check our pricing page for current plans and any free tier availability.

### Which Obsidian vaults are supported?

Any Obsidian vault can be synced. The vault must be accessible from your device when running the Obsidian plugin.

## Vault Sync

### Is my data secure?

Yes. All data is transmitted over HTTPS encryption. Your notes are stored securely and are only accessible by your account.

### What data gets synced?

The plugin syncs:

- Note content (markdown text)
- Note metadata (titles, tags, links)
- Folder structure
- Frontmatter fields

The plugin does NOT sync:

- Attachments (images, PDFs)
- Obsidian settings or plugins
- Local-only files you've excluded

### Can I exclude sensitive notes?

Yes. You can exclude:

- Entire folders (e.g., `Private/`, `Work/Confidential/`)
- Notes with specific tags (e.g., `#private`, `#sensitive`)

Excluded content is never transmitted to our servers.

### How often does sync happen?

The plugin syncs automatically when you make changes to your vault. You can also trigger a manual sync from Obsidian.

### How do I delete my synced data?

Go to your **Account** page and use **Reset Synced Vault**. This permanently removes all synced notes from our servers. Your local Obsidian vault is not affected, and your account, settings, and API key are kept.

### Can I sync the same vault from more than one computer?

Yes. Second Brain Digest identifies your vault by its **content**, not by the folder name, so the same vault syncs together across machines even if you named the vault folder differently on each computer. No extra setup is needed.

### I'm seeing a "Vault mismatch" message — what does it mean?

This means the notes being synced don't match the vault already on your account, so we treat it as a **different** vault and pause syncing to protect your data. If you intend to switch to a different vault, open your **Account** page, use **Reset Synced Vault**, then sync again. (You should not see this when syncing the same vault from multiple computers — that case is handled automatically.)

## Digests

### When do I receive my digest?

If you've enabled scheduling, digests arrive at your configured time. You can also generate a digest on-demand from your dashboard.

### Can I customize what's in my digest?

Yes. You can:

- Enable or disable individual modules
- Reorder modules
- Some modules have additional configuration options

### Why is my digest empty or missing sections?

Possible reasons:

- **No recent activity** - If you haven't edited notes, some modules may have nothing to show
- **New vault** - Some modules need historical data to provide insights
- **Exclusions** - Heavily excluded vaults may have limited content

### Can I get digests more than once a day?

Currently, scheduling supports one automated digest per day. You can generate additional on-demand digests from your dashboard.

## Modules

### What if I don't want AI analysis?

You can use rule-based analysis instead. Go to **Settings > AI** and select the rule-based option. Analysis will use pattern matching instead of AI.

### Why does the same note keep appearing?

The Random Note module tracks shown notes for 60 days to prevent repeats. If you're seeing repeats:

- Your vault may have few eligible notes
- Check your exclusion settings
- Wait for the 60-day window to pass

### The connections shown don't seem relevant

Connection quality depends on:

- How well your notes are tagged and linked
- Whether AI is enabled (semantic analysis improves results)
- The overall structure of your vault

Try improving your tagging consistency or enabling AI for better results.

## Technical Issues

### The plugin won't connect

1. Verify your API token is correct
2. Check your internet connection
3. Ensure the plugin is enabled in Obsidian
4. Try generating a new API token

### Sync is taking too long

Large vaults (thousands of notes) take longer to sync initially. Subsequent syncs are incremental and faster.

### I'm not receiving emails

1. Check your spam/junk folder
2. Add our email address to your contacts
3. Verify your email address in settings
4. Check that scheduling is enabled

### The digest shows wrong times

Verify your timezone setting in **Settings > General**. All times are displayed in your configured timezone.

## Account

### How do I change my email address?

Go to **Settings > General** and update your email. You'll need to verify the new address.

### How do I delete my account?

Go to **Settings > Account > Delete Account**. This permanently removes your account and all associated data.

### Can I export my data?

Contact us at support@secondbraindigest.com for data export requests.

## Still Have Questions?

Contact us at support@secondbraindigest.com or open an issue on GitHub.
