/**
 * API request/response types matching the server contract.
 */

/**
 * Note payload for sync request
 */
export interface NotePayload {
	/** Relative path in vault (required) */
	path: string;
	/** Full markdown content (required) */
	content: string;
	/** SHA256 hash of content, 64 hex chars (required) */
	content_hash: string;
	/** Note title */
	title?: string;
	/** Tags (with # prefix) */
	tags?: string[];
	/** Headings in the note */
	headings?: string[];
	/** Wikilinks to other notes */
	links?: string[];
	/** Frontmatter object */
	frontmatter?: Record<string, unknown>;
	/** Word count */
	word_count?: number;
	/** File creation time (ISO 8601) */
	created_time?: string;
	/** File modification time (ISO 8601) */
	modified_time?: string;
}

/**
 * Sync request body
 */
export interface SyncRequest {
	/** Unique batch identifier */
	batch_id: string;
	/** Array of notes to sync (max 100) */
	notes: NotePayload[];
	/** Whether this is the final batch */
	is_final_batch: boolean;
	/** Name of the Obsidian vault (for deep links) */
	vault_name?: string;
}

/**
 * Sync response from server
 */
export interface SyncResponse {
	/** Batch ID echoed back */
	batch_id: string;
	/** Number of notes processed */
	processed: number;
	/** Number of notes indexed in Pinecone */
	indexed: number;
	/** Errors for specific notes */
	errors: Array<{
		path: string;
		error: string;
	}>;
}

/**
 * Delete request body
 */
export interface DeleteRequest {
	/** Paths of notes to delete */
	paths: string[];
}

/**
 * Delete response from server
 */
export interface DeleteResponse {
	/** Number of notes deleted */
	deleted: number;
	/** Paths that were deleted */
	paths: string[];
}

/**
 * Status response from server
 */
export interface StatusResponse {
	/** ISO timestamp of last sync */
	last_sync: string | null;
	/** Vault name stored on server (null if no notes synced yet) */
	vault_name: string | null;
	/** Total notes on server */
	total_notes: number;
	/** Notes indexed in Pinecone */
	indexed_notes: number;
	/** Notes pending indexing */
	pending_notes: number;
	/** Current exclusion rules */
	exclusions: {
		folders: string[];
		tags: string[];
	};
}

/**
 * Exclusions request body
 */
export interface ExclusionsRequest {
	/** Folder paths to exclude */
	folders: string[];
	/** Tags to exclude (with # prefix) */
	tags: string[];
}

/**
 * Exclusions response from server
 */
export interface ExclusionsResponse {
	/** Whether update succeeded */
	updated: boolean;
	/** Number of notes deleted due to new exclusions */
	deleted_count: number;
	/** Paths of deleted notes */
	deleted_paths: string[];
}

/**
 * Get exclusions response
 */
export interface GetExclusionsResponse {
	/** Excluded folder paths */
	folders: string[];
	/** Excluded tags */
	tags: string[];
}

/**
 * Digest schedule response from server
 */
export interface ScheduleResponse {
	/** Whether scheduled digests are enabled */
	is_enabled: boolean;
	/** Hour to send digest (0-23) */
	hour: number;
	/** Minute to send digest (0-59) */
	minute: number;
	/** User's timezone string */
	timezone: string;
	/** Next scheduled digest time in UTC (ISO 8601), null if disabled */
	next_digest_utc: string | null;
}

/**
 * API error response
 */
export interface ApiError {
	/** Error message */
	error: string;
	/** Error code */
	code: string;
	/** Validation details (for validation errors) */
	details?: Record<string, string[]>;
}
