'use client';

import { useState, useCallback } from 'react';
import { Check, Copy, ExternalLink, Calendar, Server, Layers, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultPanelProps {
  subscribeUrl: string | null;
  stats: {
    nodeCount: number;
    groupCount: number;
    errorCount: number;
  } | null;
  expiresAt: number | null;
}

export default function ResultPanel({
  subscribeUrl,
  stats,
  expiresAt,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!subscribeUrl) return;

    try {
      await navigator.clipboard.writeText(subscribeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [subscribeUrl]);

  if (!subscribeUrl) return null;

  const expiresDate = expiresAt ? new Date(expiresAt) : null;

  return (
    <div className="bg-white border-2 border-primary shadow-lg shadow-black/5 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="border-b-2 border-primary bg-primary/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1 border border-primary bg-white text-primary">
            <Check className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-primary tracking-tight">SUCCESS: MANIFEST GENERATED</span>
        </div>
        {stats && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Server className="w-3.5 h-3.5" />
              <span className="font-bold text-primary">{stats.nodeCount}</span> Nodes
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              <span className="font-bold text-primary">{stats.groupCount}</span> Groups
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Copy Section */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Configuration Source URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={subscribeUrl || ''}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full h-12 bg-muted/20 border-2 border-primary/20 hover:border-primary pl-4 pr-10 text-xs font-mono text-foreground focus:border-primary outline-none transition-all cursor-pointer rounded-none font-bold"
              />
              {subscribeUrl && (
                <a
                  href={subscribeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={copyToClipboard}
              className={cn(
                "px-6 h-12 rounded-none font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-2",
                copied
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expiry */}
          {expiresDate && (
            <div className="p-3 bg-white border border-dashed border-orange-400 flex items-start gap-3">
              <div className="p-1 bg-orange-50 text-orange-600 border border-orange-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-orange-700 uppercase">EXPIRATION DATE</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 font-mono" title={expiresDate.toLocaleString()}>
                  {expiresDate.toLocaleDateString()} {expiresDate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* Stats Warn */}
          {(stats?.errorCount || 0) > 0 && (
            <div className="p-3 bg-red-50 border border-red-500 flex items-start gap-3">
              <div className="p-1 bg-white border border-red-500 text-red-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-700 uppercase">Parsing Errors</div>
                <div className="text-[11px] text-red-600 mt-0.5 font-mono">
                  {stats?.errorCount} nodes failed to process.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usage */}
        <div className="pt-4 border-t-2 border-primary/10">
          <h4 className="text-xs font-bold text-primary mb-2 uppercase">Installation Instructions</h4>
          <ol className="list-decimal list-inside text-xs text-muted-foreground leading-relaxed space-y-1 font-mono">
            <li>Click <span className="text-primary font-bold mx-1">COPY</span> to get the configuration URL.</li>
            <li>Open your compatible client (Clash Meta, Stash, etc).</li>
            <li>Navigate to Profiles/Config -&gt; Add New -&gt; Paste URL.</li>
            <li>Update/Refresh to load the node manifest.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
