/**
 * HTTP client for Second Brain Digest API with retry and rate limiting.
 */

import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';
import {
	SyncRequest,
	SyncResponse,
	DeleteRequest,
	DeleteResponse,
	StatusResponse,
	ExclusionsRequest,
	ExclusionsResponse,
	GetExclusionsResponse,
	ApiError,
} from './types';

/**
 * API client configuration
 */
export interface ApiClientConfig {
	serverUrl: string;
	apiToken: string;
	debugMode?: boolean;
}

/**
 * Rate limiter to prevent API flooding
 */
class RateLimiter {
	private timestamps: number[] = [];
	private readonly maxRequests: number;
	private readonly windowMs: number;

	constructor(maxRequests: number = 10, windowMs: number = 1000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	async acquire(): Promise<void> {
		const now = Date.now();
		// Remove timestamps outside the window
		this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

		if (this.timestamps.length >= this.maxRequests) {
			// Wait until the oldest request expires
			const waitTime = this.timestamps[0] + this.windowMs - now;
			if (waitTime > 0) {
				await this.sleep(waitTime);
			}
			return this.acquire();
		}

		this.timestamps.push(now);
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

/**
 * HTTP client for the Second Brain Digest API
 */
export class ApiClient {
	private config: ApiClientConfig;
	private rateLimiter: RateLimiter;

	constructor(config: ApiClientConfig) {
		this.config = config;
		this.rateLimiter = new RateLimiter(10, 1000); // 10 requests per second
	}

	/**
	 * Update client configuration
	 */
	updateConfig(config: Partial<ApiClientConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get current sync status from server
	 */
	async getStatus(): Promise<StatusResponse> {
		return this.request<StatusResponse>('GET', '/api/vault/status');
	}

	/**
	 * Sync a batch of notes to server
	 */
	async syncNotes(request: SyncRequest): Promise<SyncResponse> {
		return this.request<SyncResponse>('POST', '/api/vault/sync', request);
	}

	/**
	 * Delete notes from server
	 */
	async deleteNotes(request: DeleteRequest): Promise<DeleteResponse> {
		return this.request<DeleteResponse>('POST', '/api/vault/delete', request);
	}

	/**
	 * Get current exclusion rules
	 */
	async getExclusions(): Promise<GetExclusionsResponse> {
		return this.request<GetExclusionsResponse>('GET', '/api/vault/exclusions');
	}

	/**
	 * Update exclusion rules
	 */
	async updateExclusions(request: ExclusionsRequest): Promise<ExclusionsResponse> {
		return this.request<ExclusionsResponse>('PUT', '/api/vault/exclusions', request);
	}

	/**
	 * Test connection to server
	 */
	async testConnection(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.getStatus();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Make an authenticated API request with retry logic
	 */
	private async request<T>(
		method: string,
		path: string,
		body?: unknown,
		retries: number = 3
	): Promise<T> {
		await this.rateLimiter.acquire();

		const url = this.buildUrl(path);
		const headers: Record<string, string> = {
			'Authorization': `Token ${this.config.apiToken}`,
			'Content-Type': 'application/json',
		};

		const params: RequestUrlParam = {
			url,
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		};

		if (this.config.debugMode) {
			console.log(`[SecondBrain] ${method} ${path}`, body);
		}

		let lastError: Error | null = null;
		let delay = 1000; // Start with 1 second delay

		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				const response = await requestUrl(params);

				if (this.config.debugMode) {
					console.log(`[SecondBrain] Response:`, response.status, response.json);
				}

				if (response.status >= 200 && response.status < 300) {
					return response.json as T;
				}

				// Handle error responses
				const errorData = response.json as ApiError;
				throw new ApiRequestError(
					errorData.error || `HTTP ${response.status}`,
					response.status,
					errorData.code,
					errorData.details
				);
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				// Don't retry on client errors (4xx) except rate limiting (429)
				if (error instanceof ApiRequestError) {
					if (error.status >= 400 && error.status < 500 && error.status !== 429) {
						throw error;
					}
				}

				// Retry with exponential backoff
				if (attempt < retries) {
					if (this.config.debugMode) {
						console.log(`[SecondBrain] Retry ${attempt + 1}/${retries} after ${delay}ms`);
					}
					await this.sleep(delay);
					delay = Math.min(delay * 2, 30000); // Max 30 seconds
				}
			}
		}

		throw lastError || new Error('Request failed after retries');
	}

	private buildUrl(path: string): string {
		const base = this.config.serverUrl.replace(/\/$/, '');
		return `${base}${path}`;
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

/**
 * Custom error class for API request errors
 */
export class ApiRequestError extends Error {
	readonly status: number;
	readonly code: string;
	readonly details?: Record<string, string[]>;

	constructor(
		message: string,
		status: number,
		code?: string,
		details?: Record<string, string[]>
	) {
		super(message);
		this.name = 'ApiRequestError';
		this.status = status;
		this.code = code || 'unknown_error';
		this.details = details;
	}
}
