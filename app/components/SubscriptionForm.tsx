"use client";

import { useMemo, useState } from "react";

const defaultSourceHint = "可选格式：\n[前缀]|https://example.com/sub\nhttps://example.com/sub2";

export default function SubscriptionForm() {
  const [sources, setSources] = useState("");
  const [manualNodes, setManualNodes] = useState("");
  const [nodes, setNodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subscriptionLink = useMemo(() => {
    const payload = JSON.stringify({ sources, manualNodes });
    const encoded = typeof window === "undefined" ? "" : btoa(payload);
    if (!encoded) {
      return "";
    }
    const format = "base64";
    return `${window.location.origin}/api/subscribe?data=${encodeURIComponent(
      encoded
    )}&format=${format}`;
  }, [sources, manualNodes]);

  async function handleMerge() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources, manualNodes })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "合并失败");
      }

      setNodes(payload.nodes ?? []);
    } catch (err) {
      setNodes([]);
      setError(err instanceof Error ? err.message : "合并失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Clash Subscription Studio
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          生成可订阅的 Clash 节点集合
        </h1>
        <p className="max-w-2xl text-sm text-gray-600">
          合并多个订阅地址与手动节点，支持为订阅节点添加前缀标记，并生成可
          直接用于客户端的订阅链接。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-gray-800">订阅源</h2>
          <p className="mt-2 text-xs text-gray-500">
            每行一个订阅地址；如需前缀，使用 <code>[前缀]|URL</code> 格式。
          </p>
          <textarea
            className="mt-4 h-44 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder={defaultSourceHint}
            value={sources}
            onChange={(event) => setSources(event.target.value)}
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-gray-800">手动节点</h2>
          <p className="mt-2 text-xs text-gray-500">
            支持 ss://、vless://、vmess:// 等格式，每行一个节点。
          </p>
          <textarea
            className="mt-4 h-44 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="ss://...\nvless://..."
            value={manualNodes}
            onChange={(event) => setManualNodes(event.target.value)}
          />
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={handleMerge}
          disabled={loading}
        >
          {loading ? "合并中..." : "合并节点"}
        </button>
        <div className="text-xs text-gray-500">
          合并后将生成订阅链接，可直接用于客户端。
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-medium text-gray-800">合并结果</h2>
        <p className="mt-2 text-xs text-gray-500">
          目前仅展示合并后的节点清单（去重后）。
        </p>

        <div className="mt-4 space-y-3">
          <textarea
            readOnly
            className="h-40 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700"
            value={nodes.join("\n")}
            placeholder="合并后节点将显示在这里"
          />

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
            <p className="mb-2 text-gray-700">订阅链接</p>
            {subscriptionLink ? (
              <div className="break-all rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                {subscriptionLink}
              </div>
            ) : (
              <div className="text-gray-400">填写订阅或节点后自动生成。</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
