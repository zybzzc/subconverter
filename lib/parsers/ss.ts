/**
 * Shadowsocks URI parser
 * Supports both SIP002 and legacy formats
 */

import type { ProxyNode } from '../types';
import { decodeBase64 } from './base64';

/** SS node type alias */
type SSNode = ProxyNode;

/**
 * Parse a Shadowsocks URI
 * 
 * SIP002 format: ss://BASE64(method:password)@server:port#name
 * Legacy format: ss://BASE64(method:password@server:port)#name
 */
export function parseSSUri(uri: string): SSNode {
  if (!uri.startsWith('ss://')) {
    throw new Error('Invalid SS URI: must start with ss://');
  }

  const content = uri.slice(5); // Remove "ss://"

  // Split fragment (node name)
  const [mainPart, fragment] = content.split('#');
  const name = fragment ? decodeURIComponent(fragment) : 'Unnamed SS';

  // Try SIP002 format first: BASE64(method:password)@server:port
  const atIndex = mainPart.lastIndexOf('@');

  if (atIndex > 0) {
    // SIP002 format
    const userInfo = mainPart.slice(0, atIndex);
    const serverPart = mainPart.slice(atIndex + 1);

    // Decode userinfo
    let decoded: string;
    try {
      decoded = decodeBase64(userInfo);
    } catch {
      // Maybe it's URL-encoded
      decoded = decodeURIComponent(userInfo);
    }

    const colonIndex = decoded.indexOf(':');
    if (colonIndex < 0) {
      throw new Error('Invalid SS URI: missing cipher:password separator');
    }

    const cipher = decoded.slice(0, colonIndex);
    const password = decoded.slice(colonIndex + 1);

    // Parse server:port
    const { server, port } = parseServerPort(serverPart);

    return {
      name,
      type: 'ss',
      server,
      port,
      cipher,
      password,
      udp: true,
    };
  } else {
    // Legacy format: BASE64(method:password@server:port)
    let decoded: string;
    try {
      decoded = decodeBase64(mainPart);
    } catch {
      throw new Error('Invalid SS URI: failed to decode base64');
    }

    // Parse method:password@server:port
    const atIdx = decoded.lastIndexOf('@');
    if (atIdx < 0) {
      throw new Error('Invalid SS URI: missing @ separator in decoded content');
    }

    const userPart = decoded.slice(0, atIdx);
    const serverPart = decoded.slice(atIdx + 1);

    const colonIndex = userPart.indexOf(':');
    if (colonIndex < 0) {
      throw new Error('Invalid SS URI: missing cipher:password separator');
    }

    const cipher = userPart.slice(0, colonIndex);
    const password = userPart.slice(colonIndex + 1);

    const { server, port } = parseServerPort(serverPart);

    return {
      name,
      type: 'ss',
      server,
      port,
      cipher,
      password,
      udp: true,
    };
  }
}

/**
 * Parse server:port string, handling IPv6 addresses
 */
function parseServerPort(str: string): { server: string; port: number } {
  // Remove query string if present
  const [hostPort] = str.split('?');

  // Handle IPv6 [::1]:port
  if (hostPort.startsWith('[')) {
    const closeBracket = hostPort.indexOf(']');
    if (closeBracket < 0) {
      throw new Error('Invalid server address: unclosed IPv6 bracket');
    }
    const server = hostPort.slice(1, closeBracket);
    const portStr = hostPort.slice(closeBracket + 2); // Skip ]:
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${portStr}`);
    }
    return { server, port };
  }

  // IPv4 or hostname
  const lastColon = hostPort.lastIndexOf(':');
  if (lastColon < 0) {
    throw new Error('Invalid server address: missing port');
  }

  const server = hostPort.slice(0, lastColon);
  const port = parseInt(hostPort.slice(lastColon + 1), 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${hostPort.slice(lastColon + 1)}`);
  }

  return { server, port };
}
