/**
 * Storage factory and exports
 * Provides a unified interface for storage operations
 */

import type { StoredConfig, ProxyNode, GenerateOptions } from '../types';
import type { StorageAdapter } from './types';
import { MemoryAdapter } from './memory';
import { CloudflareKVAdapter, type KVNamespace } from './cloudflare-kv';
import { generateConfigId, createStoredConfig, CONFIG_TTL } from './types';

// Re-export types and utilities
export type { StorageAdapter } from './types';
export type { KVNamespace } from './cloudflare-kv';
export { generateConfigId, createStoredConfig, CONFIG_TTL };

/**
 * Cloudflare environment bindings
 */
export interface CloudflareEnv {
  SUBCONVERTER_KV?: KVNamespace;
}

/**
 * Singleton memory adapter for development
 */
let memoryAdapterInstance: MemoryAdapter | null = null;

function getMemoryAdapter(): MemoryAdapter {
  if (!memoryAdapterInstance) {
    memoryAdapterInstance = new MemoryAdapter();
  }
  return memoryAdapterInstance;
}

/**
 * Get storage adapter based on environment
 * 
 * @param env - Cloudflare environment bindings (optional)
 * @returns Storage adapter instance
 */
export function getStorage(env?: CloudflareEnv): StorageAdapter {
  // If KV namespace is available, use Cloudflare KV
  if (env?.SUBCONVERTER_KV) {
    return new CloudflareKVAdapter(env.SUBCONVERTER_KV);
  }

  // Fallback to memory storage (development)
  return getMemoryAdapter();
}

/**
 * Helper: Store a configuration
 * 
 * Convenience function that generates ID and creates the config object
 */
export async function storeConfig(
  storage: StorageAdapter,
  nodes: ProxyNode[],
  options: GenerateOptions = {}
): Promise<StoredConfig> {
  const id = generateConfigId();
  const config = createStoredConfig(id, nodes, options);

  await storage.set(id, config);

  return config;
}

/**
 * Helper: Get a configuration
 */
export async function getConfig(
  storage: StorageAdapter,
  id: string
): Promise<StoredConfig | null> {
  return storage.get(id);
}

/**
 * Helper: Delete a configuration
 */
export async function deleteConfig(
  storage: StorageAdapter,
  id: string
): Promise<boolean> {
  return storage.delete(id);
}
