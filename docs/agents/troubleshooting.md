# Troubleshooting

Find the message your agent or client shows, then follow the fix under it.

Messages that end with "Retry in N seconds" also carry a `retry_after` value, in seconds, that your agent can read.

## 401: token missing, wrong, revoked or expired { #http-401 }

The server refuses the request with one of these five messages. Each one is followed by ` Get an MCP token at https://secondbraindigest.com/app/mcp/.`

```
MCP requests need an MCP token in the Authorization header.
```

The header is missing or malformed.

```
This MCP token is not valid.
```

The token is mistyped or unknown.

```
This MCP token has been revoked.
```

You or someone with access to your account revoked this token.

```
This MCP token has expired.
```

The expiry you chose when you created the token has passed.

```
This is an Obsidian plugin key, not an MCP token.
```

You used your Obsidian plugin key by mistake. An MCP token starts with `sbdmcp_`.

**Fix:** [create a new token](setup.md#create-a-token), put it in your client config, and restart the client. For Claude Desktop, quit it completely and open it again.

Claude Code shows the message directly. Claude Desktop may show a sign-in error instead (see [Claude Desktop shows a sign-in or registration error](#mcp-remote-sign-in-error)).

## 403: subscription inactive { #http-403 }

```
Your Second Brain Digest subscription is inactive. Reactivate at https://secondbraindigest.com/app/billing/
```

**Fix:** reactivate on the **Billing** page. Tokens that haven't expired work again once you reactivate, so there is nothing to recreate.

This happens when your trial ended or your subscription lapsed. It can also appear partway through a session on search, ask and send-digest calls, which check your subscription again each time.

## Claude Desktop shows a sign-in or registration error { #mcp-remote-sign-in-error }

Claude Desktop connects through the mcp-remote bridge. When the token is missing, wrong, or still `PASTE_YOUR_TOKEN_HERE`, mcp-remote starts a sign-in flow, and Claude Desktop may show a sign-in or registration error instead of the 401 message.

**Fix:** put your real token in the `env` block of the config. On Windows, keep `Bearer ` in front of it (see [Windows](setup.md#windows)). Then quit Claude Desktop completely and open it again (see [Claude Desktop](setup.md#claude-desktop)).

Claude Code shows the 401 message instead.

## rate_limited { #rate-limited }

```
Rate limit reached for {tool}. Retry in {N} seconds.
```

`ask_vault` or `trigger_digest` reached 20 calls in the past hour.

**Fix:** wait `retry_after` seconds, then try again. See [Hourly limits](limits.md#hourly-limits).

## cooldown_active { #cooldown-active }

```
A digest was generated on request recently. On-demand digests are limited to one every 15 minutes. Retry in {N} seconds.
```

**Fix:** wait `retry_after` seconds. Calling again sooner still uses one of your 20 calls for the hour. See [Digest cooldown](limits.md#digest-cooldown).

You may also see this related message when a digest is already being generated. The fix is the same.

```
A digest is already being generated for this account. Try again shortly. Retry in {N} seconds.
```

## vault_not_indexed { #vault-not-indexed }

```
No indexed content found. Please sync and index your vault first.
```

Your vault hasn't synced yet, or indexing hasn't finished.

**Fix:** sync with the Obsidian plugin (see [Connecting Your Vault](../user-guide/connecting-vault.md)), wait a few minutes, and try again.

## busy { #busy }

```
The Second Brain Digest MCP server is busy. Retry in a few seconds.
```

The `retry_after` value is 5.

**Fix:** wait a few seconds and try again.

## A digest that is still running { #still-running }

```
Your digest is still being generated. It will be saved to your history and emailed if email delivery is on. Check list_digests in a few minutes instead of calling trigger_digest again: a new run is refused for 15 minutes after one starts.
```

This is not an error. The digest is still being generated.

**Fix:** ask your agent to check `list_digests` in a few minutes. Don't call `trigger_digest` again.

## Other messages { #other-messages }

```
The Second Brain Digest MCP server is temporarily disabled.
```

Try again later.

```
This token doesn't have the {scope} scope needed for {tool}. Create a token with that scope at https://secondbraindigest.com/app/mcp/.
```

This token lacks the permission the tool needs. Create a token with that permission (see [Permissions](permissions.md)).

```
{tool} did not finish within {N} seconds. Try again later.
```

The call took too long. Try again later.

An `update_settings` call that ran past its time limit tells your agent to check `get_settings` before retrying, because the change may still be saved.

An `ask_vault` answer that says your saved key was rejected looks like this:

```
Your saved {provider} key was rejected — update it on the account page
```

Update the key on your account page. Second Brain Digest shows matching notes instead, and does not switch to Managed AI.

Still stuck? See [Set Up Your Client](setup.md) and [Limits](limits.md).
