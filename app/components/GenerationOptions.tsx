import { useState } from 'react';
import type { GenerateOptions } from '@/lib/types';
import { BUSINESS_GROUPS } from '@/lib/clash/business-groups';
import { cn } from '@/lib/utils';
import {
  Settings,
  Layers,
  Wrench,
  Globe,
  Home,
  Check,
  Info,
  BoxSelect,
  Sparkles
} from 'lucide-react';

interface Props {
  options: GenerateOptions;
  onChange: (options: GenerateOptions) => void;
  disabled?: boolean;
}

export default function GenerationOptionsPanel({ options, onChange, disabled }: Props) {
  const [activeTab, setActiveTab] = useState<'general' | 'groups' | 'advanced'>('general');

  const handleToggle = (key: keyof GenerateOptions) => {
    onChange({ ...options, [key]: !options[key] });
  };

  const handleBusinessToggle = (id: string) => {
    const current = options.selectedRulesets || [];
    const next = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    onChange({ ...options, selectedRulesets: next });
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    onChange({ ...options, customResidentialKeywords: keywords });
  };

  const selectAllGroups = () => {
    onChange({ ...options, selectedRulesets: BUSINESS_GROUPS.map(g => g.id) });
  };

  return (
    <div className="border border-primary/20 bg-background shadow-sm flex flex-col transition-all">
      {/* Tabs Header */}
      <div className="flex border-b border-primary/20 bg-muted/10">
        {[
          { id: 'general', label: 'GENERAL', icon: Settings },
          { id: 'groups', label: 'GROUPS', icon: Layers },
          { id: 'advanced', label: 'ADVANCED', icon: Wrench },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              disabled={disabled}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all outline-none select-none relative",
                isActive
                  ? "text-primary bg-background border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-b border-transparent"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 min-h-[260px] bg-background">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country Grouping */}
              <div
                className={cn(
                  "p-4 border cursor-pointer transition-all relative group overflow-hidden",
                  options.groupByCountry
                    ? "bg-primary/5 border-primary shadow-[2px_2px_0_0_rgb(30,58,138,0.1)]"
                    : "bg-background border-primary/20 hover:border-primary/50"
                )}
                onClick={() => !disabled && handleToggle('groupByCountry')}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5", options.groupByCountry ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wide">Auto-Group: Country</span>
                  </div>
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors",
                    options.groupByCountry ? "bg-primary border-primary" : "border-primary/30"
                  )}>
                    {options.groupByCountry && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed pl-9 relative z-10">
                  Automatically categorize nodes by country (HK, JP, US, etc.) into separate strategy groups.
                </p>
              </div>

              {/* Residential Detection */}
              <div
                className={cn(
                  "p-4 border cursor-pointer transition-all relative group overflow-hidden",
                  options.detectResidential
                    ? "bg-primary/5 border-primary shadow-[2px_2px_0_0_rgb(30,58,138,0.1)]"
                    : "bg-background border-primary/20 hover:border-primary/50"
                )}
                onClick={() => !disabled && handleToggle('detectResidential')}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5", options.detectResidential ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wide">Isolate Residential</span>
                  </div>
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors",
                    options.detectResidential ? "bg-primary border-primary" : "border-primary/30"
                  )}>
                    {options.detectResidential && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed pl-9 relative z-10">
                  Quarantine high-multiplier or residential nodes to prevent accidental data usage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Business Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center px-1 border-b border-primary/10 pb-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <BoxSelect className="w-3.5 h-3.5" />
                Target Strategy Groups
              </div>
              <button
                type="button"
                className="text-[10px] font-bold uppercase text-primary hover:underline transition-all"
                onClick={selectAllGroups}
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {BUSINESS_GROUPS.map(group => {
                const isActive = (options.selectedRulesets || []).includes(group.id);
                return (
                  <div
                    key={group.id}
                    onClick={() => !disabled && handleBusinessToggle(group.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 border cursor-pointer transition-all hover:bg-primary/5",
                      isActive
                        ? "bg-primary/5 border-primary"
                        : "bg-background border-primary/20 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 border flex items-center justify-center transition-colors flex-shrink-0",
                      isActive ? "bg-primary border-primary text-white" : "border-primary/30 bg-background"
                    )}>
                      {isActive && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs uppercase text-foreground flex items-center gap-2">
                        {group.groupName}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {group.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-1">
                <Wrench className="w-3.5 h-3.5 text-primary" />
                Custom Isolation Keywords
              </label>
              <textarea
                className="w-full h-32 bg-white border border-primary/30 p-3 text-xs font-mono text-foreground focus:border-primary focus:ring-0 outline-none resize-none placeholder:text-muted-foreground/50 transition-all custom-scrollbar rounded-none shadow-sm"
                placeholder={`One keyword per line.\nExample:\n0.1x\nReset\nIPv6`}
                disabled={disabled}
                onChange={e => handleKeywordsChange(e.target.value)}
                defaultValue={options.customResidentialKeywords?.join('\n')}
              />
              <div className="text-[10px] text-muted-foreground bg-primary/5 p-2.5 border-l-2 border-primary flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary mt-0.5" />
                <span>
                  Nodes matching these keywords will be forced into the "🏠 Residential/Isolation" group.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-primary/20 opacity-60 grayscale cursor-not-allowed">
              <div className="flex items-center justify-between p-3 border border-primary/20 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-1.5">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase">AI Auto-Rename</div>
                    <div className="text-[10px] text-muted-foreground">Standardize node names via LLM</div>
                  </div>
                </div>
                <span className="text-[9px] border border-primary text-primary px-2 py-0.5 font-bold uppercase">Planned</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
