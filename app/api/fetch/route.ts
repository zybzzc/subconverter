/**
 * API: Fetch subscription content
 * POST /api/fetch
 * 
 * Fetches a subscription URL and parses the nodes
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseSubscriptionContent } from '@/lib/parsers';

// Enable Edge Runtime for Cloudflare compatibility
export const runtime = 'edge';

interface FetchRequest {
  url: string;
  prefix?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FetchRequest = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the subscription
    console.log(`[Fetch] Fetching subscription: ${body.url}`);

    const response = await fetch(body.url, {
      headers: {
        'User-Agent': 'ClashMetaForAndroid/2.8.9',
        'Accept': '*/*',
      },
      // Set timeout
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch subscription: ${response.status} ${response.statusText}`,
          status: response.status,
        },
        { status: 502 }
      );
    }

    const content = await response.text();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subscription returned empty content' },
        { status: 502 }
      );
    }

    console.log(`[Fetch] Received ${content.length} bytes, parsing...`);

    // Parse the subscription content
    const result = parseSubscriptionContent(content, body.prefix);

    console.log(`[Fetch] Parsed ${result.parsedCount}/${result.rawCount} nodes, errors: ${result.errors.length}`);

    return NextResponse.json({
      success: true,
      nodes: result.nodes,
      errors: result.errors,
      stats: {
        rawCount: result.rawCount,
        parsedCount: result.parsedCount,
        errorCount: result.errors.length,
      },
    });

  } catch (error) {
    console.error('[Fetch] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle timeout
    if (message.includes('timeout') || message.includes('aborted')) {
      return NextResponse.json(
        { error: 'Request timeout: subscription fetch took too long' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Failed to process subscription: ${message}` },
      { status: 500 }
    );
  }
}
