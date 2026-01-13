'use client';

import { useState, useEffect } from 'react';
import { X, Save, Home, Tag } from 'lucide-react';
import type { EditableNode, NodeOverride } from '@/lib/types';

interface NodeEditModalProps {
  node: EditableNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, override: NodeOverride) => void;
}

export default function NodeEditModal({ node, isOpen, onClose, onSave }: NodeEditModalProps) {
  const [customName, setCustomName] = useState('');
  const [isResidential, setIsResidential] = useState(false);
  const [excluded, setExcluded] = useState(false);

  // Reset form when node changes
  useEffect(() => {
    if (node) {
      setCustomName(node._override?.customName || '');
      setIsResidential(node._override?.isResidential || false);
      setExcluded(node._override?.excluded || false);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSave = () => {
    const override: NodeOverride = {};

    if (customName.trim() && customName !== node.name) {
      override.customName = customName.trim();
    }
    if (isResidential) {
      override.isResidential = true;
    }
    if (excluded) {
      override.excluded = true;
    }

    onSave(node._id, Object.keys(override).length > 0 ? override : undefined as any);
    onClose();
  };

  const originalName = node.name;
  const displayName = node._override?.customName || node.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">编辑节点</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Original name display */}
          <div className="text-sm">
            <span className="text-muted-foreground">原始名称: </span>
            <span className="text-foreground font-mono text-xs bg-muted px-2 py-1 rounded">
              {originalName}
            </span>
          </div>

          {/* Custom name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              自定义名称
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={originalName}
              className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <p className="text-xs text-muted-foreground">
              留空则使用原始名称
            </p>
          </div>

          {/* Residential toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">标记为家宽节点</span>
            </div>
            <button
              onClick={() => setIsResidential(!isResidential)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isResidential ? 'bg-amber-500' : 'bg-muted'
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isResidential ? 'translate-x-5' : ''
                  }`}
              />
            </button>
          </div>

          {/* Exclude toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-foreground">排除此节点</span>
            </div>
            <button
              onClick={() => setExcluded(!excluded)}
              className={`relative w-11 h-6 rounded-full transition-colors ${excluded ? 'bg-red-500' : 'bg-muted'
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${excluded ? 'translate-x-5' : ''
                  }`}
              />
            </button>
          </div>

          {/* Node info */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
            <div>类型: <span className="text-foreground">{node.type}</span></div>
            <div>服务器: <span className="text-foreground font-mono">{node.server}:{node.port}</span></div>
            {node._source && (
              <div>来源: <span className="text-foreground">{node._source}</span></div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
