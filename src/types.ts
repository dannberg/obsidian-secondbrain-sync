/**
 * Shared type definitions for the Second Brain Sync plugin.
 */

/**
 * Plugin settings stored in data.json
 */
export interface PluginSettings {
	/** API authentication token */
	apiToken: string;
	/** Enable automatic sync on file changes */
	autoSync: boolean;
	/** Enable scheduled sync before digest time */
	scheduledSync: boolean;
	/** Hours before digest to trigger sync */
	scheduledSyncHoursBefore: number;
	/** Debug mode for verbose logging */
	debugMode: boolean;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
	apiToken: '',
	autoSync: true,
	scheduledSync: true,
	scheduledSyncHoursBefore: 2,
	debugMode: false,
};

/**
 * Sync state persisted locally
 */
export interface SyncState {
	/** Map of note path to content hash */
	noteHashes: Record<string, string>;
	/** ISO timestamp of last successful sync */
	lastSyncTime: string | null;
	/** Cached exclusion rules from server */
	serverExclusions: ExclusionRules;
}

/**
 * Default sync state
 */
export const DEFAULT_SYNC_STATE: SyncState = {
	noteHashes: {},
	lastSyncTime: null,
	serverExclusions: { folders: [], tags: [] },
};

/**
 * Exclusion rules for filtering notes
 */
export interface ExclusionRules {
	/** Folder paths to exclude (relative, with trailing slash) */
	folders: string[];
	/** Tags to exclude (with # prefix) */
	tags: string[];
}

/**
 * Result of comparing local state with vault
 */
export interface SyncDiff {
	/** Notes that are new or have changed content */
	changed: string[];
	/** Notes that were deleted from vault */
	deleted: string[];
}

/**
 * Note metadata extracted from vault
 */
export interface NoteMetadata {
	/** Relative path in vault */
	path: string;
	/** Note title (filename without extension or frontmatter title) */
	title: string;
	/** Full markdown content */
	content: string;
	/** SHA256 hash of content */
	contentHash: string;
	/** Tags from frontmatter and inline */
	tags: string[];
	/** Headings in the note */
	headings: string[];
	/** Wikilinks to other notes */
	links: string[];
	/** Frontmatter object */
	frontmatter: Record<string, unknown>;
	/** Word count */
	wordCount: number;
	/** File creation time (ISO 8601) */
	createdTime: string;
	/** File modification time (ISO 8601) */
	modifiedTime: string;
}

/**
 * Sync status for UI display
 */
export interface SyncStatus {
	/** Current sync state */
	state: 'idle' | 'syncing' | 'error';
	/** Error message if state is 'error' */
	error?: string;
	/** Number of notes being synced */
	pendingCount?: number;
	/** Number of notes synced so far */
	syncedCount?: number;
}
