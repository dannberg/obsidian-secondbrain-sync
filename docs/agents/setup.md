# Set Up Your Client

Create an MCP token, then connect Claude Code or Claude Desktop with it. Before you start, check [what you need](index.md#what-you-need).

## Create a token { #create-a-token }

An MCP token is a different token from the key you use in the Obsidian plugin. You create it on the **MCP** page of your account.

1. Sign in at [https://secondbraindigest.com](https://secondbraindigest.com).
2. Open **MCP** in the sidebar (or open **Account**, then **Manage MCP access**), or go straight to [https://secondbraindigest.com/app/mcp/](https://secondbraindigest.com/app/mcp/).
3. Fill in **Token name**. It is required, up to 100 characters, and helps you tell tokens apart later, for example "Claude Code on laptop".
4. Choose **Permissions**. Pick at least one, because nothing is selected by default. The **Quick select** buttons **Read-only** and **Full access** only tick boxes for you. You can't change a token's permissions later, so if you need different ones, revoke the token and create a new one. See [Permissions](permissions.md) for what each one allows.
5. Choose **Expires**: **90 days** (recommended, and the default), **30 days**, or **Never** (stays valid until you revoke it). See [Token lifetime](limits.md#token-lifetime).
6. Click **Create token**.
7. Click **Copy token** right away.

MCP tokens start with `sbdmcp_`.

!!! warning "Copy your token now"
    The token is shown once. If you lose it, revoke it and create a new one.

!!! tip "Use the filled-in setup steps"
    Right after you create a token, the **Connect a client** section of the MCP page shows each command and config with your new token already filled in, next to the reusable version that uses the `SBD_MCP_TOKEN` variable. The filled-in versions are shown on that page view only.

## Claude Code { #claude-code }

Pick the terminal command or a `.mcp.json` file.

=== "Terminal command"

    This command adds the server for every project (`--scope user`). Replace `paste-your-token-here` with your token.

    ```bash
    export SBD_MCP_TOKEN='paste-your-token-here'
    claude mcp add --transport http --scope user secondbraindigest https://secondbraindigest.com/mcp --header 'Authorization: Bearer ${SBD_MCP_TOKEN}'
    ```

    !!! warning "Read this before you rely on the terminal command"
        The `export` line sets the variable only for the terminal session you run it in, and it puts your token in your shell history. So can any command you paste with your token filled in.

        The header is single-quoted on purpose, so the shell passes the variable to Claude Code as written. It is not confirmed that Claude Code fills in the variable for a server added this way.

        If Claude Code reports a 401, use the command with your token filled in from the MCP page, or use the `.mcp.json` file.

=== ".mcp.json"

    Save this as `.mcp.json` in your project root.

    ```json
    {
      "mcpServers": {
        "secondbraindigest": {
          "type": "http",
          "url": "https://secondbraindigest.com/mcp",
          "headers": {
            "Authorization": "Bearer ${SBD_MCP_TOKEN}"
          }
        }
      }
    }
    ```

    Set the `SBD_MCP_TOKEN` environment variable to your token before you start Claude Code. Claude Code fills in `${SBD_MCP_TOKEN}` from it when it reads the file.

    Create the file by hand. Running `claude mcp add --scope project` can replace the `${SBD_MCP_TOKEN}` placeholder with your token value. Claude Code asks you to approve project servers the first time.

    A `.mcp.json` file can be committed with your project, so keep the variable in it, never your real token.

### Check it worked { #check-claude-code }

Run `claude mcp list` in a terminal, or `/mcp` inside a Claude Code session. Then try a read-only request from [Tools](tools.md), for example asking your agent to list your recent digests.

## Claude Desktop { #claude-desktop }

Claude Desktop connects through the mcp-remote bridge.

1. Install Node.js 20.18.1 or newer from [https://nodejs.org](https://nodejs.org).
2. In Claude Desktop, open **Settings**, then **Developer**, then **Edit Config**. The file is `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS and `%APPDATA%\Claude\claude_desktop_config.json` on Windows.
3. Add the `secondbraindigest` entry below inside `mcpServers` (or paste the whole block if your file is empty), and replace `PASTE_YOUR_TOKEN_HERE` with your token.
4. Quit Claude Desktop completely and open it again.

```json
{
  "mcpServers": {
    "secondbraindigest": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@0.16.6",
        "https://secondbraindigest.com/mcp",
        "--header",
        "Authorization: Bearer ${SBD_MCP_TOKEN}"
      ],
      "env": {
        "SBD_MCP_TOKEN": "PASTE_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

### Windows { #windows }

On Windows, use this version instead. The space in the header moves into an environment variable so it survives quoting.

```json
{
  "mcpServers": {
    "secondbraindigest": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@0.16.6",
        "https://secondbraindigest.com/mcp",
        "--header",
        "Authorization:${SBD_AUTH_HEADER}"
      ],
      "env": {
        "SBD_AUTH_HEADER": "Bearer PASTE_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Replace `PASTE_YOUR_TOKEN_HERE` with your token, and keep `Bearer ` in front of it.

!!! warning "Sign-in or registration error"
    If Claude Desktop shows a sign-in or "registration" error, check your token first. mcp-remote starts a sign-in flow when the token is missing, wrong, or still `PASTE_YOUR_TOKEN_HERE`. Put your real token in the config and restart Claude Desktop. See [Troubleshooting](troubleshooting.md#mcp-remote-sign-in-error).

## Next steps { #next-steps }

- [Permissions](permissions.md): what each permission lets your agent do.
- [Tools](tools.md): the requests your agent can make, with examples.
- [Troubleshooting](troubleshooting.md): what to do if something doesn't connect.
