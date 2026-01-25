/**
 * Exclusion rule checking for filtering notes.
 */

import { TFile } from 'obsidian';
import { ExclusionRules, NoteMetadata } from '../types';

/**
 * Check if a file matches any exclusion rules.
 */
export class ExclusionChecker {
	private rules: ExclusionRules;

	constructor(rules: ExclusionRules) {
		this.rules = rules;
	}

	/**
	 * Update exclusion rules.
	 */
	updateRules(rules: ExclusionRules): void {
		this.rules = rules;
	}

	/**
	 * Get current rules.
	 */
	getRules(): ExclusionRules {
		return this.rules;
	}

	/**
	 * Check if a file should be excluded.
	 */
	shouldExclude(file: TFile, tags?: string[]): boolean {
		return this.matchesPath(file.path) || this.matchesTags(tags || []);
	}

	/**
	 * Check if note metadata should be excluded.
	 */
	shouldExcludeNote(note: NoteMetadata): boolean {
		return this.matchesPath(note.path) || this.matchesTags(note.tags);
	}

	/**
	 * Check if path matches any folder exclusion.
	 */
	matchesPath(path: string): boolean {
		for (const folder of this.rules.folders) {
			// Normalize folder path to have trailing slash
			const normalizedFolder = folder.endsWith('/') ? folder : folder + '/';
			if (path.startsWith(normalizedFolder)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check if any tag matches exclusion list.
	 */
	matchesTags(tags: string[]): boolean {
		for (const tag of tags) {
			// Normalize tag to have # prefix
			const normalizedTag = tag.startsWith('#') ? tag : '#' + tag;
			if (this.rules.tags.includes(normalizedTag)) {
				return true;
			}
			// Also check without # prefix for flexibility
			const withoutHash = normalizedTag.substring(1);
			if (this.rules.tags.includes(withoutHash)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Filter files to only include those not excluded.
	 */
	filterFiles(files: TFile[], getTagsForFile?: (file: TFile) => string[]): TFile[] {
		return files.filter(file => {
			const tags = getTagsForFile ? getTagsForFile(file) : [];
			return !this.shouldExclude(file, tags);
		});
	}

	/**
	 * Filter notes to only include those not excluded.
	 */
	filterNotes(notes: NoteMetadata[]): NoteMetadata[] {
		return notes.filter(note => !this.shouldExcludeNote(note));
	}
}

/**
 * Parse folder exclusions from user input.
 * Normalizes paths to have trailing slashes.
 */
export function parseFolderExclusions(input: string): string[] {
	return input
		.split('\n')
		.map(line => line.trim())
		.filter(line => line.length > 0)
		.map(folder => {
			// Remove leading slash (paths should be relative)
			folder = folder.replace(/^\/+/, '');
			// Ensure trailing slash
			if (!folder.endsWith('/')) {
				folder += '/';
			}
			return folder;
		});
}

/**
 * Parse tag exclusions from user input.
 * Normalizes tags to have # prefix.
 */
export function parseTagExclusions(input: string): string[] {
	return input
		.split('\n')
		.map(line => line.trim())
		.filter(line => line.length > 0)
		.map(tag => {
			// Ensure # prefix
			if (!tag.startsWith('#')) {
				tag = '#' + tag;
			}
			return tag;
		});
}

/**
 * Format folder exclusions for display.
 */
export function formatFolderExclusions(folders: string[]): string {
	return folders.join('\n');
}

/**
 * Format tag exclusions for display.
 */
export function formatTagExclusions(tags: string[]): string {
	return tags.join('\n');
}
