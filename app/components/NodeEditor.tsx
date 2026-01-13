'use client';

import { useState, useMemo } from 'react';
import { Search, Edit2, Home, X, CheckSquare, Square, Filter, ChevronDown } from 'lucide-react';
import type { EditableNode, NodeOverride } from '@/lib/types';
import NodeEditModal from './NodeEditModal';

interface NodeEditorProps {
  nodes: EditableNode[];
  onChange: (nodes: EditableNode[]) => void;
}

export default function NodeEditor({ nodes, onChange }: NodeEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<EditableNode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'residential' | 'excluded'>('all');

  // Filter nodes based on search term and filter type
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Search filter
      const displayName = node._override?.customName || node.name;
      const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Type filter
      if (filterType === 'residential') {
        return node._override?.isResidential === true;
      }
      if (filterType === 'excluded') {
        return node._override?.excluded === true;
      }
      return true;
    });
  }, [nodes, searchTerm, filterType]);

  // Stats
  const stats = useMemo(() => ({
    total: nodes.length,
    residential: nodes.filter(n => n._override?.isResidential).length,
    excluded: nodes.filter(n => n._override?.excluded).length,
    selected: selectedIds.size,
  }), [nodes, selectedIds]);

  // Handle node override save
  const handleSaveOverride = (nodeId: string, override: NodeOverride | undefined) => {
    const updated = nodes.map(node => {
      if (node._id === nodeId) {
        return { ...node, _override: override };
      }
      return node;
    });
    onChange(updated);
  };

  // Toggle selection
  const toggleSelect = (nodeId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(nodeId)) {
      newSelected.delete(nodeId);
    } else {
      newSelected.add(nodeId);
    }
    setSelectedIds(newSelected);
  };

  // Select all filtered
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNodes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNodes.map(n => n._id)));
    }
  };

  // Batch mark as residential
  const batchMarkResidential = () => {
    const updated = nodes.map(node => {
      if (selectedIds.has(node._id)) {
        return {
          ...node,
          _override: { ...node._override, isResidential: true },
        };
      }
      return node;
    });
    onChange(updated);
    setSelectedIds(new Set());
  };

  // Batch exclude
  const batchExclude = () => {
    const updated = nodes.map(node => {
      if (selectedIds.has(node._id)) {
        return {
          ...node,
          _override: { ...node._override, excluded: true },
        };
      }
      return node;
    });
    onChange(updated);
    setSelectedIds(new Set());
  };

  // Quick toggle residential
  const toggleResidential = (nodeId: string) => {
    const node = nodes.find(n => n._id === nodeId);
    if (!node) return;

    handleSaveOverride(nodeId, {
      ...node._override,
      isResidential: !node._override?.isResidential,
    });
  };

  // Quick toggle exclude
  const toggleExclude = (nodeId: string) => {
    const node = nodes.find(n => n._id === nodeId);
    if (!node) return;

    handleSaveOverride(nodeId, {
      ...node._override,
      excluded: !node._override?.excluded,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH NODE / SERVER / TYPE..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-primary/30 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all rounded-none uppercase font-bold text-primary"
          />
        </div>

        {/* Filter dropdown */}
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/70" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="h-10 pl-9 pr-8 bg-white border border-primary/30 text-xs font-bold uppercase text-primary focus:outline-none focus:border-primary appearance-none rounded-none cursor-pointer hover:bg-primary/5 transition-colors"
            >
              <option value="all">ALL NODES</option>
              <option value="residential">RESIDENTIAL</option>
              <option value="excluded">EXCLUDED</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Batch actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-2 bg-primary/10 border-l-4 border-primary">
          <span className="text-xs font-bold uppercase text-primary tracking-wide">
            SELECTED: <strong className="ml-1 text-foreground">{selectedIds.size}</strong>
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={batchMarkResidential}
              className="px-3 h-8 text-[10px] font-bold uppercase bg-white border border-amber-500 text-amber-700 hover:bg-amber-50 transition-colors flex items-center gap-1 rounded-none"
            >
              <Home className="w-3 h-3" />
              Mark Residential
            </button>
            <button
              onClick={batchExclude}
              className="px-3 h-8 text-[10px] font-bold uppercase bg-white border border-red-500 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1 rounded-none"
            >
              <X className="w-3 h-3" />
              Exclude
            </button>
          </div>
        </div>
      )}

      {/* Node list */}
      <div className="border border-primary/20 bg-white">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary">
          <button
            onClick={toggleSelectAll}
            className="p-1 hover:bg-primary/10 transition-colors mr-2 text-primary"
          >
            {selectedIds.size === filteredNodes.length && filteredNodes.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4 opacity-50" />
            )}
          </button>
          <span className="flex-1">Node Identifier</span>
          <span className="w-20 text-center">Protocol</span>
          <span className="w-24 text-center">Actions</span>
        </div>

        {/* Node rows */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredNodes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
              {searchTerm ? 'No Data Found' : 'No Data Available'}
            </div>
          ) : (
            filteredNodes.map((node) => {
              const displayName = node._override?.customName || node.name;
              const isSelected = selectedIds.has(node._id);
              const isResidential = node._override?.isResidential;
              const isExcluded = node._override?.excluded;

              return (
                <div
                  key={node._id}
                  className={`flex items-center gap-2 px-4 py-2 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors font-mono ${isExcluded ? 'opacity-50 bg-neutral-100 grayscale' : ''
                    } ${isResidential ? 'bg-amber-50/50' : ''}`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(node._id)}
                    className="p-1 hover:bg-primary/10 transition-colors mr-2 text-primary"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 opacity-30" />
                    )}
                  </button>

                  {/* Name */}
                  <div className="flex-1 min-w-0 grid gap-0.5">
                    <div className={`text-xs font-medium truncate ${isExcluded ? 'line-through decoration-red-500' : 'text-foreground'}`}>
                      {displayName}
                    </div>
                    {node._override?.customName && (
                      <div className="text-[10px] text-muted-foreground truncate uppercase">
                        ORIG: {node.name}
                      </div>
                    )}
                    <div className="flex gap-2 mt-0.5">
                      {isResidential && (
                        <span className="px-1 py-[1px] text-[9px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 leading-none">
                          RESIDENTIAL
                        </span>
                      )}
                      {isExcluded && (
                        <span className="px-1 py-[1px] text-[9px] font-bold uppercase bg-red-100 text-red-700 border border-red-200 leading-none">
                          EXCLUDED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Type */}
                  <span className="w-20 text-center text-[10px] text-muted-foreground uppercase border-x border-primary/5">
                    {node.type}
                  </span>

                  {/* Actions */}
                  <div className="w-24 flex items-center justify-center gap-1 pl-2">
                    <button
                      onClick={() => setEditingNode(node)}
                      className="p-1.5 hover:bg-primary hover:text-white transition-colors border border-transparent hover:border-primary/50"
                      title="EDIT"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleResidential(node._id)}
                      className={`p-1.5 hover:bg-amber-500 hover:text-white transition-colors border border-transparent ${isResidential ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-muted-foreground'
                        }`}
                      title={isResidential ? 'UNMARK RESIDENTIAL' : 'MARK RESIDENTIAL'}
                    >
                      <Home className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleExclude(node._id)}
                      className={`p-1.5 hover:bg-red-500 hover:text-white transition-colors border border-transparent ${isExcluded ? 'text-red-600 bg-red-50 border-red-200' : 'text-muted-foreground'
                        }`}
                      title={isExcluded ? 'RESTORE' : 'EXCLUDE'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-muted-foreground border-t border-primary/20 pt-2">
        <span>TOTAL: <strong className="text-primary">{stats.total}</strong></span>
        {stats.residential > 0 && (
          <span>RESIDENTIAL: <strong className="text-amber-600">{stats.residential}</strong></span>
        )}
        {stats.excluded > 0 && (
          <span>EXCLUDED: <strong className="text-red-600">{stats.excluded}</strong></span>
        )}
      </div>

      {/* Edit Modal */}
      <NodeEditModal
        node={editingNode}
        isOpen={editingNode !== null}
        onClose={() => setEditingNode(null)}
        onSave={handleSaveOverride}
      />
    </div>
  );
}
