'use client';

import { useState, useCallback } from 'react';
import SubscriptionInput from './components/SubscriptionInput';
import NodeInput from './components/NodeInput';
import ResultPanel from './components/ResultPanel';
import LogPanel, { LogEntry, createLogEntry } from './components/LogPanel';
import GenerationOptionsPanel from './components/GenerationOptions';
import NodeEditor from './components/NodeEditor';
import type { GenerateOptions, EditableNode } from '@/lib/types';
import { Sparkles, Terminal, Rocket, Eye, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';

interface SubscriptionSource {
  id: string;
  url: string;
  prefix: string;
}

interface GenerateResult {
  subscribeUrl: string;
  stats: {
    nodeCount: number;
    groupCount: number;
    errorCount: number;
  };
  expiresAt: number;
}

export default function Home() {
  // Form state
  const [subscriptions, setSubscriptions] = useState<SubscriptionSource[]>([
    {
      id: 'sub-1',
      url: 'https://a02.fflink.cc/api/v1/client/subscribe?token=c0d2ec62de9ffddcba71f0bac6c50437',
      prefix: '[FAC]',
    },
    {
      id: 'sub-2',
      url: 'https://api.nexuscloud.li/sub?target=clash&emoji=true&udp=true&new_name=true&config=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FSleepyHeeead%2Fsubconverter-config%40master%2Fremote-config%2Fspecial%2Fbasic.ini&url=https%3A%2F%2Fnexuscloud.ch%2Fmodules%2Fservers%2Fnexus%2Fosubscribe.php%3Fsid%3D16381%26token%3DFD5meqhD%26sip002%3D1',
      prefix: '[NC]',
    },
  ]);
  const [manualNodes, setManualNodes] = useState(
    'ss://MjAyMi1ibGFrZTMtYWVzLTI1Ni1nY206SWY2TmU1MGtLeUFZY3RsMkU0cjlJZGZVQnROYWpFaHBRc2lYN2Q2c0pyYz0=@104.202.107.79:20088#[RESIP] US-SS-01\ntrojan://be79bfd8-73a5-4a3b-b831-95242353012f@104.202.107.79:20019?type=tcp&security=tls&allowInsecure=1#[RESIP] US-TROJAN-01\nvless://5145f9ef-0bd4-4639-8661-284abd3587b4@104.202.107.79:20800?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.cloudflare.com&pbk=IfwBUi9ih35s-5kGxPCcnCdEYdtj_s4U_3f3CDq52gc&fp=chrome#[RESIP] US-VLESS-01\nvless://3584c5bb-a2d4-4309-8490-aeb6040d5cff@104.202.107.79:25708?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.cloudflare.com&pbk=bpttnwImN_hlr8NbaJvHFeuPCr_KkPwz04BQIoKW7Xw&fp=chrome#[RESIP] US-VLESS-02'
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Previewed nodes for editing
  const [previewedNodes, setPreviewedNodes] = useState<EditableNode[]>([]);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  // Generation options
  const [options, setOptions] = useState<GenerateOptions>({
    groupByCountry: true,
    detectResidential: true,
    includeBusinessGroups: true,
    selectedRulesets: ['openai', 'telegram', 'google'],
    normalizeNames: false,
    customResidentialKeywords: [],
  });

  // Add log entry
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs(prev => [...prev, createLogEntry(level, message)]);
  }, []);

  // Preview nodes (fetch and parse without generating)
  const handlePreview = useCallback(async () => {
    if (subscriptions.length === 0 && !manualNodes.trim()) {
      addLog('error', '请至少添加一个订阅链接或手动输入节点');
      return;
    }

    setPreviewing(true);
    addLog('info', '正在获取节点列表...');

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptions: subscriptions.map(s => ({
            url: s.url,
            prefix: s.prefix || undefined,
          })),
          manualNodes: manualNodes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setPreviewedNodes(data.nodes);
      setShowNodeEditor(true);
      addLog('success', `成功获取 ${data.nodes.length} 个节点，可以开始编辑`);

      if (data.errors?.length > 0) {
        for (const err of data.errors.slice(0, 3)) {
          addLog('warn', err);
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      addLog('error', `预览失败: ${message}`);
    } finally {
      setPreviewing(false);
    }
  }, [subscriptions, manualNodes, addLog]);

  // Generate subscription
  const handleGenerate = useCallback(async () => {
    // If we have previewed nodes, use those
    const hasEditedNodes = previewedNodes.length > 0;

    if (!hasEditedNodes && subscriptions.length === 0 && !manualNodes.trim()) {
      addLog('error', '请至少添加一个订阅链接或手动输入节点');
      return;
    }

    setLoading(true);
    setResult(null);
    addLog('info', '开始生成订阅...');

    try {
      // Prepare request
      const requestBody: any = {
        options: { ...options },
      };

      if (hasEditedNodes) {
        // Use edited nodes directly
        requestBody.editedNodes = previewedNodes;
        addLog('info', `使用 ${previewedNodes.length} 个已编辑节点...`);
      } else {
        // Fetch from subscriptions
        requestBody.subscriptions = subscriptions.map(s => ({
          url: s.url,
          prefix: s.prefix || undefined,
        }));
        requestBody.manualNodes = manualNodes.trim() || undefined;
        addLog('info', `处理 ${subscriptions.length} 个订阅源...`);
      }

      if (options.detectResidential) addLog('info', '开启家宽识别...');
      if (options.groupByCountry) addLog('info', '开启国家分组...');
      if (options.selectedRulesets?.length) {
        addLog('info', `启用业务组: ${options.selectedRulesets.join(', ')}`);
      }

      // Call generate API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Log errors if any
      if (data.errors && data.errors.length > 0) {
        for (const err of data.errors.slice(0, 5)) {
          addLog('warn', err);
        }
        if (data.errors.length > 5) {
          addLog('warn', `...还有 ${data.errors.length - 5} 个警告`);
        }
      }

      addLog('success', `成功生成订阅！共 ${data.stats.nodeCount} 个节点`);

      setResult({
        subscribeUrl: data.subscribeUrl,
        stats: data.stats,
        expiresAt: data.expiresAt,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      addLog('error', `生成失败: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [subscriptions, manualNodes, options, previewedNodes, addLog]);

  // Reset form
  const handleClear = useCallback(() => {
    if (window.confirm('RESET SYSTEM CONSOLE?\nThis will clear all inputs and logs.')) {
      setSubscriptions([]);
      setManualNodes('');
      setResult(null);
      setPreviewedNodes([]);
      setLogs([]);
      setShowNodeEditor(false);
      addLog('info', 'System reset complete.');
    }
  }, [addLog]);

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 bg-background transition-colors font-mono">
      <div className="max-w-4xl mx-auto">

        {/* Journal Header */}
        <header className="mb-12 border-b-4 border-primary pb-6 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-primary">
              Config<br className="hidden md:block" />System.
            </h1>
            <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold">
              Clash Meta / Subscription Transform
            </p>
          </div>
          <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center rounded-full font-bold text-2xl shadow-lg shadow-primary/20">
            <ArrowUpRight className="w-8 h-8" />
          </div>
        </header>

        <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] gap-8">
          {/* Sidebar Label (Vertical Text) */}
          <div className="hidden md:block w-8 pt-4">
            <span className="text-xs font-bold text-muted-foreground rotate-180 block whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
              CONFIGURATION_MANIFEST
            </span>
          </div>

          {/* Main Content Area */}
          <div className="space-y-8">

            {/* Input Section */}
            <section className="bg-card border-y-4 border-primary p-6 md:p-8 shadow-sm">
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[10px] font-bold uppercase text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 transition-colors border border-transparent hover:border-red-200"
                  >
                    [ Reset System ]
                  </button>
                </div>
                <SubscriptionInput
                  subscriptions={subscriptions}
                  onChange={setSubscriptions}
                  disabled={loading || previewing}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-primary/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-bold">OR</span>
                  </div>
                </div>

                <NodeInput
                  value={manualNodes}
                  onChange={setManualNodes}
                  disabled={loading || previewing}
                />
              </div>
            </section>

            {/* Node Editor Section */}
            {previewedNodes.length > 0 && (
              <section className="bg-card border border-primary p-1 shadow-sm">
                <div className="bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-primary/20">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wide text-primary">Preview Data</span>
                    </div>
                    <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5">{previewedNodes.length} NODES</span>
                  </div>

                  <button
                    onClick={() => setShowNodeEditor(!showNodeEditor)}
                    className="w-full flex items-center justify-between p-3 bg-white border border-primary hover:bg-primary hover:text-white transition-colors group mb-4"
                  >
                    <span className="text-xs font-bold uppercase">Toggle Editor View</span>
                    {showNodeEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showNodeEditor && (
                    <NodeEditor
                      nodes={previewedNodes}
                      onChange={setPreviewedNodes}
                    />
                  )}
                </div>
              </section>
            )}

            {/* Options Section */}
            <section className="bg-card border border-primary/20 p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Generation Parameters</h3>
              </div>
              <GenerationOptionsPanel
                options={options}
                onChange={setOptions}
                disabled={loading || previewing}
              />
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handlePreview}
                disabled={loading || previewing || (subscriptions.length === 0 && !manualNodes.trim())}
                className="px-6 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-bold text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {previewing ? 'Scanning...' : 'Preview Data'}
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || previewing || (previewedNodes.length === 0 && subscriptions.length === 0 && !manualNodes.trim())}
                className="flex-1 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <span>Execute Compilation</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <ResultPanel
                  subscribeUrl={result.subscribeUrl}
                  stats={result.stats}
                  expiresAt={result.expiresAt}
                />
              </div>
            )}

            {/* Log Panel */}
            <div className="bg-card border border-dashed border-primary/40 p-4">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase border-b border-primary/10 pb-2">
                <Terminal className="w-3 h-3" />
                System Logs
              </div>
              <LogPanel logs={logs} />
            </div>

          </div>
        </div>

        <footer className="mt-20 border-t-2 border-primary pt-8 flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest">
          <span>Sub_Converter System v1.0</span>
          <span className="font-bold text-primary">Ready</span>
        </footer>

      </div>
    </div>
  );
}
