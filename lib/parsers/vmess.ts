/**
 * VMess URI parser
 * Format: vmess://BASE64(JSON)
 */

import type { ProxyNode } from '../types';
import { decodeBase64 } from './base64';

/** VMess node type alias */
type VMessNode = ProxyNode;

/** VMess JSON config structure */
interface VMessConfig {
  v?: string;
  ps?: string;      // Node name
  add: string;      // Server address
  port: number | string;
  id: string;       // UUID
  aid?: number | string;  // AlterID
  scy?: string;     // Security/cipher
  net?: string;     // Network type
  type?: string;    // Header type (for http)
  host?: string;    // HTTP/WS host
  path?: string;    // HTTP/WS path
  tls?: string;     // TLS ("tls" or "")
  sni?: string;     // Server Name Indication
  alpn?: string;    // ALPN
  fp?: string;      // Fingerprint
}

/**
 * Parse a VMess URI
 */
export function parseVMessUri(uri: string): VMessNode {
  if (!uri.startsWith('vmess://')) {
    throw new Error('Invalid VMess URI: must start with vmess://');
  }

  const base64Part = uri.slice(8); // Remove "vmess://"

  let config: VMessConfig;
  try {
    const jsonStr = decodeBase64(base64Part);
    config = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Invalid VMess URI: failed to decode/parse JSON - ${e}`);
  }

  // Validate required fields
  if (!config.add || !config.port || !config.id) {
    throw new Error('Invalid VMess config: missing required fields (add, port, id)');
  }

  const port = typeof config.port === 'string' ? parseInt(config.port, 10) : config.port;
  const alterId = typeof config.aid === 'string' ? parseInt(config.aid, 10) : (config.aid ?? 0);

  const node: VMessNode = {
    name: config.ps || 'Unnamed VMess',
    type: 'vmess',
    server: config.add,
    port,
    uuid: config.id,
    alterId,
    cipher: config.scy || 'auto',
  };

  // TLS settings
  if (config.tls === 'tls') {
    node.tls = true;
    if (config.sni) {
      node.servername = config.sni;
    }
  }

  // Network settings
  const network = config.net || 'tcp';
  if (network !== 'tcp') {
    node.network = network as VMessNode['network'];
  }

  // WebSocket options
  if (network === 'ws') {
    node['ws-opts'] = {};
    if (config.path) {
      node['ws-opts'].path = config.path;
    }
    if (config.host) {
      node['ws-opts'].headers = { Host: config.host };
    }
  }

  // gRPC options
  if (network === 'grpc') {
    if (config.path) {
      node['grpc-opts'] = {
        'grpc-service-name': config.path,
      };
    }
  }

  // HTTP/2 options
  if (network === 'h2') {
    node['h2-opts'] = {};
    if (config.path) {
      node['h2-opts'].path = config.path;
    }
    if (config.host) {
      node['h2-opts'].host = [config.host];
    }
  }

  return node;
}
