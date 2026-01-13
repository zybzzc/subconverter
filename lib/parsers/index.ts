/**
 * Node parser entry point
 * Handles subscription content parsing and protocol detection
 */

import type { ProxyNode } from '../types';
import { autoDecodeContent } from './base64';

/** Result from parsing subscription content */
interface FetchResult {
  nodes: ProxyNode[];
  errors: string[];
  rawCount: number;
  parsedCount: number;
}
import { parseSSUri } from './ss';
import { parseVMessUri } from './vmess';
import { parseVLessUri } from './vless';
import { parseTrojanUri } from './trojan';
import { parseHysteria2Uri } from './hysteria2';
import { parseTuicUri } from './tuic';
import { isClashYaml, parseClashYaml } from './clash';

/** Protocol prefix to parser mapping */
const PROTOCOL_PARSERS: Record<string, (uri: string) => ProxyNode> = {
  'ss://': parseSSUri,
  'vmess://': parseVMessUri,
  'vless://': parseVLessUri,
  'trojan://': parseTrojanUri,
  'hysteria2://': parseHysteria2Uri,
  'hy2://': parseHysteria2Uri,
  'tuic://': parseTuicUri,
};

/**
 * Parse a single node URI
 */
export function parseNodeUri(uri: string): ProxyNode {
  const trimmed = uri.trim();

  for (const [prefix, parser] of Object.entries(PROTOCOL_PARSERS)) {
    if (trimmed.startsWith(prefix)) {
      return parser(trimmed);
    }
  }

  throw new Error(`Unsupported protocol: ${trimmed.slice(0, 20)}...`);
}

/**
 * Parse subscription content (may contain multiple nodes)
 * 
 * Supports:
 * - Base64 encoded node list
 * - Plain text node list (one URI per line)
 * - Clash/Clash Meta YAML config
 * 
 * @param content - Raw subscription content (may be base64 encoded)
 * @param prefix - Optional prefix to add to node names
 */
export function parseSubscriptionContent(
  content: string,
  prefix?: string
): FetchResult {
  const nodes: ProxyNode[] = [];
  const errors: string[] = [];

  // Auto-decode base64 if needed
  const decoded = autoDecodeContent(content);

  // Check if it's a Clash YAML config
  if (isClashYaml(decoded)) {
    console.log('[Parser] Detected Clash YAML format');
    const result = parseClashYaml(decoded, prefix);
    return {
      nodes: result.nodes,
      errors: result.errors,
      rawCount: result.nodes.length + result.errors.length,
      parsedCount: result.nodes.length,
    };
  }

  // Otherwise, parse as line-separated URIs
  const lines = decoded.split(/[\r\n]+/).filter(line => line.trim());
  const rawCount = lines.length;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    try {
      const node = parseNodeUri(trimmed);

      // Add prefix to node name if specified
      if (prefix) {
        node.name = `${prefix} ${node.name}`;
      }

      nodes.push(node);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`Failed to parse: ${trimmed.slice(0, 50)}... - ${message}`);
    }
  }

  return {
    nodes,
    errors,
    rawCount,
    parsedCount: nodes.length,
  };
}

/**
 * Parse multiple node URIs from text input
 */
export function parseManualNodes(input: string, prefix?: string): FetchResult {
  return parseSubscriptionContent(input, prefix);
}

/**
 * Detect if a string looks like a valid proxy URI
 */
export function isValidProxyUri(str: string): boolean {
  const trimmed = str.trim();
  return Object.keys(PROTOCOL_PARSERS).some(prefix => trimmed.startsWith(prefix));
}

/**
 * Get supported protocol prefixes
 */
export function getSupportedProtocols(): string[] {
  return Object.keys(PROTOCOL_PARSERS);
}

// Re-export individual parsers
export { parseSSUri } from './ss';
export { parseVMessUri } from './vmess';
export { parseVLessUri } from './vless';
export { parseTrojanUri } from './trojan';
export { parseHysteria2Uri } from './hysteria2';
export { parseTuicUri } from './tuic';
export { isBase64, decodeBase64, autoDecodeContent } from './base64';
