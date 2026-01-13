/**
 * Storage adapter interface
 * Defines the contract for all storage implementations
 */

import type { StoredConfig, ProxyNode, GenerateOptions } from '../types';

/**
 * Storage adapter interface
 * All storage implementations must implement this interface
 */
export interface StorageAdapter {
  /**
   * Get a stored configuration by ID
   */
  get(id: string): Promise<StoredConfig | null>;

  /**
   * Store a configuration
   */
  set(id: string, config: StoredConfig): Promise<void>;

  /**
   * Delete a configuration by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * List all configuration IDs (for debugging)
   */
  list(): Promise<string[]>;

  /**
   * Get storage stats
   */
  getStats(): Promise<{ count: number; oldestAt: number | null }>;
}

/**
 * Config expiration time (24 hours)
 */
export const CONFIG_TTL = 24 * 60 * 60 * 1000;

/**
 * Generate a unique config ID
 */
export function generateConfigId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Create a StoredConfig object
 */
export function createStoredConfig(
  id: string,
  nodes: ProxyNode[],
  options: GenerateOptions = {}
): StoredConfig {
  const now = Date.now();
  return {
    id,
    nodes,
    options,
    createdAt: now,
    expiresAt: now + CONFIG_TTL,
  };
}
