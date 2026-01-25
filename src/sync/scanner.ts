/**
 * Vault file scanner for extracting note metadata.
 */

import { App, TFile, CachedMetadata } from 'obsidian';
import { NoteMetadata } from '../types';
import { hashContent } from './hasher';

/**
 * Scanner for extracting metadata from vault files.
 */
export class VaultScanner {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Get all markdown files in the vault.
	 */
	getMarkdownFiles(): TFile[] {
		return this.app.vault.getMarkdownFiles();
	}

	/**
	 * Extract metadata from a single file.
	 */
	async scanFile(file: TFile): Promise<NoteMetadata> {
		const content = await this.app.vault.cachedRead(file);
		const cache = this.app.metadataCache.getFileCache(file);
		const contentHash = await hashContent(content);

		return {
			path: file.path,
			title: this.extractTitle(file, cache),
			content,
			contentHash,
			tags: this.extractTags(cache),
			headings: this.extractHeadings(cache),
			links: this.extractLinks(cache),
			frontmatter: this.extractFrontmatter(cache),
			wordCount: this.countWords(content),
			createdTime: new Date(file.stat.ctime).toISOString(),
			modifiedTime: new Date(file.stat.mtime).toISOString(),
		};
	}

	/**
	 * Scan multiple files.
	 */
	async scanFiles(files: TFile[]): Promise<NoteMetadata[]> {
		const results: NoteMetadata[] = [];
		for (const file of files) {
			try {
				const metadata = await this.scanFile(file);
				results.push(metadata);
			} catch (error) {
				console.error(`[SecondBrain] Failed to scan ${file.path}:`, error);
			}
		}
		return results;
	}

	/**
	 * Get the content hash for a file without full scanning.
	 */
	async getFileHash(file: TFile): Promise<string> {
		const content = await this.app.vault.cachedRead(file);
		return hashContent(content);
	}

	/**
	 * Extract title from frontmatter or filename.
	 */
	private extractTitle(file: TFile, cache: CachedMetadata | null): string {
		// Check frontmatter for title
		if (cache?.frontmatter?.title) {
			return String(cache.frontmatter.title);
		}
		// Fall back to filename without extension
		return file.basename;
	}

	/**
	 * Extract tags from frontmatter and inline tags.
	 */
	private extractTags(cache: CachedMetadata | null): string[] {
		const tags: Set<string> = new Set();

		// Frontmatter tags
		if (cache?.frontmatter?.tags) {
			const fmTags = cache.frontmatter.tags;
			if (Array.isArray(fmTags)) {
				fmTags.forEach(tag => {
					const normalized = this.normalizeTag(String(tag));
					if (normalized) tags.add(normalized);
				});
			} else if (typeof fmTags === 'string') {
				// Handle comma-separated string
				fmTags.split(',').forEach(tag => {
					const normalized = this.normalizeTag(tag.trim());
					if (normalized) tags.add(normalized);
				});
			}
		}

		// Inline tags from cache
		if (cache?.tags) {
			cache.tags.forEach(tagCache => {
				const normalized = this.normalizeTag(tagCache.tag);
				if (normalized) tags.add(normalized);
			});
		}

		return Array.from(tags);
	}

	/**
	 * Normalize tag to have # prefix.
	 */
	private normalizeTag(tag: string): string {
		tag = tag.trim();
		if (!tag) return '';
		if (!tag.startsWith('#')) {
			tag = '#' + tag;
		}
		return tag;
	}

	/**
	 * Extract headings from cache.
	 */
	private extractHeadings(cache: CachedMetadata | null): string[] {
		if (!cache?.headings) return [];
		return cache.headings.map(h => h.heading);
	}

	/**
	 * Extract internal links (wikilinks) from cache.
	 */
	private extractLinks(cache: CachedMetadata | null): string[] {
		const links: string[] = [];

		// Wikilinks
		if (cache?.links) {
			cache.links.forEach(link => {
				links.push(`[[${link.link}]]`);
			});
		}

		// Embeds (also internal links)
		if (cache?.embeds) {
			cache.embeds.forEach(embed => {
				links.push(`![[${embed.link}]]`);
			});
		}

		return links;
	}

	/**
	 * Extract frontmatter as object.
	 */
	private extractFrontmatter(cache: CachedMetadata | null): Record<string, unknown> {
		if (!cache?.frontmatter) return {};
		// Clone to avoid modifying cache
		const fm = { ...cache.frontmatter };
		// Remove position metadata added by Obsidian
		delete fm.position;
		return fm;
	}

	/**
	 * Count words in content.
	 */
	private countWords(content: string): number {
		// Remove frontmatter
		const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');
		// Split on whitespace and filter empty strings
		const words = withoutFrontmatter.split(/\s+/).filter(w => w.length > 0);
		return words.length;
	}
}
