import React, { useState } from 'react';
import { Cpu, Activity, GitCompare, BellRing, Plus, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const NODE_DEFINITIONS = [
  {
    type: 'sensor',
    title: 'Sensor Node',
    description: 'Ingests IoT device telemetry',
    icon: Cpu,
    color: 'text-cyan-400',
    border: 'border-cyan-800/80 hover:border-cyan-500',
    bg: 'bg-cyan-950/20 hover:bg-cyan-950/40',
    badge: 'Source',
  },
  {
    type: 'movingAverage',
    title: 'Moving Average',
    description: 'Rolling window smoother (default: 5)',
    icon: Activity,
    color: 'text-indigo-400',
    border: 'border-indigo-800/80 hover:border-indigo-500',
    bg: 'bg-indigo-950/20 hover:bg-indigo-950/40',
    badge: 'Transform',
  },
  {
    type: 'threshold',
    title: 'Threshold Check',
    description: 'Evaluates conditional rule (>, <, ==)',
    icon: GitCompare,
    color: 'text-amber-400',
    border: 'border-amber-800/80 hover:border-amber-500',
    bg: 'bg-amber-950/20 hover:bg-amber-950/40',
    badge: 'Condition',
  },
  {
    type: 'alert',
    title: 'Alert Node',
    description: 'Triggers notification on rule match',
    icon: BellRing,
    color: 'text-rose-400',
    border: 'border-rose-800/80 hover:border-rose-500',
    bg: 'bg-rose-950/20 hover:bg-rose-950/40',
    badge: 'Action',
  },
];

export default function NodeSidebar({ onAddNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className={`relative z-10 flex flex-col border-r border-slate-800 bg-slate-900/95 transition-all duration-200 select-none ${isCollapsed ? 'w-12' : 'w-64'
        }`}
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-slate-800 px-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Node Library
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
          title={isCollapsed ? 'Expand library' : 'Collapse library'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Node Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {!isCollapsed && (
          <div className="px-1 text-[11px] text-slate-400">
            Drag onto canvas or click <span className="text-cyan-400">+</span> to place.
          </div>
        )}

        {NODE_DEFINITIONS.map((node) => {
          const Icon = node.icon;

          if (isCollapsed) {
            return (
              <button
                key={node.type}
                onClick={() => onAddNode(node.type)}
                className={`w-full p-2 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800 transition ${node.color}`}
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
              className={`group flex items-start gap-2.5 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition ${node.border} ${node.bg}`}
            >
              <div className={`p-1.5 rounded-md bg-slate-950 border border-slate-800 ${node.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {node.title}
                  </h4>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
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
                className="opacity-60 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
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

