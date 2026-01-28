# This Day in History

The This Day in History module shows notes you created on the same date in previous years. It's a personal time capsule that reveals what you were thinking about and working on in the past.

## What It Shows

Notes created on today's date in previous years, displaying:

- Note title
- Year it was created
- Brief excerpt or summary
- How long ago it was created

## How It Works

1. **Date Matching** - Finds notes created on the same month and day
2. **Year Grouping** - Organizes results by year
3. **Content Preview** - Extracts relevant excerpts from each note
4. **Presentation** - Displays chronologically, oldest to newest

## Example Output

> **This Day in Your History**
>
> **January 24, 2023** (2 years ago)
>
> **"New Year Goals Planning"**
> > Outlining my focus areas for 2023: improve writing consistency, build a reading habit, explore new tools for knowledge management...
>
> **January 24, 2022** (3 years ago)
>
> **"Book Notes: Atomic Habits"**
> > Key takeaway: Focus on systems, not goals. The 1% improvement concept...
>
> **January 24, 2021** (4 years ago)
>
> **"Daily Journal"**
> > Started exploring Obsidian today. First impressions are positive...

## Why This Matters

### Track Personal Growth

See how your thinking, interests, and priorities have evolved over time.

### Anniversary Reminders

Notes about events, projects, or milestones resurface on their anniversary.

### Pattern Recognition

Notice recurring themes or seasonal patterns in your note-taking.

### Memory Trigger

Revisiting past notes often triggers memories and context you'd forgotten.

## Configuration

This module uses note creation dates, which can come from:

### File Creation Date

The filesystem timestamp when the file was created.

### Frontmatter Date

If your notes include a `created` or `date` field in frontmatter, this takes precedence:

```yaml
---
created: 2023-01-24
---
```

### Modification vs Creation

This module specifically looks at creation dates, not modification dates, to show you what you were starting on this date.

## Tips for Best Results

### Consistent Dating

If you use frontmatter dates, be consistent across your vault. This ensures accurate "this day" matching.

### Daily Notes

If you keep a daily journal or daily notes, this module becomes especially valuable for year-over-year comparisons.

### Let It Accumulate

This module becomes more valuable over time. A vault with years of notes will have richer historical content to surface.

### Reflect and Connect

When you see an old note:

- Consider how your thinking has changed
- Look for connections to current work
- Update the note if you have new insights to add

## Empty Results

If no notes appear for today's date:

- You may not have created any notes on this date in previous years
- Your vault may be relatively new
- Check back tomorrow - different dates have different coverage
