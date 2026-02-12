# Welcome, Beta Testers!

Thank you so much for being one of the first people to try [Second Brain Digest](https://secondbraindigest.com/)! As a beta tester, you're getting early access to help shape this product into something truly useful for Obsidian power users like yourself.

This guide will walk you through getting set up. Please don't hesitate to reach out if you hit any snags—your feedback is invaluable, and I'm here to help you get everything working smoothly. You can email me at [dann@secondbraindigest.com](mailto:dann@secondbraindigest.com).

## What to Expect During Beta

As an early tester, you'll experience:

- **Active development** - Features are being added and refined based on your feedback
- **Direct support** - You have my personal attention for questions and issues
- **Your voice matters** - Your input will directly influence what gets built and how it works
- **Some rough edges** - This is a work in progress, so please be patient with occasional bugs

The goal is to work together to make this genuinely useful for your workflow.

## Getting Started

### Step 1: Create Your Account

1. Visit [secondbraindigest.com](https://secondbraindigest.com) and click **Sign Up**
2. Enter your email address and the invite code you were provided
3. Check your inbox for a magic link and click it to begin the onboarding process

### Step 2: Onboarding and Obsidian Plugin setup

The plugin securely syncs your vault data to Second Brain Digest. Don't worry—you have complete control over what gets included.

#### Installing from GitHub (Current Beta Process)

Since we're still in beta, the plugin isn't yet in the Obsidian Community Plugins directory. Here's how to install it manually:

1. Download the latest release from [GitHub](https://github.com/dannberg/obsidian-secondbrain-sync/releases)
2. Look for the `.zip` file (e.g., `secondbrain-sync-X.Y.Z.zip`)
3. Extract the zip file
4. Copy the extracted files (`main.js`, `manifest.json`, `styles.css`) to your vault's `.obsidian/plugins/second-brain-digest/` folder
   - You will need to create this folder if it doesn't exist
5. Restart Obsidian
6. Go to **Settings > Community plugins** and enable "Second Brain Digest"

**Having trouble?** Reach out and I'll walk you through it.

#### Getting Your API Token

1. During your onboarding process, you'll be provided with your **API Token**
3. Copy the token (important: you won't be able to see it again)
4. In Obsidian, go to **Settings > Second Brain Digest Sync**
5. Paste your API token and click **Verify Connection**

### Step 3: Choose What to Sync

You have full control over what gets synced. Before the initial sync, consider:

**Excluding Sensitive Folders:**
- In the plugin settings, add any folders you want to keep private (e.g., `Private/`, `Work/Confidential/`)
- These notes will never leave your vault

**Excluding by Tags:**
- Add tags like `#private` or `#sensitive` to the exclusion list
- Any note with these tags will be automatically skipped

You can always adjust these settings later from the Second Brain Digest Sync plugin settings.

### Step 4: Initial Sync

Once you're ready:

1. The plugin will automatically start syncing your vault
2. For large vaults, this might take a few minutes—that's normal
3. You can check sync status in the plugin settings
4. Watch for any error messages and let me know if you see them

### Step 5: Configure Your Preferences

Now that you've seen a digest, customize it to your liking:

- **Timezone** - Make sure digests arrive at a convenient time
- **Modules** - Enable or disable individual sections
- **Module Order** - Drag to reorder how sections appear
- **Schedule** - Set up automated daily digests (or choose a different frequency)

See [Settings & Preferences](settings.md) for detailed configuration options.

That's it! Welcome to Second Brain Digest. 🧠

## What to Test & Feedback I Need

As a beta tester, here's what would be most helpful:

1. **General usability** - Is the setup process clear? Any confusing parts?
2. **Digest quality** - Are the insights actually useful? What would make them better?
3. **Module preferences** - Which sections do you find most valuable? Which ones feel like noise?
4. **Performance** - How long does sync take? Any slowdowns in Obsidian?
5. **Edge cases** - Unusual vault structures, special characters, large files, etc.
6. **Feature requests** - What's missing that would make this more valuable for you?

**How to share feedback:**
- Email me directly
- Open an issue on [GitHub](https://github.com/dannberg/second-brain-digest/issues) if you're comfortable with that
- Just reply to a digest email with thoughts

## Known Issues & Limitations

To save you some troubleshooting time, here are some known quirks:

- Initial sync can be slow for vaults with 1000+ notes (working on optimization)
- Some markdown syntax edge cases may not parse perfectly yet
- The AI insights work best when you have at least a few days of note activity

I'm actively working on all of these.

## Getting Help

If you run into any issues:

1. **Check the logs** - In Obsidian, open the console (Cmd/Ctrl + Shift + I) and look for Second Brain Digest messages
2. **Try the basics** - Disable and re-enable the plugin, or force a manual sync
3. **Reach out** - Seriously, don't struggle alone. Email me with:
   - What you were trying to do
   - What happened instead
   - Any error messages you saw
   - Screenshots if helpful

## Resources

- [Connecting Your Vault](connecting-vault.md) - Detailed plugin setup guide
- [Settings & Preferences](settings.md) - Full configuration walkthrough
- [Email Scheduling](scheduling.md) - Set up automated digests
- [Module Documentation](../modules/overview.md) - Learn what each section does
- [FAQ](../faq.md) - Common questions

## Thank You

Seriously, thank you for being part of this early stage. Your willingness to test, provide feedback, and help work through issues is what will make Second Brain Digest genuinely useful for the Obsidian community.

I'm excited to hear what you think!

— Dann
