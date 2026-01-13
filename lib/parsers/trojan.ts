/**
 * Trojan URI parser
 * Format: trojan://password@server:port?params#name
 */

import type { ProxyNode } from '../types';

/** Trojan node type alias */
type TrojanNode = ProxyNode;

/**
 * Parse a Trojan URI
 */
export function parseTrojanUri(uri: string): TrojanNode {
  if (!uri.startsWith('trojan://')) {
    throw new Error('Invalid Trojan URI: must start with trojan://');
  }

  const content = uri.slice(9); // Remove "trojan://"

  // Split fragment (node name)
  const hashIndex = content.indexOf('#');
  const mainPart = hashIndex >= 0 ? content.slice(0, hashIndex) : content;
  const fragment = hashIndex >= 0 ? content.slice(hashIndex + 1) : '';
  const name = fragment ? decodeURIComponent(fragment) : 'Unnamed Trojan';

  // Split query string
  const queryIndex = mainPart.indexOf('?');
  const hostPart = queryIndex >= 0 ? mainPart.slice(0, queryIndex) : mainPart;
  const queryString = queryIndex >= 0 ? mainPart.slice(queryIndex + 1) : '';

  // Parse password@server:port
  const atIndex = hostPart.indexOf('@');
  if (atIndex < 0) {
    throw new Error('Invalid Trojan URI: missing @ separator');
  }

  const password = decodeURIComponent(hostPart.slice(0, atIndex));
  const serverPort = hostPart.slice(atIndex + 1);
  const { server, port } = parseServerPort(serverPort);

  // Parse query parameters
  const params = new URLSearchParams(queryString);

  const node: TrojanNode = {
    name,
    type: 'trojan',
    server,
    port,
    password,
  };

  // SNI
  const sni = params.get('sni') || params.get('peer');
  if (sni) {
    node.sni = sni;
  }

  // Skip cert verify
  const allowInsecure = params.get('allowInsecure');
  if (allowInsecure === '1' || allowInsecure === 'true') {
    node['skip-cert-verify'] = true;
  }

  // ALPN
  const alpn = params.get('alpn');
  if (alpn) {
    node.alpn = alpn.split(',');
  }

  // Network type
  const type = params.get('type');
  if (type === 'ws' || type === 'grpc') {
    node.network = type;

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

    if (type === 'grpc') {
      const serviceName = params.get('serviceName');
      if (serviceName) {
        node['grpc-opts'] = {
          'grpc-service-name': serviceName,
        };
      }
    }
  }

  return node;
}

/**
 * Parse server:port string, handling IPv6 addresses
 */
function parseServerPort(str: string): { server: string; port: number } {
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
