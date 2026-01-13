/**
 * Storage module - backward compatibility re-exports
 * 
 * This file maintains backward compatibility with existing imports.
 * All new code should import from '@/lib/storage/index' directly.
 * 
 * @deprecated Import from '@/lib/storage/index' instead
 */

// Re-export everything from the new storage module
export {
  getStorage,
  storeConfig,
  getConfig,
  deleteConfig,
  generateConfigId,
  createStoredConfig,
  CONFIG_TTL,
  type StorageAdapter,
  type CloudflareEnv,
  type KVNamespace,
} from './storage/index';
