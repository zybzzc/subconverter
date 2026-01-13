/**
 * Clash YAML configuration parser
 * Extracts proxy nodes from Clash/Clash Meta config files
 */

import yaml from 'js-yaml';
import type { ProxyNode } from '../types';

/** Supported proxy types */
type ProxyType = 'ss' | 'vmess' | 'vless' | 'trojan' | 'hysteria2' | 'tuic';

/** Clash proxy node structure (from YAML) */
interface ClashProxy {
  name: string;
  type: string;
  server: string;
  port: number;
  [key: string]: unknown;
}

/** Clash config structure */
interface ClashConfig {
  proxies?: ClashProxy[];
  'proxy-groups'?: unknown[];
  rules?: string[];
  [key: string]: unknown;
}

/**
 * Check if content looks like a Clash YAML config
 */
export function isClashYaml(content: string): boolean {
  const trimmed = content.trim();

  // Quick checks for common Clash config patterns
  if (trimmed.startsWith('proxies:')) return true;
  if (trimmed.includes('\nproxies:')) return true;
  if (trimmed.includes('mixed-port:') || trimmed.includes('port:')) return true;
  if (trimmed.includes('proxy-groups:')) return true;

  return false;
}

/**
 * Parse Clash YAML config and extract proxy nodes
 */
export function parseClashYaml(content: string, prefix?: string): {
  nodes: ProxyNode[];
  errors: string[];
} {
  const nodes: ProxyNode[] = [];
  const errors: string[] = [];

  try {
    const config = yaml.load(content) as ClashConfig;

    if (!config || typeof config !== 'object') {
      errors.push('Invalid YAML: not an object');
      return { nodes, errors };
    }

    const proxies = config.proxies;

    if (!proxies || !Array.isArray(proxies)) {
      errors.push('No proxies found in Clash config');
      return { nodes, errors };
    }

    for (const proxy of proxies) {
      try {
        const node = convertClashProxy(proxy, prefix);
        if (node) {
          nodes.push(node);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        errors.push(`Failed to convert proxy "${proxy.name}": ${message}`);
      }
    }

  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    errors.push(`YAML parse error: ${message}`);
  }

  return { nodes, errors };
}

/**
 * Convert a Clash proxy object to our ProxyNode type
 */
function convertClashProxy(proxy: ClashProxy, prefix?: string): ProxyNode | null {
  if (!proxy.name || !proxy.type || !proxy.server || !proxy.port) {
    return null;
  }

  const type = proxy.type.toLowerCase() as ProxyType;
  const name = prefix ? `${prefix} ${proxy.name}` : proxy.name;

  // Base node
  const base = {
    name,
    server: proxy.server,
    port: proxy.port,
  };

  switch (type) {
    case 'ss':
      return {
        ...base,
        type: 'ss',
        cipher: (proxy.cipher as string) || 'aes-256-gcm',
        password: proxy.password as string,
        udp: proxy.udp as boolean | undefined,
        plugin: proxy.plugin as string | undefined,
        'plugin-opts': proxy['plugin-opts'] as Record<string, unknown> | undefined,
      };

    case 'vmess':
      return {
        ...base,
        type: 'vmess',
        uuid: proxy.uuid as string,
        alterId: (proxy.alterId as number) || 0,
        cipher: (proxy.cipher as string) || 'auto',
        tls: proxy.tls as boolean | undefined,
        'skip-cert-verify': proxy['skip-cert-verify'] as boolean | undefined,
        servername: proxy.servername as string | undefined,
        network: proxy.network as 'ws' | 'grpc' | 'h2' | 'http' | undefined,
        'ws-opts': proxy['ws-opts'] as { path?: string; headers?: Record<string, string> } | undefined,
        'grpc-opts': proxy['grpc-opts'] as { 'grpc-service-name'?: string } | undefined,
        'h2-opts': proxy['h2-opts'] as { host?: string[]; path?: string } | undefined,
      };

    case 'vless':
      return {
        ...base,
        type: 'vless',
        uuid: proxy.uuid as string,
        flow: proxy.flow as string | undefined,
        tls: proxy.tls as boolean | undefined,
        'skip-cert-verify': proxy['skip-cert-verify'] as boolean | undefined,
        servername: proxy.servername as string | undefined,
        network: proxy.network as 'ws' | 'grpc' | 'h2' | 'tcp' | undefined,
        'reality-opts': proxy['reality-opts'] as { 'public-key'?: string; 'short-id'?: string } | undefined,
        'ws-opts': proxy['ws-opts'] as { path?: string; headers?: Record<string, string> } | undefined,
        'grpc-opts': proxy['grpc-opts'] as { 'grpc-service-name'?: string } | undefined,
      };

    case 'trojan':
      return {
        ...base,
        type: 'trojan',
        password: proxy.password as string,
        sni: proxy.sni as string | undefined,
        'skip-cert-verify': proxy['skip-cert-verify'] as boolean | undefined,
        alpn: proxy.alpn as string[] | undefined,
        network: proxy.network as 'ws' | 'grpc' | undefined,
        'ws-opts': proxy['ws-opts'] as { path?: string; headers?: Record<string, string> } | undefined,
        'grpc-opts': proxy['grpc-opts'] as { 'grpc-service-name'?: string } | undefined,
      };

    case 'hysteria2':
      return {
        ...base,
        type: 'hysteria2',
        password: (proxy.password || proxy.auth) as string,
        obfs: proxy.obfs as string | undefined,
        'obfs-password': proxy['obfs-password'] as string | undefined,
        sni: proxy.sni as string | undefined,
        'skip-cert-verify': proxy['skip-cert-verify'] as boolean | undefined,
        alpn: proxy.alpn as string[] | undefined,
        up: proxy.up as string | undefined,
        down: proxy.down as string | undefined,
      };

    case 'tuic':
      return {
        ...base,
        type: 'tuic',
        uuid: proxy.uuid as string,
        password: proxy.password as string,
        'congestion-controller': proxy['congestion-controller'] as string | undefined,
        'reduce-rtt': proxy['reduce-rtt'] as boolean | undefined,
        sni: proxy.sni as string | undefined,
        'skip-cert-verify': proxy['skip-cert-verify'] as boolean | undefined,
        alpn: proxy.alpn as string[] | undefined,
      };

    default:
      // Unsupported type, skip
      return null;
  }
}
