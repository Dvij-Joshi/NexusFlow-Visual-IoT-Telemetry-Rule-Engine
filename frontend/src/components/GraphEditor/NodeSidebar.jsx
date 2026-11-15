import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Activity,
  GitCompare,
  BellRing,
  Plus,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  GripVertical,
} from 'lucide-react';

const NODE_DEFINITIONS = [
  {
    type: 'sensor',
    title: 'Sensor Node',
    description: 'Ingests IoT device telemetry data',
    icon: Cpu,
    color: 'text-cyan-400',
    border: 'border-cyan-800/80 hover:border-cyan-400',
    bg: 'bg-cyan-950/20 hover:bg-cyan-950/40',
    badge: 'Ingress',
  },
  {
    type: 'movingAverage',
    title: 'Moving Average',
    description: 'Rolling window smoother (default: 5)',
    icon: Activity,
    color: 'text-indigo-400',
    border: 'border-indigo-800/80 hover:border-indigo-400',
    bg: 'bg-indigo-950/20 hover:bg-indigo-950/40',
    badge: 'Transform',
  },
  {
    type: 'threshold',
    title: 'Threshold Check',
    description: 'Evaluates conditional rule (>, <, ==)',
    icon: GitCompare,
    color: 'text-amber-400',
    border: 'border-amber-800/80 hover:border-amber-400',
    bg: 'bg-amber-950/20 hover:bg-amber-950/40',
    badge: 'Condition',
  },
  {
    type: 'alert',
    title: 'Alert Node',
    description: 'Dispatches notification on condition match',
    icon: BellRing,
    color: 'text-rose-400',
    border: 'border-rose-800/80 hover:border-rose-400',
    bg: 'bg-rose-950/20 hover:bg-rose-950/40',
    badge: 'Action',
  },
];

export default function NodeSidebar({ onAddNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return NODE_DEFINITIONS;
    const q = searchQuery.toLowerCase();
    return NODE_DEFINITIONS.filter(
      (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className={`relative z-10 flex flex-col border-r border-slate-800/90 bg-slate-900/95 backdrop-blur-md transition-all duration-200 select-none ${
        isCollapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-800/80 px-3.5">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Node Library
              </span>
              <p className="text-[10px] text-slate-400">Drag & drop pipeline blocks</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title={isCollapsed ? 'Expand library' : 'Collapse library'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Input */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter blocks..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>
      )}

      {/* Node Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredNodes.map((node) => {
          const Icon = node.icon;

          if (isCollapsed) {
            return (
              <button
                key={node.type}
                onClick={() => onAddNode(node.type)}
                className={`w-full p-2.5 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 transition ${node.color}`}
                title={`Add ${node.title}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          }

          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className={`group flex items-center gap-2.5 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition shadow-sm hover:shadow-md ${node.border} ${node.bg}`}
            >
              <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800/80 ${node.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-white truncate">
                    {node.title}
                  </h4>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-semibold">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{node.description}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNode(node.type);
                }}
                className="opacity-70 group-hover:opacity-100 p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                title={`Add ${node.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

