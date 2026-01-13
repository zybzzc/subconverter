'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface LogEntry {
  id: string;
  time: Date;
  level: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

interface LogPanelProps {
  logs: LogEntry[];
  maxHeight?: number;
}

const LEVEL_ICONS = {
  info: Info,
  success: CheckCircle2,
  warn: AlertTriangle,
  error: XCircle,
};

const LEVEL_COLORS = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warn: 'text-yellow-500',
  error: 'text-red-500',
};

export default function LogPanel({
  logs,
  maxHeight = 300,
}: LogPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/30 space-y-2">
        <Clock className="w-8 h-8" />
        <span className="text-xs">暂无操作日志</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white border-l-2 border-primary/20 p-2 overflow-y-auto font-mono text-[10px] leading-relaxed custom-scrollbar max-h-[200px]"
      style={{ maxHeight }}
    >
      <div className="flex flex-col gap-1">
        {logs.map((log) => {
          // const Icon = LEVEL_ICONS[log.level] || Info;
          // Simple text based logs for Journal feel
          return (
            <div key={log.id} className="flex gap-2 group items-start hover:bg-neutral-50 px-1 py-0.5 transition-colors border-b border-transparent hover:border-neutral-100">
              <span className="text-neutral-400 shrink-0 select-none w-14">
                {log.time.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>

              <span className={cn(
                "uppercase font-bold w-16 shrink-0",
                log.level === 'error' ? "text-red-600" :
                  log.level === 'success' ? "text-green-600" :
                    log.level === 'warn' ? "text-amber-600" : "text-primary/70"
              )}>
                [{log.level}]
              </span>

              <span className={cn(
                "break-all flex-1 text-neutral-600",
                log.level === 'error' ? "text-red-800" : ""
              )}>
                {log.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to create log entry
export function createLogEntry(
  level: LogEntry['level'],
  message: string
): LogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: new Date(),
    level,
    message,
  };
}
