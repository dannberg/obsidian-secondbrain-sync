# Connect Your AI Agent

With an MCP token you create and control, your own AI agent can read your digests, search your notes, ask questions about your vault, read and change some digest settings, and send a digest now. MCP (Model Context Protocol) is an open standard that AI agents use to connect to outside tools and data.

Ready to connect your first agent? Start with [Set Up Your Client](setup.md).

## Who it's for { #who-its-for }

This is for people who already use an AI agent such as Claude Code or Claude Desktop and want it to work with their Second Brain Digest. You choose what each token can do, and you can revoke a token to disconnect an agent (see [Limits](limits.md#token-lifetime)).

## Supported clients { #supported-clients }

- **Claude Code**: supported.
- **Claude Desktop**: supported through the mcp-remote bridge. It needs Node.js 20.18.1 or newer.
- **claude.ai custom connectors**: not supported yet (not tested).

## What you need { #what-you-need }

- An active Second Brain Digest trial or paid subscription. The free trial works, and there is no staff or other bypass.
- A vault synced with the Obsidian plugin. See [Connecting Your Vault](../user-guide/connecting-vault.md).
- Node.js 20.18.1 or newer, for Claude Desktop only.

If your trial ends or your subscription lapses, your agent's requests are refused until you reactivate. See [HTTP 403](troubleshooting.md#http-403).

!!! note "An MCP token is not your plugin key"
    You create MCP tokens on the **MCP** page of your account, and they start with `sbdmcp_`. The Obsidian plugin key (the API token in the plugin settings) is separate, and the MCP server rejects it.

## What your agent can see { #what-your-agent-can-see }

Your agent can see only the notes you synced. Notes you exclude in the plugin are never synced, so your agent can't see them.

The note passages and full digests your agent asks for are returned to your agent, and they reach the AI provider behind it (for example Anthropic for Claude Code). See [Permissions](permissions.md) for what each permission allows.

## In this section { #in-this-section }

- [Set Up Your Client](setup.md): create a token and connect Claude Code or Claude Desktop.
- [Permissions](permissions.md): the six permissions and what each one unlocks.
- [Tools](tools.md): what your agent can do, with an example request for each tool.
- [Limits](limits.md): hourly limits, the digest cooldown, token limits and expiry.
- [Troubleshooting](troubleshooting.md): what to do when your agent can't connect or a request is refused.

## Reference for agents { #reference-for-agents }

[https://secondbraindigest.com/mcp/docs](https://secondbraindigest.com/mcp/docs) is a Markdown reference written for AI agents. It covers every tool, permission and limit. Give the link to your agent if it needs to learn how the server works. Your browser may download the file instead of showing it.
