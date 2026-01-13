'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Network, Clipboard, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Supported protocols
const PROTOCOLS = ['ss://', 'vmess://', 'vless://', 'trojan://', 'hysteria2://', 'hy2://', 'tuic://'];

export default function NodeInput({
  value,
  onChange,
  disabled = false,
}: NodeInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);

  // Check clipboard for proxy URIs
  const checkClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard) return;

      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();

      // Check if it looks like a proxy URI
      if (PROTOCOLS.some(p => trimmed.startsWith(p))) {
        // Don't show hint if already in textarea
        if (!value.includes(trimmed)) {
          setClipboardHint(trimmed);
        }
      }
    } catch {
      // Clipboard access denied, ignore
    }
  }, [value]);

  // Check clipboard on focus
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleFocus = () => {
      checkClipboard();
    };

    textarea.addEventListener('focus', handleFocus);
    return () => textarea.removeEventListener('focus', handleFocus);
  }, [checkClipboard]);

  // Paste from clipboard hint
  const pasteFromHint = useCallback(() => {
    if (!clipboardHint) return;

    const newValue = value ? `${value}\n${clipboardHint}` : clipboardHint;
    onChange(newValue);
    setClipboardHint(null);
    textareaRef.current?.focus();
  }, [clipboardHint, value, onChange]);

  // Dismiss hint
  const dismissHint = useCallback(() => {
    setClipboardHint(null);
  }, []);

  // Count valid lines
  const lineCount = value.split('\n').filter(l => {
    const t = l.trim();
    return t && PROTOCOLS.some(p => t.startsWith(p));
  }).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
          <Network className="w-4 h-4" />
          Manual Node Entry
        </label>
        <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5">
          LINES: {lineCount}
        </span>
      </div>

      <div className="space-y-3">
        {/* Clipboard hint */}
        {clipboardHint && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="p-1 border border-primary/10 bg-white">
              <Clipboard className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-primary uppercase">Clipboard Detected</div>
              <div className="text-[10px] text-muted-foreground truncate font-mono">{clipboardHint}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={pasteFromHint}
                className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:opacity-90 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Paste
              </button>
              <button
                type="button"
                onClick={dismissHint}
                className="text-muted-foreground hover:text-black p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`One node per line. Protocols supported:\nss://...\nvmess://...\nvless://...`}
            disabled={disabled}
            rows={5}
            className="w-full bg-background border border-primary/30 rounded-none p-3 text-xs font-mono text-foreground focus:border-primary focus:ring-0 outline-none resize-none placeholder:text-muted-foreground/40 transition-all custom-scrollbar leading-relaxed"
          />
          <div className="absolute right-0 bottom-0 text-[9px] font-bold text-primary/40 select-none bg-primary/5 px-2 py-1 uppercase border-t border-l border-primary/20">
            Protocols: SS / VMESS / VLESS
          </div>
        </div>
      </div>
    </div>
  );
}
