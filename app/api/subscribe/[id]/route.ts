/**
 * API: Subscription output
 * GET /api/subscribe/[id]
 * 
 * Returns Clash Meta YAML configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';
import { getStorage, getConfig } from '@/lib/storage';
import { generateClashConfig } from '@/lib/clash/generator';

// Enable Edge Runtime for Cloudflare compatibility
export const runtime = 'edge';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get Cloudflare env from request context
 * In Cloudflare Workers, env is available via process.env at runtime
 */
function getCloudflareEnv(): { SUBCONVERTER_KV?: any } | undefined {
  // @ts-ignore - Cloudflare Workers inject env at runtime
  if (typeof process !== 'undefined' && process.env?.SUBCONVERTER_KV) {
    // @ts-ignore
    return { SUBCONVERTER_KV: process.env.SUBCONVERTER_KV };
  }
  return undefined;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return new NextResponse('Missing subscription ID', { status: 400 });
    }

    // Get storage adapter based on environment
    const storage = getStorage(getCloudflareEnv());

    // Get stored config
    const stored = await getConfig(storage, id);

    if (!stored) {
      return new NextResponse('Subscription not found or expired', { status: 404 });
    }

    // Generate Clash config
    const config = await generateClashConfig(stored.nodes, stored.options);

    // Convert to YAML
    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true,
      sortKeys: false,
    });

    console.log(`[Subscribe] Serving subscription ${id} with ${stored.nodes.length} nodes`);

    // Return as YAML with appropriate headers
    return new NextResponse(yamlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Content-Disposition': `attachment; filename="clash-config-${id}.yaml"`,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Subscription-Nodes': String(stored.nodes.length),
        'X-Subscription-Expires': new Date(stored.expiresAt).toISOString(),
      },
    });

  } catch (error) {
    console.error('[Subscribe] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Failed to generate config: ${message}`, { status: 500 });
  }
}
