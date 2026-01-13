/**
 * Hysteria2 URI parser
 * Format: hysteria2://password@server:port?params#name
 * Also supports: hy2://
 */

import type { ProxyNode } from '../types';

/** Hysteria2 specific node type */
type Hysteria2Node = ProxyNode & {
  type: 'hysteria2';
  password: string;
  sni?: string;
  obfs?: string;
  'obfs-password'?: string;
  'skip-cert-verify'?: boolean;
  alpn?: string[];
  up?: string;
  down?: string;
};

/**
 * Parse a Hysteria2 URI
 */
export function parseHysteria2Uri(uri: string): Hysteria2Node {
  let content: string;

  if (uri.startsWith('hysteria2://')) {
    content = uri.slice(12);
  } else if (uri.startsWith('hy2://')) {
    content = uri.slice(6);
  } else {
    throw new Error('Invalid Hysteria2 URI: must start with hysteria2:// or hy2://');
  }

  // Split fragment (node name)
  const hashIndex = content.indexOf('#');
  const mainPart = hashIndex >= 0 ? content.slice(0, hashIndex) : content;
  const fragment = hashIndex >= 0 ? content.slice(hashIndex + 1) : '';
  const name = fragment ? decodeURIComponent(fragment) : 'Unnamed Hysteria2';

  // Split query string
  const queryIndex = mainPart.indexOf('?');
  const hostPart = queryIndex >= 0 ? mainPart.slice(0, queryIndex) : mainPart;
  const queryString = queryIndex >= 0 ? mainPart.slice(queryIndex + 1) : '';

  // Parse password@server:port (password is optional)
  const atIndex = hostPart.lastIndexOf('@');
  let password = '';
  let serverPort: string;

  if (atIndex >= 0) {
    password = decodeURIComponent(hostPart.slice(0, atIndex));
    serverPort = hostPart.slice(atIndex + 1);
  } else {
    serverPort = hostPart;
  }

  const { server, port } = parseServerPort(serverPort);

  // Parse query parameters
  const params = new URLSearchParams(queryString);

  // Password can also be in query params
  if (!password) {
    password = params.get('password') || params.get('auth') || '';
  }

  const node: Hysteria2Node = {
    name,
    type: 'hysteria2',
    server,
    port,
    password,
  };

  // SNI
  const sni = params.get('sni');
  if (sni) {
    node.sni = sni;
  }

  // Skip cert verify
  const insecure = params.get('insecure');
  if (insecure === '1' || insecure === 'true') {
    node['skip-cert-verify'] = true;
  }

  // Obfuscation
  const obfs = params.get('obfs');
  if (obfs) {
    node.obfs = obfs;
    const obfsPassword = params.get('obfs-password');
    if (obfsPassword) {
      node['obfs-password'] = obfsPassword;
    }
  }

  // ALPN
  const alpn = params.get('alpn');
  if (alpn) {
    node.alpn = alpn.split(',');
  }

  // Bandwidth (optional)
  const up = params.get('up');
  const down = params.get('down');
  if (up) node.up = up;
  if (down) node.down = down;

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
