/**
 * API: Generate subscription configuration
 * POST /api/generate
 * 
 * Merges nodes and generates a subscription URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseSubscriptionContent, parseManualNodes } from '@/lib/parsers';
import { generateClashConfig } from '@/lib/clash/generator';
import { getStorage, storeConfig } from '@/lib/storage';
import type { ProxyNode, GenerateOptions, SubscriptionSource, EditableNode } from '@/lib/types';

// Enable Edge Runtime for Cloudflare compatibility
export const runtime = 'edge';

interface GenerateRequest {
  subscriptions?: SubscriptionSource[];
  manualNodes?: string;
  editedNodes?: EditableNode[];
  options?: GenerateOptions;
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

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // Get storage adapter based on environment
    const storage = getStorage(getCloudflareEnv());

    const allNodes: ProxyNode[] = [];
    const allErrors: string[] = [];

    // If edited nodes are provided, use them directly
    if (body.editedNodes && body.editedNodes.length > 0) {
      console.log(`[Generate] Using ${body.editedNodes.length} pre-edited nodes`);

      for (const editedNode of body.editedNodes) {
        // Skip excluded nodes
        if (editedNode._override?.excluded) {
          continue;
        }

        // Apply overrides and convert to ProxyNode
        const node: ProxyNode = {
          ...editedNode,
          // Apply custom name if set
          name: editedNode._override?.customName || editedNode.name,
        };

        // Pass through residential flag via a special property
        if (editedNode._override?.isResidential) {
          (node as any)._forceResidential = true;
        }

        // Remove internal properties before adding
        delete (node as any)._id;
        delete (node as any)._source;
        delete (node as any)._override;

        allNodes.push(node);
      }

      const excludedCount = body.editedNodes.filter(n => n._override?.excluded).length;
      if (excludedCount > 0) {
        console.log(`[Generate] Excluded ${excludedCount} nodes by user`);
      }
    } else {
      // Fetch and parse subscriptions
      if (body.subscriptions && body.subscriptions.length > 0) {
        for (const sub of body.subscriptions) {
          if (!sub.url) continue;

          try {
            console.log(`[Generate] Fetching: ${sub.url}`);

            const response = await fetch(sub.url, {
              headers: {
                'User-Agent': 'ClashMetaForAndroid/2.8.9',
                'Accept': '*/*',
              },
              signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) {
              allErrors.push(`Failed to fetch ${sub.url}: ${response.status}`);
              continue;
            }

            const content = await response.text();
            const result = parseSubscriptionContent(content, sub.prefix);

            allNodes.push(...result.nodes);
            allErrors.push(...result.errors);

            console.log(`[Generate] Parsed ${result.parsedCount} nodes from ${sub.url}`);

          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            allErrors.push(`Error fetching ${sub.url}: ${message}`);
          }
        }
      }

      // Parse manual nodes
      if (body.manualNodes && body.manualNodes.trim()) {
        const result = parseManualNodes(body.manualNodes);
        allNodes.push(...result.nodes);
        allErrors.push(...result.errors);

        console.log(`[Generate] Parsed ${result.parsedCount} manual nodes`);
      }
    }

    // Check if we have any nodes
    if (allNodes.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid nodes found',
          errors: allErrors,
        },
        { status: 400 }
      );
    }

    // Generate Clash config (for validation)
    const config = await generateClashConfig(allNodes, body.options || {});

    // Store the config using the storage adapter
    const stored = await storeConfig(storage, allNodes, body.options || {});

    // Build subscribe URL using request headers for correct host/port
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    const subscribeUrl = `${baseUrl}/api/subscribe/${stored.id}`;

    console.log(`[Generate] Created subscription: ${subscribeUrl} with ${allNodes.length} nodes`);

    return NextResponse.json({
      success: true,
      id: stored.id,
      subscribeUrl,
      stats: {
        nodeCount: allNodes.length,
        groupCount: config['proxy-groups'].length,
        errorCount: allErrors.length,
      },
      errors: allErrors.length > 0 ? allErrors : undefined,
      expiresAt: stored.expiresAt,
    });

  } catch (error) {
    console.error('[Generate] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate subscription: ${message}` },
      { status: 500 }
    );
  }
}
