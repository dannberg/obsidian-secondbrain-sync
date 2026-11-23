# Tools

There are seven tools. You ask in plain language and your agent picks the tool. Your agent only sees the tools its token's permissions allow (see [Permissions](permissions.md)).

For exact arguments and time limits, see the agent reference at [https://secondbraindigest.com/mcp/docs](https://secondbraindigest.com/mcp/docs). It is a Markdown reference written for AI agents, and your browser may download it instead of showing it.

### `list_digests` { #list-digests }

Lists your recent digests with id, date and modules, newest first, up to 30 (default 10), optionally since a date.

- **Needs:** **Read your digests** (`digest:read`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "List my Second Brain Digest emails from the last two weeks."
- **Can't do:** show digest content. Use `get_digest` for that.

### `get_digest` { #get-digest }

Returns one digest as Markdown, by date or by an id from `list_digests`, with tracking, view-in-browser and unsubscribe links removed.

- **Needs:** **Read your digests** (`digest:read`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "Show me yesterday's digest."
- **Can't do:** return more than one digest per call. Content is capped at 40,000 characters.

### `search_notes` { #search-notes }

Finds the passages in your synced notes that best match what you describe, by meaning, optionally limited to folders or tags. It returns up to 20 notes per search (default 5), up to 1,500 characters per note and 30,000 in total. There is no hourly limit.

- **Needs:** **Search your notes** (`search:read`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "Find my notes about the Q3 roadmap in the Work folder."
- **Can't do:** filter by date, write an answer for you (use `ask_vault`), or see notes you excluded from sync.

### `ask_vault` { #ask-vault }

Answers a question from your notes and lists the notes it used. Questions can be up to 1,000 characters, and `ask_vault` is limited to 20 calls an hour (see [Hourly limits](limits.md#hourly-limits)).

- **Needs:** **Ask questions about your vault** (`search:rag`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "Using my vault, what have I decided about our pricing, and which notes say so?"
- **Can't do:** filter by date or folder, or run more than 20 times an hour.

#### Who writes the answer { #who-writes-answers }

If you saved your own key for the AI provider you chose on the account page (OpenAI or Anthropic), your own key writes the answer. Otherwise Managed AI writes it.

Second Brain Digest writes the answer, and `ask_vault` does not use your agent's model. Your agent only receives the finished answer and the sources.

If your saved key is rejected, Second Brain Digest does not switch to Managed AI. You get matching notes instead of a written answer, and you may get a one-time email about the key.

The question is turned into a search embedding by Second Brain Digest's Managed AI (OpenAI), even when you use your own key.

### `get_settings` { #get-settings }

Returns your digest preferences and whether an AI provider key is saved (true or false).

- **Needs:** **Read your digest settings** (`settings:read`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "What time does my digest arrive, and which AI provider is it using?"
- **Can't do:** show email addresses, billing details or key values.

### `update_settings` { #update-settings }

Changes the delivery time and day, how often digests arrive (daily, weekly or monthly), your timezone and which modules are included. All of a request's changes are saved together or not at all.

- **Needs:** **Change your digest settings** (`settings:write`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "Move my digest to 7:30am." You can also ask for more than one change, such as "Switch my digest to weekly on Mondays."
- **Can't do:** turn digests off, pause the schedule, change anything about email addresses, billing or keys, switch your AI provider or move you to Managed AI while a key is saved, or create a delivery schedule that doesn't exist yet. See [What settings changes are off limits](permissions.md#settings-limits).

If a change runs past its time limit, your agent is told to check `get_settings` before retrying, because the change may still be saved.

### `trigger_digest` { #trigger-digest }

Generates a digest now, saves it to your history and emails it if email delivery is on. Second Brain Digest marks this tool as needing your confirmation, so a client that supports this asks you before it runs.

- **Needs:** **Send a digest now** (`digest:trigger`). See [Permissions](permissions.md#the-six-permissions).
- **Example request:** "Send me a digest now."
- **Can't do:** run more than once every 15 minutes, start while another digest is being generated, or run more than 20 times an hour. A call refused by the cooldown still uses one of the 20. See [Digest cooldown](limits.md#digest-cooldown).

If generation takes longer than its time limit, your agent gets a still-running message instead of an error (see [Still running](troubleshooting.md#still-running)).

## Example requests are examples { #examples }

Your agent decides how to phrase each call. Neither search tool filters by date, so a time in your question is matched as words, not as a date range.

## Next steps { #next-steps }

- [Limits](limits.md): hourly limits, the digest cooldown, token limits and expiry.
- [Troubleshooting](troubleshooting.md): what to do when a request is refused.
