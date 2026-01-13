/**
 * Cloudflare KV storage adapter
 * Used for production deployment on Cloudflare Pages
 */

import type { StoredConfig } from '../types';
import type { StorageAdapter } from './types';

/**
 * Cloudflare KV Namespace type
 * This type matches the Cloudflare Workers KV API
 */
export interface KVNamespace {
  get(key: string, options?: { type: 'text' }): Promise<string | null>;
  get(key: string, options: { type: 'json' }): Promise<unknown>;
  get(key: string, options: { type: 'arrayBuffer' }): Promise<ArrayBuffer | null>;
  get(key: string, options: { type: 'stream' }): Promise<ReadableStream | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number; expiration?: number; metadata?: unknown }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: unknown }[]; list_complete: boolean; cursor?: string }>;
}

/**
 * Key prefix for stored configs
 */
const KEY_PREFIX = 'config:';

/**
 * Cloudflare KV storage adapter implementation
 */
export class CloudflareKVAdapter implements StorageAdapter {
  constructor(private kv: KVNamespace) { }

  async get(id: string): Promise<StoredConfig | null> {
    try {
      const data = await this.kv.get(`${KEY_PREFIX}${id}`, { type: 'json' });

      if (!data) return null;

      const config = data as StoredConfig;

      // Check if expired (KV TTL should handle this, but double-check)
      if (Date.now() > config.expiresAt) {
        await this.delete(id);
        return null;
      }

      return config;
    } catch (error) {
      console.error(`[KV] Error getting config ${id}:`, error);
      return null;
    }
  }

  async set(id: string, config: StoredConfig): Promise<void> {
    try {
      // Calculate TTL in seconds
      const ttlSeconds = Math.max(
        Math.floor((config.expiresAt - Date.now()) / 1000),
        60 // Minimum 60 seconds
      );

      await this.kv.put(
        `${KEY_PREFIX}${id}`,
        JSON.stringify(config),
        { expirationTtl: ttlSeconds }
      );

      console.log(`[KV] Stored config ${id} with TTL ${ttlSeconds}s`);
    } catch (error) {
      console.error(`[KV] Error setting config ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.kv.delete(`${KEY_PREFIX}${id}`);
      return true;
    } catch (error) {
      console.error(`[KV] Error deleting config ${id}:`, error);
      return false;
    }
  }

  async list(): Promise<string[]> {
    try {
      const result = await this.kv.list({ prefix: KEY_PREFIX, limit: 1000 });
      return result.keys.map(key => key.name.replace(KEY_PREFIX, ''));
    } catch (error) {
      console.error('[KV] Error listing configs:', error);
      return [];
    }
  }

  async getStats(): Promise<{ count: number; oldestAt: number | null }> {
    try {
      const ids = await this.list();

      if (ids.length === 0) {
        return { count: 0, oldestAt: null };
      }

      // For KV, we can't easily get the oldest without fetching all configs
      // Just return the count for now
      return {
        count: ids.length,
        oldestAt: null, // Would need to fetch all configs to determine this
      };
    } catch (error) {
      console.error('[KV] Error getting stats:', error);
      return { count: 0, oldestAt: null };
    }
  }
}
