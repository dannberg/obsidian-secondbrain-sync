# Limits

How often your agent can call each tool, how long a call can run, and how many tokens you can hold.

## Hourly limits { #hourly-limits }

`ask_vault` and `trigger_digest` each allow 20 calls an hour per account. They are separate buckets, so using one does not use up the other.

The other five tools have no per-tool hourly limit, though the server can be briefly busy (see [Busy](troubleshooting.md#busy)).

When you reach a limit, your agent gets `Rate limit reached for {tool}. Retry in {N} seconds.` with a `retry_after` value in seconds (see [Rate limited](troubleshooting.md#rate-limited)).

## Digest cooldown { #digest-cooldown }

You can run one on-demand digest every 15 minutes. The 15 minutes are counted from when the previous on-demand run started, whether it succeeded or failed.

A `trigger_digest` call refused by the cooldown, or because a digest is already being generated, still uses one of your 20 calls for that hour. Retrying during the cooldown wastes calls, so wait for `retry_after` instead (see [Cooldown active](troubleshooting.md#cooldown-active)).

## Token limit { #token-limit }

You can have up to 10 active MCP tokens per account. Expired and revoked tokens don't count.

At the limit, the MCP page shows `You have 10 active MCP tokens, which is the limit. Revoke one below, then create a new one.`

## Token lifetime { #token-lifetime }

When you create a token, **Expires** has three choices:

- **90 days**: the default, marked Recommended.
- **30 days**
- **Never**: stays valid until you revoke it.

An expired token gets a 401 (see [HTTP 401](troubleshooting.md#http-401)).

A token can't be edited. Its name, permissions and expiry are fixed, so to change any of them, revoke the token and create a new one (see [Create a token](setup.md#create-a-token)).

While your trial or subscription is active, you can revoke a token on the **MCP** page, and your agent's next request with it is refused. **Revoke all** revokes every MCP token and never touches your Obsidian plugin key.

!!! note "If your subscription lapses"
    While your account is lapsed you can't open the MCP page, so you can't revoke tokens there, and your agent's requests are refused. A token that hasn't expired works again if you reactivate, including one set to **Never**, so revoke tokens you no longer need before you cancel.

## Time limits { #time-limits }

| Tools | Time limit |
| --- | --- |
| `list_digests`, `get_digest`, `get_settings`, `update_settings` | 15 seconds |
| `search_notes` | 25 seconds |
| `ask_vault`, `trigger_digest` | 50 seconds |

These are the longest a call may run before your agent gets an error or, for `trigger_digest`, a still-running message (see [Still running](troubleshooting.md#still-running)).
