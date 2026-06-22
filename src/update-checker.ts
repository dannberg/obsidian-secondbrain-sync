import { Notice } from 'obsidian';

/** Where users download new releases (sideloaded; not in the Obsidian marketplace). */
export const RELEASES_URL = 'https://github.com/dannberg/obsidian-secondbrain-sync/releases/latest';

/**
 * Compare two dotted numeric version strings (e.g. "1.6.0").
 * Returns -1 if a < b, 0 if equal, 1 if a > b. Non-numeric/missing parts are treated as 0.
 */
export function compareVersions(a: string, b: string): number {
	const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
	const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
	const len = Math.max(pa.length, pb.length);
	for (let i = 0; i < len; i++) {
		const x = pa[i] || 0;
		const y = pb[i] || 0;
		if (x < y) return -1;
		if (x > y) return 1;
	}
	return 0;
}

export interface UpdateStatus {
	current: string;
	latest?: string;
	outdated: boolean;
	belowMinimum: boolean;
}

/**
 * Tracks plugin-version advisories returned by the server and nudges the user to update.
 *
 * The server includes `latest_plugin_version` / `min_supported_plugin_version` in sync
 * responses. Since the plugin is sideloaded, Obsidian won't prompt for updates, so we
 * surface them here: a one-per-version Notice plus a banner the settings tab can render.
 */
export class UpdateChecker {
	private readonly currentVersion: string;
	private latest?: string;
	private minSupported?: string;
	private notifiedForVersion: string | null = null;

	constructor(currentVersion: string) {
		this.currentVersion = currentVersion;
	}

	/**
	 * Record the latest advisory from a sync response and show a Notice if outdated.
	 * Nags at most once per distinct latest version per session.
	 */
	evaluate(latest?: string, minSupported?: string): void {
		this.latest = latest;
		this.minSupported = minSupported;

		if (!latest || compareVersions(this.currentVersion, latest) >= 0) {
			return; // unknown or already up to date
		}
		if (this.notifiedForVersion === latest) {
			return; // already nudged for this version this session
		}
		this.notifiedForVersion = latest;

		if (minSupported && compareVersions(this.currentVersion, minSupported) < 0) {
			new Notice(
				`Second Brain Digest Sync ${this.currentVersion} is out of date and may stop ` +
				`syncing. Please update to ${latest}: ${RELEASES_URL}`,
				15000
			);
		} else {
			new Notice(
				`Second Brain Digest Sync ${latest} is available (you have ${this.currentVersion}). ` +
				`Download the update from ${RELEASES_URL}`,
				10000
			);
		}
	}

	/** Current advisory state, for rendering a banner in the settings tab. */
	getStatus(): UpdateStatus {
		const outdated = !!this.latest && compareVersions(this.currentVersion, this.latest) < 0;
		const belowMinimum =
			!!this.minSupported && compareVersions(this.currentVersion, this.minSupported) < 0;
		return { current: this.currentVersion, latest: this.latest, outdated, belowMinimum };
	}
}
