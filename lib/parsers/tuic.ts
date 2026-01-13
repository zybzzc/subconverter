/**
 * TUIC URI parser
 * Format: tuic://uuid:password@server:port?params#name
 */

import type { ProxyNode } from '../types';

/** TUIC node type alias */
type TuicNode = ProxyNode;

/**
 * Parse a TUIC URI
 */
export function parseTuicUri(uri: string): TuicNode {
  if (!uri.startsWith('tuic://')) {
    throw new Error('Invalid TUIC URI: must start with tuic://');
  }

  const content = uri.slice(7); // Remove "tuic://"

  // Split fragment (node name)
  const hashIndex = content.indexOf('#');
  const mainPart = hashIndex >= 0 ? content.slice(0, hashIndex) : content;
  const fragment = hashIndex >= 0 ? content.slice(hashIndex + 1) : '';
  const name = fragment ? decodeURIComponent(fragment) : 'Unnamed TUIC';

  // Split query string
  const queryIndex = mainPart.indexOf('?');
  const hostPart = queryIndex >= 0 ? mainPart.slice(0, queryIndex) : mainPart;
  const queryString = queryIndex >= 0 ? mainPart.slice(queryIndex + 1) : '';

  // Parse uuid:password@server:port
  const atIndex = hostPart.lastIndexOf('@');
  if (atIndex < 0) {
    throw new Error('Invalid TUIC URI: missing @ separator');
  }

  const userPart = hostPart.slice(0, atIndex);
  const serverPort = hostPart.slice(atIndex + 1);

  // Split uuid:password
  const colonIndex = userPart.indexOf(':');
  if (colonIndex < 0) {
    throw new Error('Invalid TUIC URI: missing uuid:password separator');
  }

  const uuid = userPart.slice(0, colonIndex);
  const password = decodeURIComponent(userPart.slice(colonIndex + 1));

  const { server, port } = parseServerPort(serverPort);

  // Parse query parameters
  const params = new URLSearchParams(queryString);

  const node: TuicNode = {
    name,
    type: 'tuic',
    server,
    port,
    uuid,
    password,
  };

  // SNI
  const sni = params.get('sni');
  if (sni) {
    node.sni = sni;
  }

  // Congestion controller
  const cc = params.get('congestion_control') || params.get('congestion-control');
  if (cc) {
    node['congestion-controller'] = cc;
  }

  // Reduce RTT
  const reduceRtt = params.get('reduce_rtt') || params.get('reduce-rtt');
  if (reduceRtt === '1' || reduceRtt === 'true') {
    node['reduce-rtt'] = true;
  }

  // Skip cert verify
  const allowInsecure = params.get('allow_insecure') || params.get('allowInsecure') || params.get('insecure');
  if (allowInsecure === '1' || allowInsecure === 'true') {
    node['skip-cert-verify'] = true;
  }

  // ALPN
  const alpn = params.get('alpn');
  if (alpn) {
    node.alpn = alpn.split(',');
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
