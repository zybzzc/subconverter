import { NextResponse } from "next/server";
import {
  mergeSubscriptionSources,
  parseManualNodes,
  parseSources
} from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sources = parseSources(String(body.sources ?? ""));
    const manualNodes = parseManualNodes(String(body.manualNodes ?? ""));

    if (!sources.length && !manualNodes.length) {
      return NextResponse.json(
        { error: "请输入订阅地址或手动节点。" },
        { status: 400 }
      );
    }

    const merged = await mergeSubscriptionSources(sources, manualNodes);

    return NextResponse.json({ nodes: merged });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
