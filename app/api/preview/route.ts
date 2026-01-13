/**
 * API: Preview nodes from subscriptions
 * POST /api/preview
 * 
 * Fetches and parses subscriptions, returns editable node list
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseSubscriptionContent, parseManualNodes } from '@/lib/parsers';
import type { EditableNode, SubscriptionSource } from '@/lib/types';

// Enable Edge Runtime for Cloudflare compatibility
export const runtime = 'edge';

interface PreviewRequest {
  subscriptions?: SubscriptionSource[];
  manualNodes?: string;
}

/**
 * Generate a unique ID for each node
 */
function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();

    const allNodes: EditableNode[] = [];
    const allErrors: string[] = [];

    // Fetch and parse subscriptions
    if (body.subscriptions && body.subscriptions.length > 0) {
      for (const sub of body.subscriptions) {
        if (!sub.url) continue;

        try {
          console.log(`[Preview] Fetching: ${sub.url}`);

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

          // Convert to EditableNode with IDs and source info
          for (const node of result.nodes) {
            allNodes.push({
              ...node,
              _id: generateNodeId(),
              _source: sub.prefix || undefined,
            });
          }
          allErrors.push(...result.errors);

          console.log(`[Preview] Parsed ${result.parsedCount} nodes from ${sub.url}`);

        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          allErrors.push(`Error fetching ${sub.url}: ${message}`);
        }
      }
    }

    // Parse manual nodes
    if (body.manualNodes && body.manualNodes.trim()) {
      const result = parseManualNodes(body.manualNodes);

      for (const node of result.nodes) {
        allNodes.push({
          ...node,
          _id: generateNodeId(),
          _source: 'manual',
        });
      }
      allErrors.push(...result.errors);

      console.log(`[Preview] Parsed ${result.parsedCount} manual nodes`);
    }

    console.log(`[Preview] Total nodes: ${allNodes.length}, Errors: ${allErrors.length}`);

    return NextResponse.json({
      success: true,
      nodes: allNodes,
      stats: {
        nodeCount: allNodes.length,
        errorCount: allErrors.length,
      },
      errors: allErrors.length > 0 ? allErrors : undefined,
    });

  } catch (error) {
    console.error('[Preview] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to preview nodes: ${message}` },
      { status: 500 }
    );
  }
}
