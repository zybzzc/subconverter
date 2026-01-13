'use client';

import { useState, useRef, useCallback } from 'react';
import { Link, Plus, Trash2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionSource {
  id: string;
  url: string;
  prefix: string;
}

interface SubscriptionInputProps {
  subscriptions: SubscriptionSource[];
  onChange: (subscriptions: SubscriptionSource[]) => void;
  disabled?: boolean;
}

export default function SubscriptionInput({
  subscriptions,
  onChange,
  disabled = false,
}: SubscriptionInputProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newPrefix, setNewPrefix] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addSubscription = useCallback(() => {
    const url = newUrl.trim();
    if (!url) return;

    // Validate URL (Standard loose check)
    if (!/^https?:\/\//i.test(url)) {
      // alert('请输入有效的 URL (需以 http:// 或 https:// 开头)');
      // Use local validation UI state instead of alert in generic input, but for now just basic valid
    }

    const newSub: SubscriptionSource = {
      id: `sub-${Date.now()}`,
      url,
      prefix: newPrefix.trim(),
    };

    onChange([...subscriptions, newSub]);
    setNewUrl('');
    setNewPrefix('');
    inputRef.current?.focus();
  }, [newUrl, newPrefix, subscriptions, onChange]);

  const removeSubscription = useCallback((id: string) => {
    onChange(subscriptions.filter(s => s.id !== id));
  }, [subscriptions, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addSubscription();
    }
  }, [addSubscription]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
          <Link className="w-4 h-4" />
          External Sources
        </label>
        <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5">
          COUNT: {subscriptions.length}
        </span>
      </div>

      {/* Subscription list */}
      <div className="space-y-1">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="group flex gap-3 p-3 bg-white border border-primary/20 hover:border-primary transition-all items-center shadow-sm"
          >
            <div className="p-1 border border-primary/10 bg-primary/5">
              <Link className="w-3 h-3 text-primary" />
            </div>

            <div className="flex-1 min-w-0 grid gap-0.5">
              <div className="text-sm font-medium text-foreground truncate font-mono" title={sub.url}>
                {sub.url}
              </div>
              {sub.prefix && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-primary/80 px-1 py-0.5 uppercase tracking-wide">
                    TAG: {sub.prefix}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeSubscription(sub.id)}
              disabled={disabled}
              className="p-2 text-muted-foreground hover:text-white hover:bg-destructive rounded-none transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 border border-transparent hover:border-destructive"
              title="Remove Source"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add new subscription Input Group */}
        <div className="flex gap-2 items-start pt-2">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <input
                  ref={inputRef}
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="SOURCE_URL (https://...)"
                  disabled={disabled}
                  className="w-full px-3 h-10 bg-background border border-primary/30 rounded-none text-sm font-mono focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/40 text-primary"
                  autoComplete="off"
                />
              </div>

              <div className="relative w-32 group">
                <input
                  type="text"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="TAG"
                  disabled={disabled}
                  className="w-full px-3 h-10 bg-background border border-primary/30 rounded-none text-sm font-mono focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addSubscription}
            disabled={disabled || !newUrl.trim()}
            className={cn(
              "h-10 px-4 flex items-center justify-center rounded-none border transition-all font-bold uppercase text-xs tracking-wider",
              newUrl.trim()
                ? "bg-primary text-white border-primary hover:opacity-90 shadow-[2px_2px_0_0_rgb(30,58,138,0.2)]"
                : "bg-muted border-transparent text-muted-foreground cursor-not-allowed"
            )}
            title="Import Source"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
