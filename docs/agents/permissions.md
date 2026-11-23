# Permissions

Each MCP token carries the permissions you pick when you create it, and your agent only sees the tools its token allows. You can't change a token's permissions later, so if you need different ones, revoke the token and create a new one (see [Create a token](setup.md#create-a-token)).

## The six permissions { #the-six-permissions }

| Permission | Scope | What your agent can do | Tools |
| --- | --- | --- | --- |
| **Read your digests** | `digest:read` | List your past digests and read any one in full. | [`list_digests`](tools.md#list-digests), [`get_digest`](tools.md#get-digest) |
| **Search your notes** | `search:read` | Find passages in your synced notes that match what you describe. | [`search_notes`](tools.md#search-notes) |
| **Ask questions about your vault** | `search:rag` | Get a written answer with the notes it came from. This uses AI and is limited to 20 calls an hour. | [`ask_vault`](tools.md#ask-vault) |
| **Read your digest settings** | `settings:read` | See your digest preferences (such as schedule, frequency, timezone, modules and AI provider) and whether an AI provider key is saved, as true or false, never the key itself. | [`get_settings`](tools.md#get-settings) |
| **Change your digest settings** | `settings:write` | Change the delivery time and day, how often digests arrive (daily, weekly or monthly), your timezone and which modules are included. | [`update_settings`](tools.md#update-settings) |
| **Send a digest now** | `digest:trigger` | Generate a digest right away, saved to your history and emailed if email delivery is on. At most once every 15 minutes and 20 calls an hour. | [`trigger_digest`](tools.md#trigger-digest) |

**Change your digest settings** and **Send a digest now** are the two permissions that change things. The token list on the MCP page highlights them.

## What settings changes are off limits { #settings-limits }

An agent with **Change your digest settings** can't do any of these:

- Turn digests off, or pause or resume the schedule.
- Change anything about email addresses, billing or AI provider keys.
- Switch your AI provider, or move you to Managed AI while a key is saved.
- Create a delivery schedule that doesn't exist yet. Set one up on the dashboard first.

Delivery times are in your saved timezone. Those changes stay with you on the website.

## Presets { #presets }

The **Quick select** buttons on the MCP page only tick boxes, and nothing is selected by default.

- **Read-only** ticks **Read your digests**, **Read your digest settings**, **Search your notes** and **Ask questions about your vault** (`digest:read`, `settings:read`, `search:read`, `search:rag`). It unlocks five tools: `list_digests`, `get_digest`, `get_settings`, `search_notes` and `ask_vault`.
- **Full access** ticks all six permissions and unlocks all seven tools.

The hint on the page reads: `Read-only: read your digests and settings, search your notes and ask questions. Full access: all six permissions, including changing settings and sending a digest.`

!!! warning "Read-only still shares your notes"
    Read-only access still returns note passages and full digests to your agent, and from there to the AI provider behind it. Notes you exclude in the plugin are never synced, so no permission reaches them.

## Choosing permissions { #choosing }

Pick only what you need. To change a token later, revoke it and create a new one (see [Token lifetime](limits.md#token-lifetime)). See [Tools](tools.md) for an example request for each tool.
