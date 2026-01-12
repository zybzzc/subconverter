import { NextResponse } from "next/server";
import {
  encodeBase64,
  mergeSubscriptionSources,
  parseManualNodes,
  parseSources
} from "@/lib/subscription";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = searchParams.get("data");
  const format = searchParams.get("format") ?? "base64";

  if (!payload) {
    return NextResponse.json({ error: "缺少 data 参数" }, { status: 400 });
  }

  let decoded = "";
  try {
    decoded = Buffer.from(payload, "base64").toString("utf8");
  } catch {
    return NextResponse.json({ error: "data 参数解析失败" }, { status: 400 });
  }

  let parsed: { sources?: string; manualNodes?: string } = {};
  try {
    parsed = JSON.parse(decoded) as { sources?: string; manualNodes?: string };
  } catch {
    return NextResponse.json({ error: "data JSON 无效" }, { status: 400 });
  }

  try {
    const sources = parseSources(parsed.sources ?? "");
    const manualNodes = parseManualNodes(parsed.manualNodes ?? "");
    const merged = await mergeSubscriptionSources(sources, manualNodes);
    const joined = merged.join("\n");

    if (format === "plain") {
      return new NextResponse(joined, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }

    return new NextResponse(encodeBase64(joined), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
