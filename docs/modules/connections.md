# Connections & Crosslinks

The Connections module helps you discover relationships between notes in your vault. It identifies notes that are related through links, shared tags, similar structure, or content overlap.

## What It Shows

### Direct Connections

Notes that explicitly link to each other, forming clusters of related content.

### Shared Tags

Notes that share the same tags, suggesting topical relationships.

### Structural Similarity

Notes with similar organization or in the same folder hierarchy.

### Content Overlap

Notes that discuss similar topics even without explicit links.

## How It Works

1. **Graph Analysis** - Examines the link structure of your vault
2. **Tag Clustering** - Groups notes by shared tags
3. **Content Analysis** - Identifies semantic similarities
4. **Pattern Detection** - Finds clusters and hubs of related notes
5. **Suggestion Generation** - Recommends connections you might want to strengthen

## Example Output

> **Connections in Your Vault**
>
> **Cluster: Project Management**
>
> These notes form a connected group:
> - Project Alpha Planning
> - Team Meeting Notes (links to 3 project notes)
> - Resource Allocation (tagged #project-management)
>
> **Potential Connection**
>
> "Productivity Tips" and "Weekly Review Process" share similar themes but aren't linked. Consider connecting them.
>
> **Hub Note**
>
> "Home" acts as a hub, linking to 15 other notes. Consider if all these connections are intentional.

## Types of Connections

### Explicit Links

Internal links you've created using `[[note name]]` syntax.

### Backlinks

Notes that link TO a given note (discovered automatically).

### Tag Relationships

Notes sharing one or more tags.

### Folder Proximity

Notes in the same folder or nearby in the hierarchy.

### Semantic Similarity

Notes about similar topics (requires AI).

## Configuration

### AI Mode

With AI enabled:

- Semantic content analysis
- Intelligent connection suggestions
- Natural language descriptions of relationships

### Rule-Based Mode

Without AI:

- Link and backlink analysis
- Tag-based clustering
- Folder structure relationships

## Tips for Best Results

### Intentional Linking

Create links when notes are genuinely related. Quality connections beat quantity.

### Consistent Tag Taxonomy

Develop a consistent tagging system. Related notes should share relevant tags.

### Use Folders Meaningfully

Folder structure can inform connections. Keep related notes grouped logically.

### Review Suggestions

When the module suggests potential connections, take time to evaluate if they make sense for your vault.
