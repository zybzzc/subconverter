/**
 * In-memory storage adapter
 * Used for development and testing
 */

import type { StoredConfig } from '../types';
import type { StorageAdapter } from './types';
import { CONFIG_TTL } from './types';

/**
 * In-memory storage using Map
 * Using globalThis to persist across hot reloads in development
 */
const globalForStorage = globalThis as unknown as {
  configStore: Map<string, StoredConfig> | undefined;
};

const configStore = globalForStorage.configStore ?? new Map<string, StoredConfig>();

if (process.env.NODE_ENV !== 'production') {
  globalForStorage.configStore = configStore;
}

/**
 * Memory storage adapter implementation
 */
export class MemoryAdapter implements StorageAdapter {
  async get(id: string): Promise<StoredConfig | null> {
    const config = configStore.get(id);

    if (!config) return null;

    // Check if expired
    if (Date.now() > config.expiresAt) {
      configStore.delete(id);
      return null;
    }

    return config;
  }

  async set(id: string, config: StoredConfig): Promise<void> {
    configStore.set(id, config);

    // Clean up expired configs
    this.cleanupExpired();
  }

  async delete(id: string): Promise<boolean> {
    return configStore.delete(id);
  }

  async list(): Promise<string[]> {
    return Array.from(configStore.keys());
  }

  async getStats(): Promise<{ count: number; oldestAt: number | null }> {
    let oldestAt: number | null = null;

    for (const config of configStore.values()) {
      if (oldestAt === null || config.createdAt < oldestAt) {
        oldestAt = config.createdAt;
      }
    }

    return {
      count: configStore.size,
      oldestAt,
    };
  }

  /**
   * Clean up expired configurations
   */
  private cleanupExpired(): void {
    const now = Date.now();

    for (const [id, config] of configStore.entries()) {
      if (now > config.expiresAt) {
        configStore.delete(id);
      }
    }
  }
}
