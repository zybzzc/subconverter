/**
 * VLESS URI parser
 * Format: vless://uuid@server:port?params#name
 */

import type { ProxyNode } from '../types';

/** VLess node type alias */
type VLessNode = ProxyNode;

/**
 * Parse a VLESS URI
 */
export function parseVLessUri(uri: string): VLessNode {
  if (!uri.startsWith('vless://')) {
    throw new Error('Invalid VLESS URI: must start with vless://');
  }

  const content = uri.slice(8); // Remove "vless://"

  // Split fragment (node name)
  const hashIndex = content.indexOf('#');
  const mainPart = hashIndex >= 0 ? content.slice(0, hashIndex) : content;
  const fragment = hashIndex >= 0 ? content.slice(hashIndex + 1) : '';
  const name = fragment ? decodeURIComponent(fragment) : 'Unnamed VLESS';

  // Split query string
  const queryIndex = mainPart.indexOf('?');
  const hostPart = queryIndex >= 0 ? mainPart.slice(0, queryIndex) : mainPart;
  const queryString = queryIndex >= 0 ? mainPart.slice(queryIndex + 1) : '';

  // Parse uuid@server:port
  const atIndex = hostPart.indexOf('@');
  if (atIndex < 0) {
    throw new Error('Invalid VLESS URI: missing @ separator');
  }

  const uuid = hostPart.slice(0, atIndex);
  const serverPort = hostPart.slice(atIndex + 1);
  const { server, port } = parseServerPort(serverPort);

  // Parse query parameters
  const params = new URLSearchParams(queryString);

  const node: VLessNode = {
    name,
    type: 'vless',
    server,
    port,
    uuid,
  };

  // Flow
  const flow = params.get('flow');
  if (flow) {
    node.flow = flow;
  }

  // TLS/Reality
  const security = params.get('security');
  if (security === 'tls' || security === 'reality') {
    node.tls = true;

    const sni = params.get('sni');
    if (sni) {
      node.servername = sni;
    }

    const fp = params.get('fp');
    const skipCert = params.get('allowInsecure');
    if (skipCert === '1' || skipCert === 'true') {
      node['skip-cert-verify'] = true;
    }

    // Reality options
    if (security === 'reality') {
      const pbk = params.get('pbk');
      const sid = params.get('sid');
      if (pbk) {
        node['reality-opts'] = {
          'public-key': pbk,
        };
        if (sid) {
          node['reality-opts']['short-id'] = sid;
        }
      }
    }
  }

  // Network type
  const type = params.get('type') || 'tcp';
  if (type !== 'tcp') {
    node.network = type as VLessNode['network'];
  }

  // WebSocket options
  if (type === 'ws') {
    const path = params.get('path');
    const host = params.get('host');
    if (path || host) {
      node['ws-opts'] = {};
      if (path) {
        node['ws-opts'].path = decodeURIComponent(path);
      }
      if (host) {
        node['ws-opts'].headers = { Host: host };
      }
    }
  }

  // gRPC options
  if (type === 'grpc') {
    const serviceName = params.get('serviceName');
    if (serviceName) {
      node['grpc-opts'] = {
        'grpc-service-name': serviceName,
      };
    }
  }

  return node;
}

/**
 * Parse server:port string, handling IPv6 addresses
 */
function parseServerPort(str: string): { server: string; port: number } {
  // Handle IPv6 [::1]:port
  if (str.startsWith('[')) {
    const closeBracket = str.indexOf(']');
    if (closeBracket < 0) {
      throw new Error('Invalid server address: unclosed IPv6 bracket');
    }
    const server = str.slice(1, closeBracket);
    const portStr = str.slice(closeBracket + 2);
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${portStr}`);
    }
    return { server, port };
  }

  // IPv4 or hostname
  const lastColon = str.lastIndexOf(':');
  if (lastColon < 0) {
    throw new Error('Invalid server address: missing port');
  }

  const server = str.slice(0, lastColon);
  const port = parseInt(str.slice(lastColon + 1), 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${str.slice(lastColon + 1)}`);
  }

  return { server, port };
}
